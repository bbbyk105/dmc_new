import { getRequestConfig } from "next-intl/server";

export const locales = ["ja", "en"] as const;
export const defaultLocale = "ja" as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale を await で取得
  let locale = await requestLocale;

  // ロケールの検証
  if (!locale || !locales.includes(locale as Locale)) {
    locale = defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
