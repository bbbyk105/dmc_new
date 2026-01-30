/**
 * サイトの NAP（Name, Address, Phone）と営業情報の一元管理。
 * Footer と JSON-LD schema で共有する。
 */

export const SITE_NAME = "DMC FUJI | Ceremonial Kimono Photo Studio & Rental";

/** 住所（表示用・日本語） */
export const ADDRESS_JA = "〒417-0001 静岡県富士市荒田島町1-13 ラシェット1";
/** 住所（表示用・英語） */
export const ADDRESS_EN =
  "1-13 Aratajimacho, Fuji-shi, Shizuoka, 417-0001, Japan";

/** 電話番号（表示・tel:リンク用） */
export const TELEPHONE_DISPLAY = "+81-545-55-4550";
/** 電話番号（E.164・schema用） */
export const TELEPHONE_E164 = "+81545554550";

/** 営業時間（表示用・日本語） */
export const HOURS_JA = "11:00〜17:00";
/** 営業時間（表示用・英語） */
export const HOURS_EN = "11:00 - 17:00";
/** 定休（表示用・日本語） */
export const CLOSED_JA = "定休日: 水曜日";
/** 定休（表示用・英語） */
export const CLOSED_EN = "Closed: Wednesday";

/** schema.org PostalAddress 用 */
export const ADDRESS_SCHEMA = {
  "@type": "PostalAddress" as const,
  streetAddress: "1-13 Aratajimacho, Rashette 1",
  addressLocality: "Fuji-shi",
  addressRegion: "Shizuoka",
  postalCode: "417-0001",
  addressCountry: "JP",
};

/**
 * schema.org openingHoursSpecification（営業 11:00-17:00、水曜定休）
 * Mo,Tu,Th,Fr,Sa 11:00-17:00
 */
export const OPENING_HOURS_SPECIFICATION = [
  {
    "@type": "OpeningHoursSpecification" as const,
    dayOfWeek: ["Monday", "Tuesday", "Thursday", "Friday", "Saturday"],
    opens: "11:00",
    closes: "17:00",
  },
];

/** Instagram（sameAs 用） */
export const SAME_AS_INSTAGRAM = "https://www.instagram.com/dmcfuji123/";
