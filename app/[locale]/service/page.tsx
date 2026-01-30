import type { Metadata } from "next";
import IntroHeader from "@/app/components/(service)/IntroHeader";
import ValueSection from "@/app/components/(service)/ValueSection";
import FeaturedSection from "@/app/components/(service)/FeaturedSection";
import ServiceGrid from "@/app/components/(service)/ServiceGrid";
import FlowSection from "@/app/components/(service)/FlowSection";
import FaqSection from "@/app/components/(service)/FaqSection";
import FinalCtaSection from "@/app/components/(service)/FinalCtaSection";
import { buildPageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa ? "サービス | DMC FUJI" : "Service | DMC FUJI",
    description: isJa
      ? "静岡県富士市のDMC FUJI。着物撮影「花夢(CAMU)」、レンタルスタジオ「Chloe」、アンティークカフェのご紹介。"
      : "DMC FUJI in Fuji City, Shizuoka. CAMU ceremonial kimono photography, Chloe rental studio, and antique cafe.",
    locale,
    canonicalPath: `/${locale}/service`,
  });
}

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <IntroHeader />
      <ValueSection />
      <FeaturedSection />
      <ServiceGrid />
      <FlowSection />
      <FaqSection />
      <FinalCtaSection />
    </div>
  );
}
