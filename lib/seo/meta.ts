import type { Metadata } from "next";
import { defaultLocale, locales } from "@/i18n";
import { getSiteUrl } from "./site-url";

const SITE_NAME = "DMC FUJI | Ceremonial Kimono Photo Studio & Rental";
/** <title> の接尾辞に使う短いブランド名 */
const BRAND_SHORT = "DMC FUJI";

/** デフォルト OG 画像パス（public/ 配下） */
const DEFAULT_OG_IMAGE = "/images/hero.jpg";

/**
 * 正規URLを組み立てる（getSiteUrl() + pathname）
 */
export function buildCanonical(pathname: string): string {
  const base = getSiteUrl();
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return `${base}${path}`;
}

export interface PageMetaInput {
  title: string;
  description: string;
  locale: string;
  canonicalPath: string;
  keywords?: string[];
  openGraph?: {
    title?: string;
    description?: string;
    type?: "website" | "article";
    image?: string;
    /** type: "article" のときのみ有効 */
    publishedTime?: string;
    modifiedTime?: string;
  };
}

/**
 * ページ別メタデータを組み立てる。
 * title template: "{pageTitle} | {SiteName}"
 */
export function buildPageMeta({
  title,
  description,
  locale,
  canonicalPath,
  keywords,
  openGraph,
}: PageMetaInput): Metadata {
  const baseUrl = getSiteUrl();
  const canonical = buildCanonical(canonicalPath);
  const ogTitle = openGraph?.title ?? title;
  const ogDescription = openGraph?.description ?? description;
  const ogImage = openGraph?.image ?? DEFAULT_OG_IMAGE;
  // hreflang: 同一パスの ja/en ペアを絶対URLで構築（本番 view-source で絶対URLになる）
  const pathWithoutLocale = canonicalPath.replace(/^\/(ja|en)/, "") || "";
  const languages = Object.fromEntries(
    locales.map((loc) => [loc, `${baseUrl}/${loc}${pathWithoutLocale}`]),
  ) as Record<string, string>;
  // x-default: 検索エンジン向けの既定言語（このサイトでは ja）を明示する
  languages["x-default"] = `${baseUrl}/${defaultLocale}${pathWithoutLocale}`;

  return {
    // ページ側の title に既にブランド名が含まれていれば付け足さない。
    // 付ける場合も短い "| DMC FUJI" のみ（旧テンプレートはサイト名が長く二重になっていた）。
    title: {
      absolute: /DMC FUJI/i.test(title) ? title : `${title} | ${BRAND_SHORT}`,
    },
    description,
    ...(keywords && keywords.length > 0 && { keywords }),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: SITE_NAME,
      locale,
      type: openGraph?.type ?? "website",
      ...(openGraph?.type === "article" && {
        publishedTime: openGraph.publishedTime,
        modifiedTime: openGraph.modifiedTime,
      }),
      url: canonical,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    alternates: {
      canonical,
      languages,
    },
  };
}

export { SITE_NAME };
