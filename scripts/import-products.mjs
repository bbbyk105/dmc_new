// 商品をまとめて登録する（写真を Storage の shop-images に上げ、products に入れる。同じ slug は上書き）。
// 写真は lib/shop/photo.ts で、背景をページの生成りになじませた正方形にしてから上げる。
//   node --env-file=.env.development.local scripts/import-products.mjs scripts/products.json images/web
//
// SUPABASE_URL（無ければ NEXT_PUBLIC_SUPABASE_URL）と SUPABASE_SERVICE_ROLE_KEY を使う。
// 手元の Supabase 以外に入れるときは、取り違えないよう --remote を付ける。
// 値段・在庫・公開は、登録したあと管理画面（/admin/products）で直せる
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";
import { toShopPhoto } from "../lib/shop/photo.ts";

const [, , manifestPath, photoDir, ...flags] = process.argv;
if (!manifestPath || !photoDir) {
  console.error("使い方: node --env-file=<env> scripts/import-products.mjs <products.json> <写真のフォルダ> [--remote]");
  process.exit(1);
}

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください");
const local = /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/.test(url);
if (!local && !flags.includes("--remote")) {
  throw new Error(`手元の Supabase ではありません（${url}）。本番に入れるときは --remote を付けてください`);
}

const sb = createClient(url, key, { auth: { persistSession: false } });
const { products } = JSON.parse(readFileSync(manifestPath, "utf8"));

for (const p of products) {
  const { images, ...row } = p;
  const { data: saved, error } = await sb
    .from("products")
    .upsert(
      { name_en: "", description_ja: "", description_en: "", active: true, ...row, updated_at: new Date().toISOString() },
      { onConflict: "slug" },
    )
    .select("id")
    .single();
  if (error) throw new Error(`${p.slug}: ${error.message}`);
  const { data: before } = await sb.from("products").select("images").eq("id", saved.id).single();

  const paths = [];
  for (const file of images) {
    const photo = await toShopPhoto(readFileSync(join(photoDir, file)));
    // 中身から名前を作る（写真を変えたら URL も変わり、ブラウザに前の写真が残らない）
    const path = `${saved.id}/${createHash("sha256").update(photo).digest("hex").slice(0, 16)}.webp`;
    const { error: uploadError } = await sb.storage.from("shop-images").upload(path, photo, { contentType: "image/webp", upsert: true });
    if (uploadError) throw new Error(`${p.slug} ${file}: ${uploadError.message}`);
    paths.push(path);
  }
  const { error: imageError } = await sb.from("products").update({ images: paths }).eq("id", saved.id);
  if (imageError) throw new Error(`${p.slug}: ${imageError.message}`);
  // 使わなくなった前の写真を消す
  const stale = (before?.images ?? []).filter((old) => !paths.includes(old));
  if (stale.length > 0) await sb.storage.from("shop-images").remove(stale);
  console.log(`${p.slug}  ${p.name_ja}  ¥${p.price}  在庫 ${p.stock}  写真 ${paths.length} 枚`);
}
console.log(`${products.length} 件を登録しました（${url}）`);
