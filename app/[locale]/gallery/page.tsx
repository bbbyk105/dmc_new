import GalleryHero from "@/app/components/(gallery)/GalleryHero";
import ClientGallery from "@/app/components/(gallery)/ClientGallery";
import { getAllGalleryImages } from "@/lib/supabase";

export default async function GalleryPage() {
  // ✅ サーバー側で画像データを取得して高速表示
  const initialImages = await getAllGalleryImages();

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      <GalleryHero />
      <div className="container mx-auto px-6 py-16 lg:px-12">
        <ClientGallery initialImages={initialImages} />
      </div>
    </div>
  );
}
