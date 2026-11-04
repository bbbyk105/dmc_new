import { describe, test } from "@e2e-dev/web";
import { expect } from "e2e";

/** お問い合わせの送信。テストでは MAIL_MODE=log なので、メールは送らずにログへ出す */
describe("お問い合わせ", () => {
  test("内容がそろっていれば受け付ける（メールはログへ出し、送らない）", async ({ app }) => {
    const res = await fetch(new URL("/api/contact", app.baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "E2E 太郎",
        email: "e2e@dmc.test",
        phone: "",
        service: "chloe",
        message: "テストのお問い合わせです。",
        locale: "ja",
      }),
    });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  test("メールアドレスが正しくなければ受け付けない", async ({ app }) => {
    const res = await fetch(new URL("/api/contact", app.baseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "E2E", email: "not-an-email", phone: "", service: "", message: "x", locale: "ja" }),
    });
    expect(res.status).toBe(400);
  });
});
