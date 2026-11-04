/**
 * NEXT_PUBLIC_ で始まる環境変数は、ブラウザ向けの JS にそのまま入る。
 * ここに RLS を無視できる Supabase の鍵（secret・古い service_role）が入っていると、サイトを見た人が誰でも取り出せる
 * （2026-11-04、NEXT_PUBLIC_SUPABASE_ANON_KEY に service_role が入っていた）。ビルドの前に見つけて止める
 */
export function findSecretsInPublicEnv(env: Record<string, string | undefined>): string[] {
  return Object.entries(env)
    .filter(([name, value]) => name.startsWith("NEXT_PUBLIC_") && value && isSupabaseSecret(value))
    .map(([name]) => name);
}

function isSupabaseSecret(value: string): boolean {
  if (value.startsWith("sb_secret_")) return true;
  // 古い形式の鍵は JWT。中身の role が service_role なら秘密の鍵
  const payload = value.split(".")[1];
  if (!payload) return false;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8"))?.role === "service_role";
  } catch {
    return false;
  }
}
