import GalleryHero from "@/app/components/(gallery)/GalleryHero";
import ClientGallery from "@/app/components/(gallery)/ClientGallery";
import { getAllGalleryImages } from "@/lib/supabase";

export default async function GalleryPage() {
  // ✅ サーバー側で画像データを取得して高速表示
  const initialImages = await getAllGalleryImages();

  return (
    <div className="min-h-screen bg-white">
      <GalleryHero />
      <ClientGallery initialImages={initialImages} />
    </div>
  );
}
