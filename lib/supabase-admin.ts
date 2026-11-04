import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

/**
 * 予約・注文を置く Supabase の URL。SUPABASE_URL があればそちら（手元の確認・E2E でローカルの Supabase に向ける。
 * NEXT_PUBLIC_ の値はビルドのときに埋め込まれて、起動のときに差し替えられないため）
 */
function supabaseUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/**
 * service role の Supabase。RLS を通り越して予約・注文（お客さまの連絡先・住所）を読み書きするので、
 * サーバーのコードからだけ使う（"server-only" で、クライアントのバンドルに入ると build が落ちる）。
 * ギャラリーの写真は今までどおり lib/supabase.ts（anon key）で読む。
 */
export function supabaseAdmin(): SupabaseClient {
  if (client) return client;
  const url = supabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください");
  }
  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Storage（shop-images）の公開 URL */
export function shopImageUrl(path: string): string {
  const base = (supabaseUrl() ?? "").replace(/\/$/, "");
  return `${base}/storage/v1/object/public/shop-images/${path.split("/").map(encodeURIComponent).join("/")}`;
}
