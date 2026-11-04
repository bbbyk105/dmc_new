import "server-only";
import { shopImageUrl } from "@/lib/supabase-admin";
import type { ProductRow, ShopSettingsRow } from "@/lib/db/types";
import type { ShopProduct, ShopRule } from "./types";

/** データベースの商品を、画面に渡す形にする（ロケールの名前・写真の URL） */
export function toShopProduct(p: ProductRow, locale: "ja" | "en"): ShopProduct {
  const en = locale === "en";
  return {
    id: p.id,
    slug: p.slug,
    name: en && p.name_en ? p.name_en : p.name_ja,
    description: en && p.description_en ? p.description_en : p.description_ja,
    price: p.price,
    stock: p.stock,
    active: p.active,
    images: p.images.map(shopImageUrl),
  };
}

export function toShopRule(s: ShopSettingsRow, locale: "ja" | "en"): ShopRule {
  return {
    shippingFee: s.shipping_fee,
    freeShippingThreshold: s.free_shipping_threshold,
    overseasShippingFee: s.overseas_shipping_fee,
    deliveryNote: locale === "en" ? s.delivery_note_en : s.delivery_note_ja,
  };
}
