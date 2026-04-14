import type { Metadata } from "next";
import { locales } from "@/i18n";
import { getSiteUrl } from "./site-url";

const SITE_NAME = "DMC FUJI | Ceremonial Kimono Photo Studio & Rental";

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
    type?: "website";
    image?: string;
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
  );

  return {
    title: { default: title, template: `%s | ${SITE_NAME}` },
    description,
    ...(keywords && keywords.length > 0 && { keywords }),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      siteName: SITE_NAME,
      locale,
      type: openGraph?.type ?? "website",
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
