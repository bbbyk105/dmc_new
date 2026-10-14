import type { E2EConfig } from "e2e";
import { web } from "@e2e-dev/web";

/**
 * DMC FUJI の E2E テスト。手引きは .agents/skills/e2e/SKILL.md。
 *
 * - AI に任せる手順（agent.*）は使わないので、AI のモデルは設定しない
 * - リダイレクト・ヘッダー・静的生成は本番と同じ配信で確かめたいので、dev ではなく
 *   `next build` 済みの .next を `next start` で動かす。先にビルドが要る（`npm run test:e2e` はビルドしてから流す）
 */
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
        },
      },
    },
  ],
} satisfies E2EConfig;
