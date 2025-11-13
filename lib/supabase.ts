// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});

export interface GalleryImage {
  id: string;
  name: string;
  url: string; // storage 内のパス (例: "kimono/DSC_0001.JPG")
  category: string;
  publicUrl: string; // 直接の公開URL（デバッグ用途）
  proxiedUrl: string; // ★ Next の /api/img 経由URL（<Image> はこちらを使う）
}

/** 許可する拡張子 */
const ALLOWED_EXTS = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"];

/**
 * Supabase Storageから指定フォルダの画像一覧を取得
 */
export async function getImagesFromFolder(
  bucketName: string,
  folderPath: string,
  category: string
): Promise<GalleryImage[]> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list(folderPath, {
        sortBy: { column: "name", order: "asc" }, // 名前順（必要なら updated_at に変更可）
        limit: 100,
      });

    if (error) {
      console.error(`[supabase] list error: ${folderPath}`, error);
      return [];
    }
    if (!data || data.length === 0) return [];

    // 画像ファイルのみフィルタリング
    const imageFiles = data.filter((file) => {
      const lower = file.name.toLowerCase();
      return (
        ALLOWED_EXTS.some((ext) => lower.endsWith(ext)) &&
        !lower.startsWith(".")
      );
    });

    // 公開URLとプロキシURLを生成
    const images: GalleryImage[] = imageFiles.map((file) => {
      const filePath = `${folderPath}/${file.name}`;

      // 直の公開URL（デバッグ/リンク確認用）
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      // ★ Next 側の画像プロキシAPIを通す（private IP ブロック回避）
      //    例: /api/img/DMC/kimono/DSC_0001.JPG
      const proxiedUrl = `/api/img/${encodeURI(bucketName)}/${encodeURI(
        filePath
      )}`;

      return {
        id: `${category}-${file.name}`,
        name: file.name,
        url: filePath,
        category,
        publicUrl: urlData.publicUrl, // 使うのは基本 proxiedUrl
        proxiedUrl,
      };
    });

    return images;
  } catch (err) {
    console.error(`[supabase] unexpected error: ${folderPath}`, err);
    return [];
  }
}

/**
 * すべてのカテゴリから画像を取得
 */
export async function getAllGalleryImages(): Promise<GalleryImage[]> {
  const bucketName = "DMC";

  const categories = [
    { folder: "kimono", category: "kimono" },
    { folder: "dmc", category: "studio" },
    { folder: "chloe", category: "chloe" },
    { folder: "gallery", category: "gallery" },
  ];

  const allImages = await Promise.all(
    categories.map(({ folder, category }) =>
      getImagesFromFolder(bucketName, folder, category)
    )
  );

  // 必要ならここでカスタムソート（例：名前数値順/updated_at等）
  return allImages.flat();
}
