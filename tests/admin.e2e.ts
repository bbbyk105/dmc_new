import { afterAll, describe, test } from "@e2e-dev/web";
import { credentials, expect, type App, type Screen } from "e2e";
import { db, freeDate, insertBooking, optionId, removeBookings } from "./support/db";
import { addDays, jstDateString } from "../lib/reserve/schedule.ts";

/**
 * 管理画面。ログインしていない人を入れないことと、電話の予約がサイトの予約と同じ枠を使うこと
 * （重なる時間に登録できず、登録した予約はサイトで満席になる）を確かめる。
 * 管理者のテスト用アカウント（ADMIN_TEST_EMAIL / ADMIN_TEST_PASSWORD）が手元の Supabase に要る
 */
test.setup("管理画面にログインする", { sessions: ["admin"] }, async ({ app, screen, session, browser }) => {
  const admin = credentials.user("admin");
  await app.open("/admin/login");
  await screen.getByLabel("メールアドレス").fill(admin.username);
  await screen.getByLabel("パスワード").fill(admin.password);
  await screen.getByRole("button", "ログイン").tap();
  await expect(browser).toHaveURL("/admin");
  await session.save("admin");
});

test("ログインしていなければ、管理画面はログインへ送る", async ({ app }) => {
  for (const path of ["/admin", "/admin/orders", "/admin/products"]) {
    const res = await fetch(new URL(path, app.baseUrl), { redirect: "manual" });
    expect(res.status).toBe(307);
    expect(new URL(res.headers.get("location") ?? "", app.baseUrl).pathname).toBe("/admin/login");
    expect(res.headers.get("x-robots-tag")).toBe("noindex, nofollow");
  }
});

describe("電話の予約", { session: "admin" }, () => {
  const created: string[] = [];
  afterAll(async () => {
    const { data } = await db().from("bookings").select("id").eq("customer_name", "E2E 電話");
    await removeBookings([...created, ...((data ?? []) as { id: string }[]).map((b) => b.id)]);
  });

  /** 花夢プランを電話の予約として登録する */
  async function register({ app, screen }: { app: App; screen: Screen }, date: string, time: string) {
    await app.open("/admin/bookings/new");
    await screen.getByLabel("サービス・プラン").selectOption({ label: "花夢（ハナユメ） / 花夢プラン（60分・¥5,000）" });
    await screen.getByLabel("日付").fill(date);
    await screen.getByLabel("開始").selectOption({ value: time });
    await screen.getByLabel("お名前").fill("E2E 電話");
    await screen.getByRole("button", "予約を登録").tap();
  }

  test("過ぎた日時には登録できない", async ({ app, screen }) => {
    await register({ app, screen }, addDays(jstDateString(new Date()), -1), "15:00");
    await expect(screen.getByRole("status")).toHaveText("過ぎた日時には登録できません");
  });

  test("サイトの予約と重なる時間には登録できず、空いている時間は登録できて、サイトでは満席になる", async ({ app, screen }) => {
    // 予約のテスト（tests/reserve.e2e.ts）と同じ日を取り合わないよう、先の日から探す
    const date = await freeDate("kimono", 45);
    const camu = await optionId("camu", "Kimono Experience");
    const web = await insertBooking({ serviceId: "camu", optionId: camu, resource: "kimono", date, time: "12:00", minutes: 180 });
    created.push(web.id);

    // CAMU 12:00〜15:00 と重なる
    await register({ app, screen }, date, "14:00");
    await expect(screen.getByRole("status")).toHaveText("その時間はほかの予約と重なっているか、受付の時間外です");

    await register({ app, screen }, date, "15:00");
    await expect(screen.getByRole("status")).toHaveText("予約を登録しました");

    // サイトの花夢では 15:00 が埋まる
    const hanayume = await optionId("hanayume");
    const res = await fetch(new URL(`/api/reserve/availability?service=hanayume&option=${hanayume}&month=${date.slice(0, 7)}`, app.baseUrl));
    const day = (await res.json()).days[date] as { slots: { time: string; status: string }[] };
    expect(day.slots.find((s) => s.time === "15:00")?.status).toBe("booked");
  });
});
