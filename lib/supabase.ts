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

      // Supabase 側の画像変換APIを利用してリサイズした URL を返す。
      // width だけ指定すると EXIF orientation が正しく処理されず縦横比が壊れるため、
      // resize: "contain" + 両軸指定で必ず正しいアスペクト比に収める。
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath, {
          transform: {
            width: 1600,
            height: 1600,
            resize: "contain",
            quality: 80,
          },
        });

      const proxiedUrl = urlData.publicUrl;

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
    { folder: "Kimono", category: "kimono" },
    { folder: "Mt.Fuji", category: "mtfuji" },
    { folder: "Objects", category: "objects" },
    { folder: "Shoots", category: "shoots" },
  ];

  const allImages = await Promise.all(
    categories.map(({ folder, category }) =>
      getImagesFromFolder(bucketName, folder, category)
    )
  );

  // 必要ならここでカスタムソート（例：名前数値順/updated_at等）
  return allImages.flat();
}
