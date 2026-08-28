import type { Metadata } from "next";
import Hero from "@/app/components/(toppage)/Hero";
import StatementSection from "@/app/components/(toppage)/StatementSection";
import ServicesShowcase from "@/app/components/(toppage)/ServicesShowcase";
import GalleryShowcase, {
  type ShowcaseImage,
} from "@/app/components/(toppage)/GalleryShowcase";
import CtaSection from "@/app/components/(toppage)/CtaSection";
import JsonLd from "@/app/components/JsonLd";
import { getAllGalleryImages } from "@/lib/supabase";
import { buildPageMeta, buildBreadcrumbSchema, getSiteUrl } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa
      ? "DMC FUJI | 富士市の着物撮影・レンタルスタジオ"
      : "DMC FUJI | Kimono Experience in Fuji – Mt. Fuji & Tea Fields",
    description: isJa
      ? "静岡県富士市のフォトスタジオDMC FUJI。着物撮影「花夢(CAMU)」やレンタルスタジオ「Chloe」、アンティークカフェ併設で記念日撮影や成人式・七五三・ブライダルまで対応。"
      : "Kimono experience in Fuji City, Shizuoka. Photo sessions with Mt. Fuji and tea fields. Ceremonial kimono (CAMU), studio rental (Chloe), and matcha experience.",
    locale,
    canonicalPath: `/${locale}`,
    keywords: isJa
      ? [
          "DMC FUJI",
          "着物撮影",
          "富士市 着物",
          "富士市 フォトスタジオ",
          "着物体験 静岡",
          "花夢 CAMU",
          "成人式 前撮り",
          "七五三 写真",
          "ブライダルフォト",
          "レンタルスタジオ",
        ]
      : [
          "DMC FUJI",
          "kimono experience Fuji",
          "Fuji City photo studio",
          "kimono photography Japan",
          "Mt Fuji kimono",
          "ceremonial kimono Shizuoka",
        ],
  });
}

/** ショーケース用: Supabase の実作品から抜粋（取得失敗時はローカル画像） */
async function getShowcaseImages(): Promise<ShowcaseImage[]> {
  const fallback: ShowcaseImage[] = [
    "/images/hero1.jpg",
    "/images/fuji.webp",
    "/images/camu.webp",
    "/images/hero2.jpg",
    "/images/cha.webp",
    "/images/IMG_8268.jpeg",
    "/images/hero3.jpg",
    "/images/studio.webp",
  ].map((src) => ({ src, alt: "DMC FUJI 着物撮影の作品" }));

  try {
    const all = await getAllGalleryImages();
    if (all.length === 0) return fallback;
    // 各カテゴリからバランスよく最大8枚
    const picked = all
      .filter((_, i) => i % Math.max(1, Math.floor(all.length / 8)) === 0)
      .slice(0, 8);
    return picked.map((img) => ({
      src: img.publicUrl,
      alt: `DMC FUJI 富士市の着物撮影（${img.category}）`,
    }));
  } catch {
    return fallback;
  }
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const isJa = locale === "ja";
  const siteUrl = getSiteUrl();
  const showcaseImages = await getShowcaseImages();

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <Hero />
      <StatementSection />
      <ServicesShowcase />
      <GalleryShowcase images={showcaseImages} />
      <CtaSection />
    </>
  );
}
