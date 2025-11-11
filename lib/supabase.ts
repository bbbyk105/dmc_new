import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
});

export interface GalleryImage {
  id: string;
  name: string;
  url: string;
  category: string;
  publicUrl: string;
}

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
        sortBy: { column: "name", order: "asc" },
        limit: 100,
      });

    if (error) {
      console.error(`Error fetching images from ${folderPath}:`, error);
      return [];
    }

    if (!data || data.length === 0) return [];

    // 画像ファイルのみフィルタリング
    const imageFiles = data.filter((file) => {
      const ext = file.name.toLowerCase();
      return (
        (ext.endsWith(".jpg") ||
          ext.endsWith(".jpeg") ||
          ext.endsWith(".png") ||
          ext.endsWith(".webp") ||
          ext.endsWith(".gif")) &&
        !file.name.startsWith(".")
      );
    });

    // 公開URLを生成
    const images: GalleryImage[] = imageFiles.map((file) => {
      const filePath = `${folderPath}/${file.name}`;
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      return {
        id: `${category}-${file.name}`,
        name: file.name,
        url: filePath,
        category: category,
        publicUrl: urlData.publicUrl,
      };
    });

    return images;
  } catch (err) {
    console.error(`Unexpected error fetching images from ${folderPath}:`, err);
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

  return allImages.flat();
}
