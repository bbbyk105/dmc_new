import "server-only";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CHECKOUT_MINUTES, HOLD_MINUTES, paymentIntentId, stripe } from "@/lib/stripe";
import { getBooking, getService, isSlotAvailable } from "@/lib/db/reserve";
import { jstInstant } from "@/lib/reserve/schedule";
import { formatSlot } from "@/lib/reserve/format";
import { parseBookingRequest, type BookingField } from "@/lib/reserve/validate";
import { sendBookingConfirmed, sendBookingConflictRefunded } from "@/lib/mail/notify";
import type { BookingRow } from "@/lib/db/types";
import { clientKeyOf, newCode, newReleaseToken } from "./ids";

export type StartCheckoutResult =
  | { ok: true; url: string }
  | {
      ok: false;
      status: number;
      error: "invalid" | "not_found" | "unavailable" | "too_many_holds";
      fields?: BookingField[];
    };

/** Postgres の排他制約の違反（同じ時間に予約がある） */
const EXCLUSION_VIOLATION = "23P01";
/** 予約番号が偶然重なった */
const UNIQUE_VIOLATION = "23505";

/**
 * 予約の支払いを始める。枠を仮押さえしてから Stripe Checkout のセッションを作り、その URL を返す。
 * 料金はデータベースのプランから計算する（ブラウザから届いた金額は使わない）
 */
export async function startBookingCheckout(
  body: unknown,
  ctx: { origin: string; headers: Headers },
): Promise<StartCheckoutResult> {
  const parsed = parseBookingRequest(body);
  if (!parsed.ok) return { ok: false, status: 400, error: "invalid", fields: parsed.errors };
  const req = parsed.value;

  const service = await getService(req.serviceId);
  const option = service?.service_options.find((o) => o.id === req.optionId);
  if (!service || !option) return { ok: false, status: 404, error: "not_found" };
  if (req.people > option.max_people) return { ok: false, status: 400, error: "invalid", fields: ["people"] };

  if (!(await isSlotAvailable({ service, option, date: req.date, time: req.time }))) {
    return { ok: false, status: 409, error: "unavailable" };
  }

  const releaseToken = newReleaseToken();
  let booking: BookingRow | null = null;
  for (let attempt = 0; attempt < 3 && !booking; attempt++) {
    const { data, error } = await supabaseAdmin().rpc("hold_booking", {
      p_service_id: service.id,
      p_option_id: option.id,
      p_starts_at: jstInstant(req.date, req.time).toISOString(),
      p_people: req.people,
      p_customer_name: req.name,
      p_customer_email: req.email,
      p_customer_phone: req.phone,
      p_customer_note: req.note,
      p_locale: req.locale,
      p_code: newCode("R"),
      p_release_token: releaseToken,
      p_client_key: clientKeyOf(ctx.headers),
      p_hold_minutes: HOLD_MINUTES,
    });
    if (!error) {
      booking = data as BookingRow;
      break;
    }
    if (error.code === EXCLUSION_VIOLATION) return { ok: false, status: 409, error: "unavailable" };
    if (error.message.includes("too_many_holds")) return { ok: false, status: 429, error: "too_many_holds" };
    if (error.code === UNIQUE_VIOLATION && error.message.includes("code")) continue;
    throw error;
  }
  if (!booking) throw new Error("予約番号を作れませんでした");

  const en = req.locale === "en";
  try {
    const session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        // カードだけ（Apple Pay・Google Pay を含む）。コンビニ払いなど後から入金される方法は、仮押さえの期限と合わないので出さない
        allowed_payment_method_types: ["card"],
        customer_email: booking.customer_email,
        locale: en ? "en" : "ja",
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: "jpy",
              unit_amount: booking.amount,
              product_data: {
                name: `${en ? service.name_en : service.name_ja} / ${en ? option.name_en : option.name_ja}`,
                description: `${formatSlot(new Date(booking.starts_at), new Date(booking.ends_at), req.locale)} / ${en ? `${booking.people} guest(s)` : `${booking.people}名`}`,
              },
            },
          },
        ],
        metadata: { kind: "booking", booking_id: booking.id, code: booking.code },
        // 支払いのボタンの近くにも、確定の時期とキャンセル料を出す（最終確認の画面）
        custom_text: {
          submit: {
            message: en
              ? "Your booking is confirmed when payment is complete. Cancellations within 48 hours of the start time are charged 50%, and within 24 hours 100%."
              : "お支払いが済んだ時点でご予約が確定します。開始の48時間前を過ぎてからのキャンセルは料金の50%、24時間前を過ぎてからは100%がかかります。",
          },
        },
        payment_intent_data: {
          description: `予約 ${booking.code}`,
          metadata: { kind: "booking", booking_id: booking.id, code: booking.code },
        },
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_MINUTES * 60,
        success_url: `${ctx.origin}/${req.locale}/reserve/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.origin}/${req.locale}/reserve?service=${service.id}&release=${releaseToken}`,
      },
      { idempotencyKey: `booking-checkout-${booking.id}` },
    );
    const { error } = await supabaseAdmin()
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);
    if (error) throw error;
    if (!session.url) throw new Error("Stripe の URL がありません");
    return { ok: true, url: session.url };
  } catch (error) {
    await supabaseAdmin().rpc("release_booking", { p_release_token: releaseToken });
    throw error;
  }
}

/**
 * 支払いの済んだ Checkout のセッションで予約を確定する。Webhook と完了ページの両方から呼ぶ。
 * 何度呼んでも、確定とメールは一度だけ
 */
export async function completeBookingSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;
  const pi = paymentIntentId(session);
  const { data, error } = await supabaseAdmin().rpc("confirm_booking", {
    p_session_id: session.id,
    p_payment_intent_id: pi,
  });
  if (error) throw error;
  const row = (data as { result: string; booking_id: string | null }[])[0];
  if (!row?.booking_id) return;

  if (row.result === "confirmed") {
    const booking = await getBooking(row.booking_id);
    if (booking) await sendBookingConfirmed(booking);
    return;
  }

  if (row.result === "conflict") {
    const booking = await getBooking(row.booking_id);
    if (!booking) return;
    let refunded = false;
    if (pi) {
      try {
        await stripe().refunds.create({ payment_intent: pi }, { idempotencyKey: `booking-conflict-refund-${booking.id}` });
        await supabaseAdmin().from("bookings").update({ refunded_amount: booking.amount }).eq("id", booking.id);
        refunded = true;
      } catch (e) {
        console.error("[booking] 自動返金に失敗", booking.code, e);
      }
    }
    await sendBookingConflictRefunded(booking, refunded);
  }
}

/**
 * Stripe の画面から戻ってきた人（cancel_url）の仮押さえを外す。
 * 先に Stripe のセッションを失効させ、もう払えないようにしてから外す。払い終わっていれば何もしない
 */
export async function releaseBookingHold(token: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from("bookings")
    .select("stripe_session_id, status")
    .eq("release_token", token)
    .maybeSingle();
  if (error) throw error;
  const booking = data as Pick<BookingRow, "stripe_session_id" | "status"> | null;
  if (!booking || booking.status !== "pending") return false;

  if (booking.stripe_session_id) {
    const session = await stripe().checkout.sessions.retrieve(booking.stripe_session_id);
    if (session.status === "complete") {
      await completeBookingSession(session);
      return false;
    }
    if (session.status === "open") await stripe().checkout.sessions.expire(session.id);
  }
  const { error: releaseError } = await supabaseAdmin().rpc("release_booking", { p_release_token: token });
  if (releaseError) throw releaseError;
  return true;
}

/** Stripe のセッションが期限切れになった（Webhook の checkout.session.expired） */
export async function expireBookingSession(sessionId: string): Promise<void> {
  const { error } = await supabaseAdmin()
    .from("bookings")
    .update({ status: "expired", hold_expires_at: null })
    .eq("stripe_session_id", sessionId)
    .eq("status", "pending");
  if (error) throw error;
}
