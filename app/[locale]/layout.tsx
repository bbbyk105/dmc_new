/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Noto_Sans_JP, Crimson_Text } from "next/font/google";
import { locales } from "@/i18n";
import {
  getSiteUrl,
  SITE_NAME,
  buildOrganizationOrLocalBusiness,
  buildWebsiteSearchAction,
} from "@/lib/seo";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import "../globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-crimson-text",
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";

  const baseTitle = isJa
    ? "DMC FUJI | 富士市の着物撮影・レンタルスタジオ"
    : "DMC FUJI | Ceremonial Kimono Photography & Rental Studio in Fuji";

  const description = isJa
    ? "静岡県富士市のフォトスタジオDMC FUJI。着物撮影「花夢(CAMU)」やレンタルスタジオ「Chloe」、アンティークカフェ併設で記念日撮影や成人式・七五三・ブライダルまで対応。"
    : "DMC FUJI is a ceremonial kimono photography and rental studio in Fuji City, Shizuoka. We offer CAMU ceremonial kimono shoots, Chloe rental studio, and an antique cafe for portraits, weddings, and family milestones.";

  const keywords = isJa
    ? [
        "DMC FUJI",
        "着物撮影",
        "富士市 着物",
        "富士市 フォトスタジオ",
        "花夢 CAMU",
        "成人式 前撮り",
        "七五三 写真",
        "ブライダルフォト",
        "レンタルスタジオ",
        "アンティークカフェ",
      ]
    : [
        "DMC FUJI",
        "ceremonial kimono Fuji",
        "Fuji City photo studio",
        "ceremonial kimono photography Japan",
        "pre-wedding shoot Fuji",
        "family portraits Fuji",
        "rental studio Fuji",
        "antique cafe Fuji",
      ];

  const alternates = Object.fromEntries(
    locales.map((localeCode) => [localeCode, `/${localeCode}`]),
  );

  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: baseTitle, template: `%s | ${SITE_NAME}` },
    description,
    keywords,
    openGraph: {
      title: baseTitle,
      description,
      siteName: SITE_NAME,
      locale,
      type: "website",
      url: `/${locale}`,
    },
    twitter: {
      card: "summary",
      title: baseTitle,
      description,
    },
    alternates: {
      languages: alternates,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const siteUrl = getSiteUrl();
  const jsonLdOrg = buildOrganizationOrLocalBusiness(siteUrl);
  const jsonLdWeb = buildWebsiteSearchAction(siteUrl);

  return (
    <html
      lang={locale}
      className={`${notoSansJP.variable} ${crimsonText.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#F5F3F0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWeb) }}
        />
      </head>
      <body className="min-h-screen bg-[#F5F3F0] antialiased">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main>{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
