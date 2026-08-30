import type { Metadata } from "next";
import JsonLd from "@/app/components/JsonLd";
import Breadcrumb from "@/app/components/Breadcrumb";
import AboutContent from "@/app/components/(about)/AboutContent";
import CtaSection from "@/app/components/(toppage)/CtaSection";
import { buildPageMeta, buildBreadcrumbSchema, getSiteUrl } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa
      ? "私たちについて | DMC FUJI 富士市の着物撮影スタジオ"
      : "Our Story | DMC FUJI Kimono Studio in Fuji",
    description: isJa
      ? "DMC = Dad・Mom・Child。父の力、母の優しさ、子どもを育てる心。家族のような心で、日本の文化とおもてなしを世界へ届ける富士市の着物撮影スタジオ DMC FUJI のストーリーとアクセス。"
      : "DMC stands for Dad, Mom, Child. From the heart of family, inspiring the world: the story behind DMC FUJI, a kimono photo studio in Fuji City, Shizuoka, plus access and parking.",
    locale,
    canonicalPath: `/${locale}/about`,
    keywords: isJa
      ? [
          "DMC FUJI",
          "DMC 富士市",
          "着物撮影 富士市",
          "富士市 フォトスタジオ",
          "Dad Mom Child",
          "アクセス 駐車場",
        ]
      : [
          "DMC FUJI",
          "about DMC FUJI",
          "kimono studio Fuji City",
          "Dad Mom Child",
          "access parking",
        ],
    openGraph: { type: "website", image: "/images/camu.webp" },
  });
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  const isJa = locale === "ja";
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/${locale}/about`;

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
    { name: isJa ? "私たちについて" : "Our Story", url: pageUrl },
  ]);

  const aboutPage = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: isJa ? "私たちについて | DMC FUJI" : "Our Story | DMC FUJI",
    url: pageUrl,
    inLanguage: locale,
    description: isJa
      ? "DMC = Dad・Mom・Child。家族のような心で、日本の文化とおもてなしを世界へ届ける。"
      : "DMC stands for Dad, Mom, Child. From the heart of family, inspiring the world.",
    about: {
      "@type": "Organization",
      name: "DMC FUJI",
      url: siteUrl,
      slogan: "We are family.",
    },
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={aboutPage} />
      <Breadcrumb
        items={[
          { name: isJa ? "ホーム" : "Home", href: `/${locale}` },
          { name: isJa ? "私たちについて" : "Our Story" },
        ]}
      />
      <AboutContent />
      <CtaSection />
    </>
  );
}
