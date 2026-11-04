import "server-only";
import type Stripe from "stripe";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { CHECKOUT_MINUTES, HOLD_MINUTES, paymentIntentId, stripe } from "@/lib/stripe";
import { getOrder, getShopSettings } from "@/lib/db/shop";
import { parseCart } from "@/lib/shop/cart";
import { isUuid } from "@/lib/reserve/validate";
import { sendOrderPaid } from "@/lib/mail/notify";
import type { OrderRow } from "@/lib/db/types";
import { destinationFor } from "@/lib/shop/destination";
import { formatShippingAddress } from "@/lib/shop/address";
import { clientKeyOf, newCode, newReleaseToken } from "./ids";

export type StartOrderResult =
  | { ok: true; url: string }
  | { ok: false; status: number; error: "invalid" | "out_of_stock" | "too_many_holds"; productId?: string };

const UNIQUE_VIOLATION = "23505";

/**
 * 注文の支払いを始める。在庫を仮押さえしてから Stripe Checkout のセッションを作る。
 * 値段・送料はデータベースの値（hold_order）。お届け先と連絡先は Stripe の画面で入れてもらう。
 * お届け先はページの言語で決める（日本語は日本国内、英語はオーストラリアだけ）。
 * オーストラリアへは一律の海外送料（ショップの設定）をいただく。実際の送料が大きく違うときだけ、お店が発送の前に相談する
 */
export async function startOrderCheckout(
  body: unknown,
  ctx: { origin: string; headers: Headers },
): Promise<StartOrderResult> {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const lines = parseCart(b.items);
  const locale = b.locale === "en" ? "en" : "ja";
  const destination = destinationFor(locale);
  const overseas = destination.overseas;
  if (lines.length === 0 || !lines.every((l) => isUuid(l.productId))) {
    return { ok: false, status: 400, error: "invalid" };
  }

  const releaseToken = newReleaseToken();
  let order: OrderRow | null = null;
  for (let attempt = 0; attempt < 3 && !order; attempt++) {
    const { data, error } = await supabaseAdmin().rpc("hold_order", {
      p_items: lines.map((l) => ({ product_id: l.productId, quantity: l.quantity })),
      p_locale: locale,
      p_code: newCode("S"),
      p_release_token: releaseToken,
      p_client_key: clientKeyOf(ctx.headers),
      p_hold_minutes: HOLD_MINUTES,
      p_overseas: overseas,
    });
    if (!error) {
      order = data as OrderRow;
      break;
    }
    const outOfStock = /out_of_stock:([0-9a-f-]{36})/.exec(error.message);
    if (outOfStock) return { ok: false, status: 409, error: "out_of_stock", productId: outOfStock[1] };
    if (error.message.includes("too_many_holds")) return { ok: false, status: 429, error: "too_many_holds" };
    if (error.message.includes("invalid_quantity") || error.message.includes("empty_cart")) {
      return { ok: false, status: 400, error: "invalid" };
    }
    if (error.code === UNIQUE_VIOLATION && error.message.includes("code")) continue;
    throw error;
  }
  if (!order) throw new Error("注文番号を作れませんでした");

  const en = locale === "en";
  try {
    const full = await getOrder(order.id);
    if (!full) throw new Error("注文が見つかりません");
    const session = await stripe().checkout.sessions.create(
      {
        mode: "payment",
        // カードだけ（Apple Pay・Google Pay を含む）。コンビニ払いなど後から入金される方法は、仮押さえの期限と合わないので出さない
        allowed_payment_method_types: ["card"],
        locale: en ? "en" : "ja",
        line_items: full.order_items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "jpy",
            unit_amount: item.unit_price,
            product_data: { name: en ? item.name_en || item.name_ja : item.name_ja },
          },
        })),
        // 日本語のページは日本の住所だけ、英語のページはオーストラリアの住所だけ
        shipping_address_collection: { allowed_countries: [destination.country] },
        shipping_options: [
          {
            shipping_rate_data: {
              type: "fixed_amount",
              display_name: overseas
                ? en
                  ? "Shipping to Australia (flat rate)"
                  : "オーストラリアへの送料（一律）"
                : full.shipping_fee === 0
                  ? en
                    ? "Free shipping"
                    : "送料無料"
                  : en
                    ? "Shipping"
                    : "送料",
              fixed_amount: { amount: full.shipping_fee, currency: "jpy" },
            },
          },
        ],
        phone_number_collection: { enabled: true },
        metadata: { kind: "order", order_id: full.id, code: full.code },
        // 支払いのボタンの近くにも、確定の時期と返品の扱いを出す（最終確認の画面）
        custom_text: {
          submit: {
            message: overseas
              ? en
                ? "Your order is confirmed when payment is complete. If the actual shipping cost is very different from the flat rate, we will contact you before shipping. We do not accept returns or exchanges except for defective items."
                : "お支払いが済んだ時点でご注文が確定します。実際の送料が一律の金額と大きく異なる場合は、発送の前にご相談します。商品に初期不良があった場合を除き、返品・交換はお受けしていません。"
              : en
                ? "Your order is confirmed when payment is complete. We do not accept returns or exchanges except for defective items."
                : "お支払いが済んだ時点でご注文が確定します。商品に初期不良があった場合を除き、返品・交換はお受けしていません。",
          },
        },
        payment_intent_data: {
          description: `注文 ${full.code}`,
          metadata: { kind: "order", order_id: full.id, code: full.code },
        },
        expires_at: Math.floor(Date.now() / 1000) + CHECKOUT_MINUTES * 60,
        success_url: `${ctx.origin}/${locale}/shop/complete?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ctx.origin}/${locale}/cart?release=${releaseToken}`,
      },
      { idempotencyKey: `order-checkout-${full.id}` },
    );
    const { error } = await supabaseAdmin().from("orders").update({ stripe_session_id: session.id }).eq("id", full.id);
    if (error) throw error;
    if (!session.url) throw new Error("Stripe の URL がありません");
    return { ok: true, url: session.url };
  } catch (error) {
    await supabaseAdmin().rpc("release_order", { p_release_token: releaseToken });
    throw error;
  }
}

/** 支払いの済んだ Checkout のセッションで注文を支払い済みにする。Webhook と完了ページの両方から呼ぶ */
export async function completeOrderSession(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;
  const shipping = session.collected_information?.shipping_details;
  const { data, error } = await supabaseAdmin().rpc("mark_order_paid", {
    p_session_id: session.id,
    p_payment_intent_id: paymentIntentId(session),
    p_customer_email: session.customer_details?.email ?? "",
    p_customer_name: session.customer_details?.name ?? "",
    p_customer_phone: session.customer_details?.phone ?? "",
    p_shipping_name: shipping?.name ?? "",
    p_shipping_postal_code: shipping?.address?.postal_code ?? "",
    p_shipping_address: formatShippingAddress(shipping?.address),
  });
  if (error) throw error;
  const row = (data as { result: string; order_id: string | null }[])[0];
  if (row?.result !== "paid" || !row.order_id) return;

  const [order, settings] = await Promise.all([getOrder(row.order_id), getShopSettings()]);
  if (order) await sendOrderPaid(order, order.locale === "en" ? settings.delivery_note_en : settings.delivery_note_ja);
}

/** Stripe の画面から戻ってきた人（cancel_url）の在庫の仮押さえを外す */
export async function releaseOrderHold(token: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("stripe_session_id, status")
    .eq("release_token", token)
    .maybeSingle();
  if (error) throw error;
  const order = data as Pick<OrderRow, "stripe_session_id" | "status"> | null;
  if (!order || order.status !== "pending") return false;

  if (order.stripe_session_id) {
    const session = await stripe().checkout.sessions.retrieve(order.stripe_session_id);
    if (session.status === "complete") {
      await completeOrderSession(session);
      return false;
    }
    if (session.status === "open") await stripe().checkout.sessions.expire(session.id);
  }
  const { error: releaseError } = await supabaseAdmin().rpc("release_order", { p_release_token: token });
  if (releaseError) throw releaseError;
  return true;
}

/** Stripe のセッションが期限切れになった（Webhook の checkout.session.expired）。在庫を戻す */
export async function expireOrderSession(sessionId: string): Promise<void> {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select("release_token")
    .eq("stripe_session_id", sessionId)
    .eq("status", "pending")
    .maybeSingle();
  if (error) throw error;
  const token = (data as { release_token: string | null } | null)?.release_token;
  if (!token) return;
  const { error: releaseError } = await supabaseAdmin().rpc("release_order", { p_release_token: token });
  if (releaseError) throw releaseError;
}
