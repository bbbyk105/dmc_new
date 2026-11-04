// E2E 用のビルド（npm run test:e2e）。予約・ショップのページは静的に生成するときに Supabase を読むので、
// 手元の Supabase の鍵（.env.development.local。無ければ読まない）を入れてから next build を起こす
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

if (existsSync(".env.development.local")) process.loadEnvFile(".env.development.local");
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit", env: process.env });
process.exit(result.status ?? 1);
