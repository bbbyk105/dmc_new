import type { Metadata } from "next";
import Hero from "@/app/components/(toppage)/Hero";
import JsonLd from "@/app/components/JsonLd";
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

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  const isJa = locale === "ja";
  const siteUrl = getSiteUrl();

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <Hero />
    </>
  );
}
