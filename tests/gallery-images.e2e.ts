import { expect, test } from "e2e";

/**
 * ギャラリーの写真の取得（lib/supabase.ts）。
 *
 * ギャラリーは ISR で、再生成が例外で終わったときだけ Next は前のページを残す。
 * 取得の失敗を空配列で返すと、写真 0 枚のページが正常なページを上書きしてしまうので、失敗は失敗として返す。
 * Supabase を落とすことはできないので、Supabase の URL を fetch が接続しないポート（9。fetch の仕様で禁止）にして、届かない状態を作る。
 */
test("Supabase に届かないときは、空配列ではなく失敗を返す", async () => {
  // 同じワーカーで後に流れるテスト（予約・ショップのデータの準備）も SUPABASE_URL を読むので、終わったら元に戻す
  const names = ["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"] as const;
  const saved = names.map((name) => [name, process.env[name]] as const);
  try {
    process.env.SUPABASE_URL = "http://127.0.0.1:9";
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:9";
    // 一覧はサーバーだけで、秘密の鍵で読む（ブラウザに出る NEXT_PUBLIC_ の鍵は使わない）
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test";
    const { getAllGalleryImages } = await import("../lib/supabase");

    const outcome = await getAllGalleryImages().then(
      (images) => ({ result: "resolved", count: images.length }),
      () => ({ result: "rejected" }),
    );
    expect(outcome).toEqual({ result: "rejected" });
  } finally {
    for (const [name, value] of saved) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});
