/**
 * 本番ベースURL。NEXT_PUBLIC_SITE_URL を唯一の正とする。
 * 末尾スラッシュは除去。未設定時は localhost を返す。
 */
export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  if (!url || typeof url !== "string") {
    return "http://localhost:3000";
  }
  return url.replace(/\/$/, "");
}
