import { isCronRequest, pingSupabase } from "@/lib/keep-alive";

/** vercel.json の crons（一日一回）。Supabase を眠らせない。中身は lib/keep-alive.ts */
export async function GET(request: Request) {
  if (!isCronRequest(request.headers.get("authorization"), process.env.CRON_SECRET)) {
    return new Response(null, { status: 401 });
  }

  try {
    const status = await pingSupabase({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    });
    if (status === null) {
      // 鍵が無いと一度も読まずに止まる。黙って成功にせず、Cron の履歴に失敗として出す
      console.error("[keep-alive] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY が無いので読めません");
      return new Response(null, { status: 500 });
    }
    console.info(`[keep-alive] Supabase ${status}`);
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[keep-alive] Supabase を読めませんでした", error);
    return new Response(null, { status: 502 });
  }
}
