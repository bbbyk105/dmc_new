import { afterAll, describe, test } from "@e2e-dev/web";
import { expect } from "e2e";
import { db } from "./support/db";

/** ショップの商品ページ。データはテストが作って最後に消す（手元の Supabase が要る） */
describe("ショップ", () => {
  const slug = `e2e-gallery-${Date.now()}`;
  const stockSlug = `e2e-stock-${Date.now()}`;
  const shipSlug = `e2e-ship-${Date.now()}`;
  afterAll(async () => {
    await db().from("products").delete().in("slug", [slug, stockSlug, shipSlug]);
  });

  test("お届け先はカートで選ばない。日本語は国内の送料、英語はオーストラリアへの一律の送料", async ({ app, screen }) => {
    const { data: before, error: readError } = await db().from("shop_settings").select("*").eq("id", true).single();
    if (readError) throw new Error(readError.message);
    await db().from("shop_settings").update({ shipping_fee: 800, free_shipping_threshold: null, overseas_shipping_fee: 5000 }).eq("id", true);
    try {
      const { error } = await db()
        .from("products")
        .insert({ slug: shipSlug, name_ja: "E2E 送料", price: 3000, stock: 3, active: true, images: ["e2e/1.webp"] });
      if (error) throw new Error(error.message);

      await app.open(`/ja/shop/${shipSlug}`);
      await screen.getByRole("button", "カートに入れる").tap();
      await screen.getByRole("link", "カートを見る").tap();

      // 日本語のページは日本国内：3,000 ＋ 送料 800。お届け先の切り替えは出さない
      await expect(screen.getByText("¥3,800", { exact: true })).toBeVisible();
      await expect(screen.getByRole("radio", "海外")).toBeHidden();

      // 英語のページはオーストラリアだけ：3,000 ＋ 一律 5,000（カートは同じものが残る）
      await app.open("/en/cart");
      await expect(screen.getByText("¥8,000", { exact: true })).toBeVisible();
      await expect(screen.getByText("We ship to Australia only.", { exact: false })).toBeVisible();
      await expect(screen.getByRole("radio", "Outside Japan")).toBeHidden();
    } finally {
      await db()
        .from("shop_settings")
        .update({ shipping_fee: before.shipping_fee, free_shipping_threshold: before.free_shipping_threshold, overseas_shipping_fee: before.overseas_shipping_fee })
        .eq("id", true);
    }
  });

  test("数量は在庫までしか増やせず、カートに入れると「カートを見る」が出る", async ({ app, screen }) => {
    const { error } = await db()
      .from("products")
      .insert({ slug: stockSlug, name_ja: "E2E 在庫2点", price: 1000, stock: 2, active: true, images: ["e2e/1.webp"] });
    if (error) throw new Error(error.message);

    await app.open(`/ja/shop/${stockSlug}`);
    await expect(screen.getByRole("button", "数を減らす")).toBeDisabled();
    await screen.getByRole("button", "数を増やす").tap();
    await expect(screen.getByRole("group", "数量")).toContainText("2");
    await expect(screen.getByRole("button", "数を増やす")).toBeDisabled();
    await expect(screen.getByText("残り2点")).toBeVisible();

    await screen.getByRole("button", "カートに入れる").tap();
    await expect(screen.getByRole("link", "カートを見る")).toBeVisible();
    await expect(screen.getByText("カートに 2点")).toBeVisible();
    // 在庫の 2 点がカートに入ったので、もう入れられない
    await expect(screen.getByRole("button", "在庫の分はカートに入っています")).toBeDisabled();
  });

  test("商品ページで小さい写真を押すと、大きな写真が切り替わる", async ({ app, screen }) => {
    const { error } = await db()
      .from("products")
      .insert({ slug, name_ja: "E2E 写真の切り替え", price: 1000, stock: 1, active: true, images: ["e2e/1.webp", "e2e/2.webp", "e2e/3.webp"] });
    if (error) throw new Error(error.message);

    await app.open(`/ja/shop/${slug}`);
    await expect(screen.getByRole("img", "E2E 写真の切り替え（1枚目）")).toBeVisible();
    await expect(screen.getByRole("button", "1枚目の写真を表示")).toHaveAttribute("aria-pressed", "true");

    await screen.getByRole("button", "2枚目の写真を表示").tap();
    await expect(screen.getByRole("img", "E2E 写真の切り替え（2枚目）")).toBeVisible();
    await expect(screen.getByRole("button", "2枚目の写真を表示")).toHaveAttribute("aria-pressed", "true");
    await expect(screen.getByRole("button", "1枚目の写真を表示")).toHaveAttribute("aria-pressed", "false");
  });
});
