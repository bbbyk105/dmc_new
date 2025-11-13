import type { NextRequest } from "next/server";

export const runtime = "edge"; // 任意（高速化）

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ path: string[] }> } // ★ Promise になっている
) {
  const { path } = await context.params; // ★ await で展開
  if (!path?.length) return new Response("Bad Request", { status: 400 });

  // "DMC/kimono/xxx.jpg" のような join 済みパスを構築
  const joined = path.join("/");
  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const renderUrl = `${origin}/storage/v1/render/image/public/${encodeURI(
    joined
  )}`;
  const objectUrl = `${origin}/storage/v1/object/public/${encodeURI(joined)}`;

  // 1) render 経由
  let r = await fetch(renderUrl, {
    headers: { Accept: "image/*" },
    // ISR 的なキャッシュ。Edge でも OK
    next: { revalidate: 3600 },
  });

  // 2) 失敗したら object 直叩きにフォールバック
  if (!r.ok) {
    r = await fetch(objectUrl, {
      headers: { Accept: "image/*" },
      next: { revalidate: 3600 },
    });
    if (!r.ok) return new Response("Not an image", { status: 415 });
  }

  const buf = await r.arrayBuffer();
  const ct = r.headers.get("Content-Type") ?? "image/jpeg";

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": ct,
      "Cache-Control": "public, max-age=3600, s-maxage=3600, immutable",
    },
  });
}
