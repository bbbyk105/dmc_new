import type { Metadata } from "next";
import GalleryHero from "@/app/components/(gallery)/GalleryHero";
import ClientGallery from "@/app/components/(gallery)/ClientGallery";
import JsonLd from "@/app/components/JsonLd";
import { getAllGalleryImages } from "@/lib/supabase";
import { buildPageMeta, buildBreadcrumbSchema, getSiteUrl } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa ? "ギャラリー | DMC FUJI" : "Gallery | DMC FUJI",
    description: isJa
      ? "DMC FUJIの着物撮影・スタジオの写真ギャラリー。富士山と茶畑を背景にした着物姿の作品集。"
      : "Photo gallery of DMC FUJI. Kimono portraits with Mt. Fuji and tea field backdrops.",
    locale,
    canonicalPath: `/${locale}/gallery`,
    keywords: isJa
      ? [
          "DMC FUJI ギャラリー",
          "着物撮影 写真",
          "富士市 フォトスタジオ 作品",
          "着物 ポートレート",
          "富士山 着物 写真",
        ]
      : [
          "DMC FUJI gallery",
          "kimono photography portfolio",
          "Fuji City photo studio work",
          "kimono portrait Japan",
          "Mt Fuji kimono photos",
        ],
  });
}

export default async function GalleryPage({ params }: Props) {
  const { locale } = await params;
  const isJa = locale === "ja";
  const siteUrl = getSiteUrl();
  const initialImages = await getAllGalleryImages();

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
    {
      name: isJa ? "ギャラリー" : "Gallery",
      url: `${siteUrl}/${locale}/gallery`,
    },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumb} />
      <GalleryHero />
      <ClientGallery initialImages={initialImages} />
    </div>
  );
}
