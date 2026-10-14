/**
 * Supabase を眠らせない（vercel.json の crons から一日一回、/api/keep-alive）。
 *
 * 無料プランの Supabase は、7 日間ほとんど使われないとプロジェクトを止める。止まると
 * ホスト名が DNS から消え、ギャラリーの写真の一覧も写真そのものも出なくなる
 * （2026-10-15 に同じ無料プランの kikko が止まっていた）。トップとギャラリーは ISR なので、
 * 一週間訪問が無いと Supabase には一度も届かない。
 * ギャラリーと同じ Storage の一覧（storage.objects を読む）を一件だけ取る。
 *
 * Next に依存しない（keep-alive.test.mjs が node --test で直接読む）。
 */

export type KeepAliveEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
};

/** lib/supabase.ts の getAllGalleryImages と同じバケット・フォルダ */
const BUCKET = "DMC";
const FOLDER = "Kimono";

/**
 * Storage の一覧を一件だけ読む。鍵が無ければ何もせず null。
 * 読めなければ投げる（Vercel の Cron の履歴に失敗として残す）。
 */
export async function pingSupabase(
  env: KeepAliveEnv,
  fetchImpl: typeof fetch = fetch,
): Promise<number | null> {
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  const endpoint = new URL(`storage/v1/object/list/${BUCKET}`, url.endsWith("/") ? url : `${url}/`);
  const res = await fetchImpl(endpoint, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prefix: FOLDER, limit: 1, offset: 0 }),
    signal: AbortSignal.timeout(10_000),
  });
  // 本文は使わないが、読み切って接続を返す
  const body = await res.text();
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${body.slice(0, 120)}`);
  return res.status;
}

/**
 * Vercel Cron からの呼び出しか。Vercel は環境変数 CRON_SECRET があると
 * `Authorization: Bearer <CRON_SECRET>` を付けて呼ぶ。入れていなければ誰でも通す（中身は一件読むだけ）。
 */
export function isCronRequest(authorization: string | null, cronSecret: string | undefined): boolean {
  if (!cronSecret) return true;
  return authorization === `Bearer ${cronSecret}`;
}
