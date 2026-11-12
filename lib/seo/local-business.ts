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
  LEGAL_NAME,
  OPENING_HOURS_SPECIFICATION,
  PRICE_RANGE,
  SAME_AS_INSTAGRAM,
  TELEPHONE_E164,
} from "../site-info.ts";

/** 店舗データの @id。サービスの provider などから参照する */
export function businessId(siteUrl: string): string {
  return `${siteUrl}/#business`;
}

// 海外から来る方向けの着物撮影（CAMU）を先に出す
const OFFERS = {
  ja: [
    {
      name: "着物撮影「CAMU」（海外のお客さま向け）",
      description: "富士山と茶畑を背景に、色打掛を着て撮影する、海外から来る方向けの着物撮影。着付け・ヘアセット・撮影データのお渡しまで。",
    },
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
      name: "Kimono Photo Experience at Mt. Fuji (CAMU)",
      description:
        "Ceremonial kimono photo sessions for visitors from overseas, with Mt. Fuji and tea fields as your backdrop. Kimono rental, dressing, hair styling and photo data included.",
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
    legalName: LEGAL_NAME,
    description: isJa
      ? "富士山のふもと、静岡県富士市の着物体験と写真撮影のスタジオ（DMC = Dad・Mom・Child）。海外から来る方向けの着物撮影「CAMU」、日本の方向けの「花夢」、レンタルスタジオ「Chloe」。"
      : "Kimono experience and photo shoots at the foot of Mt. Fuji in Fuji City, Shizuoka, for visitors from overseas (DMC = Dad, Mom, Child). Ceremonial kimono photo sessions (CAMU) with Mt. Fuji and tea fields, and a rental studio (Chloe).",
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
