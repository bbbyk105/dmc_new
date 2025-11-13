// app/api/img/[...path]/route.ts
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: { params: { path: string[] } }
) {
  const path = ctx?.params?.path?.join("/");
  if (!path) return new Response("Bad Request", { status: 400 });

  const origin = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const renderUrl = `${origin}/storage/v1/render/image/public/${encodeURI(
    path
  )}`;
  const objectUrl = `${origin}/storage/v1/object/public/${encodeURI(path)}`;

  // 1) render 経由
  let r = await fetch(renderUrl, {
    headers: { Accept: "image/*" },
    next: { revalidate: 3600 },
  });

  // 2) ダメなら object 直
  if (!r.ok) {
    r = await fetch(objectUrl, {
      headers: { Accept: "image/*" },
      next: { revalidate: 3600 },
    });
    if (!r.ok) return new Response("Not an image", { status: 415 });
  }

  const buf = await r.arrayBuffer();
  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": r.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=3600, s-maxage=3600, immutable",
    },
  });
}
