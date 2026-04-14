import type { Metadata } from "next";
import CamuDetail from "@/app/components/(service)/CamuDetail";
import JsonLd from "@/app/components/JsonLd";
import {
  buildPageMeta,
  buildBreadcrumbSchema,
  buildServiceSchema,
  getSiteUrl,
} from "@/lib/seo";
import { SITE_NAME } from "@/lib/site-info";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa
      ? "花夢 (CAMU) - 着物撮影 | DMC"
      : "Kimono Experience in Fuji (CAMU) | Mt. Fuji & Tea Fields | DMC FUJI",
    description: isJa
      ? "富士山と茶畑を背景に、伝統的な着物姿で特別な一枚を撮影します。成人式前撮り・七五三・ブライダルにも対応。"
      : "Kimono photo session with Mt. Fuji and tea fields. Traditional ceremonial kimono experience (CAMU) in Fuji City. Coming-of-age, Shichi-Go-San, and bridal shoots.",
    locale,
    canonicalPath: `/${locale}/service/camu`,
    keywords: isJa
      ? [
          "花夢 CAMU",
          "着物撮影 富士市",
          "着物体験 富士山",
          "成人式 前撮り 富士市",
          "七五三 写真 静岡",
          "ブライダルフォト 富士",
          "茶畑 着物",
          "DMC FUJI",
        ]
      : [
          "CAMU kimono experience",
          "kimono photography Fuji",
          "Mt Fuji kimono photo",
          "tea field kimono",
          "coming of age photography Japan",
          "Shichi-Go-San Fuji",
          "bridal kimono Shizuoka",
          "DMC FUJI",
        ],
    openGraph: {
      image: "/images/camu.webp",
    },
  });
}

export default async function CamuPage({ params }: Props) {
  const { locale } = await params;
  const isJa = locale === "ja";
  const siteUrl = getSiteUrl();

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
    {
      name: isJa ? "サービス" : "Service",
      url: `${siteUrl}/${locale}/service`,
    },
    {
      name: isJa ? "花夢 (CAMU)" : "CAMU Kimono Experience",
      url: `${siteUrl}/${locale}/service/camu`,
    },
  ]);

  const service = buildServiceSchema({
    name: isJa
      ? "花夢 (CAMU) - 着物撮影体験"
      : "CAMU - Kimono Photography Experience",
    description: isJa
      ? "富士山と茶畑を背景に、伝統的な着物姿で特別な一枚を撮影。成人式前撮り・七五三・ブライダルにも対応。"
      : "Kimono photo session with Mt. Fuji and tea fields as your backdrop. Coming-of-age, Shichi-Go-San, and bridal photography available.",
    url: `${siteUrl}/${locale}/service/camu`,
    providerName: SITE_NAME,
    providerUrl: siteUrl,
    areaServed: "Fuji-shi",
    image: `${siteUrl}/images/camu.webp`,
  });

  return (
    <>
      <JsonLd data={breadcrumb} />
      <JsonLd data={service} />
      <CamuDetail />
    </>
  );
}
