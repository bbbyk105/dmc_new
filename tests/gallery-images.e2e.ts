import { expect, test } from "e2e";

/**
 * ギャラリーの写真の取得（lib/supabase.ts）。
 *
 * ギャラリーは ISR で、再生成が例外で終わったときだけ Next は前のページを残す。
 * 取得の失敗を空配列で返すと、写真 0 枚のページが正常なページを上書きしてしまうので、失敗は失敗として返す。
 * Supabase を落とすことはできないので、Supabase の URL を fetch が接続しないポート（9。fetch の仕様で禁止）にして、届かない状態を作る。
 */
test("Supabase に届かないときは、空配列ではなく失敗を返す", async () => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:9";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test";
  const { getAllGalleryImages } = await import("../lib/supabase");

  const outcome = await getAllGalleryImages().then(
    (images) => ({ result: "resolved", count: images.length }),
    () => ({ result: "rejected" }),
  );
  expect(outcome).toEqual({ result: "rejected" });
});
