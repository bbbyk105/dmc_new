import { afterAll, describe, test } from "@e2e-dev/web";
import { expect } from "e2e";
import { bookingStatus, db, freeDate, insertBooking, optionId, removeBookings } from "./support/db";
import { E2E_WEBHOOK_SECRET, signedEvent } from "./support/stripe";
import { addDays, jstDateString, weekdayOf } from "../lib/reserve/schedule.ts";

/**
 * 予約。埋まった枠をほかの人が取れないこと（空き状況・申し込み・画面）と、
 * Stripe からの通知で確定・期限切れになることを確かめる。
 * 手元の Supabase（supabase start）が要る。データはテストが作って最後に消す
 */
describe("予約", () => {
  const created: string[] = [];
  afterAll(async () => {
    await removeBookings(created);
  });

  /** CAMU を date の 12:00〜15:00 に入れる（花夢と同じスタッフ） */
  async function bookCamuNoon() {
    const date = await freeDate("kimono");
    const camu = await optionId("camu", "Kimono Experience");
    const booking = await insertBooking({ serviceId: "camu", optionId: camu, resource: "kimono", date, time: "12:00", minutes: 180 });
    created.push(booking.id);
    return date;
  }

  test("埋まった時間は、空き状況で満席になる", async ({ app }) => {
    const date = await bookCamuNoon();
    const hanayume = await optionId("hanayume");
    const res = await fetch(
      new URL(`/api/reserve/availability?service=hanayume&option=${hanayume}&month=${date.slice(0, 7)}`, app.baseUrl),
    );
    expect(res.status).toBe(200);
    const day = (await res.json()).days[date] as { status: string; slots: { time: string; status: string }[] };
    expect(day.status).toBe("open");
    expect(day.slots.map((s) => `${s.time}:${s.status}`)).toEqual([
      "14:00:booked",
      "14:30:booked",
      "15:00:available",
      "15:30:available",
      "16:00:available",
    ]);
  });

  test("埋まった時間を申し込んでも断り、支払いに進ませない", async ({ app }) => {
    const date = await bookCamuNoon();
    const res = await fetch(new URL("/api/reserve/checkout", app.baseUrl), {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        serviceId: "hanayume",
        optionId: await optionId("hanayume"),
        date,
        time: "14:00",
        people: 1,
        name: "E2E テスト",
        email: "e2e@dmc.test",
        phone: "090-0000-0000",
        note: "",
        locale: "ja",
      }),
    });
    expect(res.status).toBe(409);
    expect(await res.json()).toEqual({ error: "unavailable" });
  });

  test("画面でも、埋まった時間は満席と出て押せない", async ({ app, screen }) => {
    const date = await bookCamuNoon();
    const [year, month, day] = date.split("-").map(Number);
    // 花夢はプランが 1 つなので、日時の選択から始まる
    await app.open("/ja/reserve?service=hanayume");
    await expect(screen.getByRole("heading", "日時を選ぶ")).toBeVisible();
    for (let i = 0; i < 3 && !(await screen.getByRole("heading", `${year}年${month}月`).isVisible()); i++) {
      await screen.getByRole("button", "次の月").tap();
    }
    await screen.getByRole("button", new RegExp(`^${year}年${month}月${day}日`)).tap();

    await expect(screen.getByRole("button", /^14:00/)).toBeDisabled();
    await expect(screen.getByRole("button", /^14:00/)).toContainText("満席");
    await expect(screen.getByRole("button", /^15:00/)).toBeEnabled();
    await screen.getByRole("button", /^15:00/).tap();
    await expect(screen.getByRole("button", "次へ進む")).toBeEnabled();
  });

  test("着物の撮影は、日本語の予約では花夢、英語の予約では CAMU だけを出す", async ({ app, screen }) => {
    await app.open("/ja/reserve");
    await expect(screen.getByRole("button", /^花夢/)).toBeVisible();
    await expect(screen.getByRole("button", /^Chloe/)).toBeVisible();
    await expect(screen.getByRole("button", /^CAMU/)).toBeHidden();

    // 日本語の CAMU のページの「予約する」（?service=camu）からは、花夢の日時の選択へ
    // （CAMU はプランが 3 つあるので、CAMU のままならプランの選択で止まる）
    await app.open("/ja/reserve?service=camu");
    await expect(screen.getByRole("heading", "日時を選ぶ")).toBeVisible();

    await app.open("/en/reserve");
    await expect(screen.getByRole("button", /^CAMU/)).toBeVisible();
    await expect(screen.getByRole("button", /^Chloe/)).toBeVisible();
    await expect(screen.getByRole("button", /^Hanayume/)).toBeHidden();
  });

  test("水曜日は定休日なので、どのサービスも予約できない（カレンダーでは「休」）", async ({ app }) => {
    const services = [
      ["camu", await optionId("camu", "Kimono Experience")],
      ["hanayume", await optionId("hanayume")],
      ["chloe", await optionId("chloe", "1 hour")],
    ];
    // 締切（72 時間）より先の水曜日
    const today = jstDateString(new Date());
    let wednesday = addDays(today, 4);
    while (weekdayOf(wednesday) !== 3) wednesday = addDays(wednesday, 1);
    for (const [service, option] of services) {
      const res = await fetch(new URL(`/api/reserve/availability?service=${service}&option=${option}&month=${wednesday.slice(0, 7)}`, app.baseUrl));
      const days = (await res.json()).days as Record<string, { status: string }>;
      expect({ service, status: days[wednesday]?.status }).toEqual({ service, status: "closed" });
    }
  });

  test("お店が取り消した予約の完了ページは、時間切れの案内や全額返金を出さない", async ({ app, screen }) => {
    const date = await freeDate("chloe");
    const session = `cs_test_e2e_${Date.now()}_done`;
    const booking = await insertBooking({
      serviceId: "chloe",
      optionId: await optionId("chloe", "1 hour"),
      resource: "chloe",
      date,
      time: "11:00",
      minutes: 60,
      stripeSessionId: session,
      email: "e2e@dmc.test",
    });
    created.push(booking.id);
    // 50% のキャンセル料で、お店が取り消した
    const { error } = await db()
      .from("bookings")
      .update({ status: "cancelled", cancel_reason: "admin", cancellation_fee: 2500, refunded_amount: 2500, cancelled_at: new Date().toISOString() })
      .eq("id", booking.id);
    if (error) throw error;

    await app.open(`/ja/reserve/complete?session_id=${session}`);
    await expect(screen.getByRole("heading", "このご予約はキャンセルされています")).toBeVisible();
    await expect(screen.getByText("全額", { exact: false })).toBeHidden();
  });

  describe("Stripe からの通知", () => {
    async function pendingChloe() {
      const date = await freeDate("chloe");
      const session = `cs_test_e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const booking = await insertBooking({
        serviceId: "chloe",
        optionId: await optionId("chloe", "1 hour"),
        resource: "chloe",
        date,
        time: "11:00",
        minutes: 60,
        status: "pending",
        stripeSessionId: session,
        email: "e2e@dmc.test",
      });
      created.push(booking.id);
      return { booking, session };
    }

    function post(baseUrl: string | undefined, event: { payload: string; signature: string }) {
      return fetch(new URL("/api/stripe/webhook", baseUrl), {
        method: "POST",
        headers: { "content-type": "application/json", "stripe-signature": event.signature },
        body: event.payload,
      });
    }

    test("支払い完了が届いたら確定し、同じ通知がもう一度来ても確定は一度だけ", async ({ app }) => {
      const { booking, session } = await pendingChloe();
      const object = {
        id: session,
        object: "checkout.session",
        status: "complete",
        payment_status: "paid",
        payment_intent: "pi_e2e",
        metadata: { kind: "booking", booking_id: booking.id },
      };
      expect((await post(app.baseUrl, signedEvent("checkout.session.completed", object))).status).toBe(200);
      expect(await bookingStatus(booking.id)).toBe("confirmed");
      expect((await post(app.baseUrl, signedEvent("checkout.session.completed", object))).status).toBe(200);
      expect(await bookingStatus(booking.id)).toBe("confirmed");
    });

    test("支払われずにセッションが期限切れになったら、仮押さえを外す", async ({ app }) => {
      const { booking, session } = await pendingChloe();
      const object = { id: session, object: "checkout.session", status: "expired", payment_status: "unpaid", metadata: { kind: "booking", booking_id: booking.id } };
      expect((await post(app.baseUrl, signedEvent("checkout.session.expired", object))).status).toBe(200);
      expect(await bookingStatus(booking.id)).toBe("expired");
    });

    test("署名の合わない通知は受け付けず、予約も変えない", async ({ app }) => {
      const { booking, session } = await pendingChloe();
      const object = { id: session, object: "checkout.session", status: "complete", payment_status: "paid", metadata: { kind: "booking" } };
      const forged = signedEvent("checkout.session.completed", object, `${E2E_WEBHOOK_SECRET}_wrong`);
      expect((await post(app.baseUrl, forged)).status).toBe(400);
      expect(await bookingStatus(booking.id)).toBe("pending");
    });
  });
});
