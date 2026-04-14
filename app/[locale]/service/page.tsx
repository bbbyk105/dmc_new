import type { Metadata } from "next";
import IntroHeader from "@/app/components/(service)/IntroHeader";
import ValueSection from "@/app/components/(service)/ValueSection";
import FeaturedSection from "@/app/components/(service)/FeaturedSection";
import ServiceGrid from "@/app/components/(service)/ServiceGrid";
import FlowSection from "@/app/components/(service)/FlowSection";
import FaqSection from "@/app/components/(service)/FaqSection";
import FinalCtaSection from "@/app/components/(service)/FinalCtaSection";
import JsonLd from "@/app/components/JsonLd";
import {
  buildPageMeta,
  buildFaqSchema,
  buildBreadcrumbSchema,
  buildServiceSchema,
  getSiteUrl,
} from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-info";
import { faqContent } from "@/lib/faq-data";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa ? "サービス | DMC FUJI" : "Service | DMC FUJI",
    description: isJa
      ? "静岡県富士市のDMC FUJI。着物撮影「花夢(CAMU)」、レンタルスタジオ「Chloe」、アンティークカフェのご紹介。"
      : "Kimono experience (Mt. Fuji & tea fields), photo studio rental, and matcha experience in Fuji City. CAMU, Chloe, and antique cafe.",
    locale,
    canonicalPath: `/${locale}/service`,
    keywords: isJa
      ? [
          "DMC FUJI",
          "着物撮影 富士市",
          "花夢 CAMU",
          "レンタルスタジオ Chloe",
          "抹茶体験",
          "富士市 フォトスタジオ",
          "着物体験 静岡",
        ]
      : [
          "DMC FUJI",
          "kimono experience Fuji",
          "CAMU kimono photography",
          "Chloe rental studio",
          "matcha experience",
          "Fuji City photo studio",
        ],
  });
}

export default async function ServicePage({ params }: Props) {
  const { locale } = await params;
  const isJa = locale === "ja";
  const siteUrl = getSiteUrl();
  const faqs = faqContent[locale as "ja" | "en"] ?? faqContent.ja;

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
    {
      name: isJa ? "サービス" : "Service",
      url: `${siteUrl}/${locale}/service`,
    },
  ]);

  const services = [
    buildServiceSchema({
      name: isJa ? "花夢 (CAMU) - 着物撮影" : "CAMU - Kimono Photography",
      description: isJa
        ? "富士山と茶畑を背景にした伝統的な着物撮影体験。"
        : "Traditional kimono photography with Mt. Fuji and tea fields.",
      url: `${siteUrl}/${locale}/service/camu`,
      providerName: SITE_NAME,
      providerUrl: siteUrl,
      areaServed: "Fuji-shi",
      image: `${siteUrl}/images/camu.webp`,
    }),
    buildServiceSchema({
      name: isJa
        ? "Chloe - レンタルスタジオ"
        : "Chloe - Rental Photo Studio",
      description: isJa
        ? "富士市のレンタルフォトスタジオ。撮影やポートレートに。"
        : "Rental studio for photo shoots and portraits in Fuji City.",
      url: `${siteUrl}/${locale}/service`,
      providerName: SITE_NAME,
      providerUrl: siteUrl,
      areaServed: "Fuji-shi",
      image: `${siteUrl}/images/chloe.webp`,
    }),
    buildServiceSchema({
      name: isJa ? "抹茶・お茶体験" : "Matcha / Tea Experience",
      description: isJa
        ? "着物やスタジオセッションと合わせて楽しめる抹茶・お茶体験。"
        : "Matcha and tea tasting experience. Optional add-on to kimono or studio sessions.",
      url: `${siteUrl}/${locale}/service`,
      providerName: SITE_NAME,
      providerUrl: siteUrl,
      areaServed: "Fuji-shi",
      image: `${siteUrl}/images/cha.webp`,
    }),
  ];

  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <JsonLd data={buildFaqSchema(faqs.items)} />
      <JsonLd data={breadcrumb} />
      {services.map((s, i) => (
        <JsonLd key={i} data={s} />
      ))}
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
