/**
 * 店舗（LocalBusiness）の JSON-LD。全ページの <head> に出す（app/[locale]/layout.tsx）。
 *
 * Google マップ（ビジネスプロフィール）の店舗と同じお店だと結びつけてもらえるよう、
 * 店名・住所・電話・営業時間（NAP）は lib/site-info.ts の値だけを使い、
 * 地図は店舗ページ（CID）・位置はピンの緯度経度で指す。
 *
 * Next に依存しない（local-business.test.mjs が node --test で直接読む）。
 */
import {
  ADDRESS_SCHEMA,
  ADDRESS_SCHEMA_JA,
  BUSINESS_ALTERNATE_NAMES,
  BUSINESS_NAME,
  GEO_COORDINATES,
  GOOGLE_MAPS_URL,
  OPENING_HOURS_SPECIFICATION,
  PRICE_RANGE,
  SAME_AS_INSTAGRAM,
  TELEPHONE_E164,
} from "../site-info.ts";

/** 店舗データの @id。サービスの provider などから参照する */
export function businessId(siteUrl: string): string {
  return `${siteUrl}/#business`;
}

const OFFERS = {
  ja: [
    {
      name: "着物撮影「花夢」",
      description: "富士山と茶畑を背景にした着物撮影。成人式の前撮り・七五三・ブライダルにも対応。",
    },
    {
      name: "レンタルスタジオ「Chloe」",
      description: "撮影や記念写真に使えるレンタルスタジオ。1 時間から借りられます。",
    },
    {
      name: "抹茶・カフェ体験",
      description: "着物撮影やスタジオと合わせて楽しめる抹茶とカフェ。",
    },
  ],
  en: [
    {
      name: "Kimono Experience in Fuji (CAMU)",
      description:
        "Kimono wearing and photo session with Mt. Fuji and tea fields as your backdrop, in Fuji City, Shizuoka.",
    },
    {
      name: "Photo Studio Rental (Chloe)",
      description: "Rental studio for photo shoots and portraits in Fuji City, available by the hour.",
    },
    {
      name: "Matcha / Tea Experience",
      description: "Matcha and tea tasting. Optional add-on to kimono or studio sessions.",
    },
  ],
} as const;

export function buildLocalBusiness(siteUrl: string, locale: string) {
  const isJa = locale !== "en";
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": businessId(siteUrl),
    name: BUSINESS_NAME,
    alternateName: BUSINESS_ALTERNATE_NAMES,
    description: isJa
      ? "静岡県富士市の着物撮影・着物レンタル・レンタルスタジオ。富士山と茶畑を背景にした着物撮影「花夢」、レンタルスタジオ「Chloe」、抹茶とカフェ。"
      : "Kimono photography, kimono rental and a rental photo studio in Fuji City, Shizuoka, with Mt. Fuji and tea fields as the backdrop.",
    // Google マップの店舗ページの「ウェブサイト」（dmc123.jp）と同じ。@id で参照する側（サービスの provider）もこの URL
    url: siteUrl,
    image: `${siteUrl}/images/hero.jpg`,
    logo: `${siteUrl}/logo/logo.png`,
    telephone: TELEPHONE_E164,
    address: isJa ? ADDRESS_SCHEMA_JA : ADDRESS_SCHEMA,
    geo: GEO_COORDINATES,
    hasMap: GOOGLE_MAPS_URL,
    openingHoursSpecification: OPENING_HOURS_SPECIFICATION,
    priceRange: PRICE_RANGE,
    currenciesAccepted: "JPY",
    amenityFeature: [
      {
        "@type": "LocationFeatureSpecification",
        name: isJa ? "無料駐車場" : "Free parking",
        value: true,
      },
    ],
    knowsLanguage: ["ja", "en"],
    areaServed: [
      {
        "@type": "City",
        name: isJa ? "富士市" : "Fuji-shi",
        containedInPlace: { "@type": "AdministrativeArea", name: isJa ? "静岡県" : "Shizuoka" },
      },
      { "@type": "Country", name: isJa ? "日本" : "Japan" },
    ],
    sameAs: [SAME_AS_INSTAGRAM, GOOGLE_MAPS_URL],
    makesOffer: OFFERS[isJa ? "ja" : "en"].map((offer) => ({
      "@type": "Offer",
      name: offer.name,
      description: offer.description,
      itemOffered: { "@type": "Service", name: offer.name },
    })),
  };
}
