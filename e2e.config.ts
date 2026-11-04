import { existsSync } from "node:fs";
import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";
import { E2E_WEBHOOK_SECRET } from "./tests/support/stripe";

/**
 * DMC FUJI の E2E テスト。手引きは .agents/skills/e2e/SKILL.md。
 *
 * - AI に任せる手順（agent.*）は使わないので、AI のモデルは設定しない
 * - リダイレクト・ヘッダー・静的生成は本番と同じ配信で確かめたいので、dev ではなく
 *   `next build` 済みの .next を `next start` で動かす。先にビルドが要る（`npm run test:e2e` はビルドしてから流す）
 * - 予約・注文・管理画面のテストは、手元の Supabase（`supabase start`）に向けて流す。
 *   鍵と管理者のテスト用アカウントは .env.development.local（git に入らない）から読む
 * - Stripe はダミーの鍵で動かし、Webhook は署名つきの疑似イベントで確かめる（Stripe には繋がない）
 */
if (existsSync(".env.development.local")) process.loadEnvFile(".env.development.local");

// E2E は予約・注文を作って消すので、手元の Supabase 以外には向けない（本番の URL に戻らないよう、必ず渡す）
const supabaseUrl = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
if (!/^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(supabaseUrl)) {
  throw new Error(`E2E は手元の Supabase だけに向けます（SUPABASE_URL=${supabaseUrl}）`);
}

export default {
  tests: "tests/**/*.e2e.ts",
  targets: [
    {
      engine: web({ locale: "ja-JP", timezoneId: "Asia/Tokyo" }),
      app: {
        url: "http://127.0.0.1:0",
        // / は /ja へリダイレクトするので、待ち受けの確認はページそのもので行う
        readyUrl: "http://127.0.0.1:{port}/ja",
        command: {
          executable: "node",
          args: ["node_modules/next/dist/bin/next", "start", "--port", "{port}", "--hostname", "127.0.0.1"],
          log: ".e2e/logs/app.log",
          // テストではメールを送らずにログへ出す（お問い合わせのテストで本物のメールが出ないように）
          env: {
            SUPABASE_URL: supabaseUrl,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY ?? "",
            SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
            ADMIN_EMAILS: process.env.ADMIN_TEST_EMAIL ?? "admin@dmc.test",
            MAIL_MODE: "log",
            STRIPE_SECRET_KEY: "sk_test_e2e_dummy",
            STRIPE_WEBHOOK_SECRET: E2E_WEBHOOK_SECRET,
          },
        },
      },
    },
  ],
  credentials: {
    // 入力するときに読む（パスワードが無い環境でも、管理画面以外のテストは流せるように）
    admin: { username: process.env.ADMIN_TEST_EMAIL ?? "admin@dmc.test", password: () => process.env.ADMIN_TEST_PASSWORD ?? "" },
  },
} satisfies E2EConfig;
