import type { Metadata } from "next";
import Hero from "@/app/components/(toppage)/Hero";
import { buildCanonical, buildPageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa
      ? "DMC FUJI | 富士市の着物撮影・レンタルスタジオ"
      : "DMC FUJI | Ceremonial Kimono Photography & Rental Studio in Fuji",
    description: isJa
      ? "静岡県富士市のフォトスタジオDMC FUJI。着物撮影「花夢(CAMU)」やレンタルスタジオ「Chloe」、アンティークカフェ併設で記念日撮影や成人式・七五三・ブライダルまで対応。"
      : "DMC FUJI is a ceremonial kimono photography and rental studio in Fuji City, Shizuoka. We offer CAMU ceremonial kimono shoots, Chloe rental studio, and an antique cafe for portraits, weddings, and family milestones.",
    locale,
    canonicalPath: `/${locale}`,
  });
}

export default function HomePage() {
  return <Hero />;
}
