import type { Metadata } from "next";
import GalleryHero from "@/app/components/(gallery)/GalleryHero";
import ClientGallery from "@/app/components/(gallery)/ClientGallery";
import { getAllGalleryImages } from "@/lib/supabase";
import { buildPageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa ? "ギャラリー | DMC FUJI" : "Gallery | DMC FUJI",
    description: isJa
      ? "DMC FUJIの着物撮影・スタジオの写真ギャラリー。"
      : "Photo gallery of DMC FUJI's ceremonial kimono and studio.",
    locale,
    canonicalPath: `/${locale}/gallery`,
  });
}

export default async function GalleryPage({ params }: Props) {
  // ✅ サーバー側で画像データを取得して高速表示
  const initialImages = await getAllGalleryImages();

  return (
    <div className="min-h-screen bg-white">
      <GalleryHero />
      <ClientGallery initialImages={initialImages} />
    </div>
  );
}
