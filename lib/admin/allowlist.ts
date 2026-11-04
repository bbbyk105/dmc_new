/**
 * 管理画面に入れるメールアドレス（環境変数 ADMIN_EMAILS、カンマ区切り）。
 * Supabase Auth にログインできても、ここに無いアドレスは管理画面に入れない。
 *
 * Next に依存しない（allowlist.test.mjs が node --test で直接読む）。
 */
export function isAdminEmail(email: string | null | undefined, adminEmails: string | undefined): boolean {
  if (!email || !adminEmails) return false;
  const target = email.trim().toLowerCase();
  return adminEmails
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .includes(target);
}
