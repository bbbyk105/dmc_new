import type { Metadata } from "next";
import { getSiteUrl } from "./site-url";

const SITE_NAME = "DMC FUJI | Ceremonial Kimono Photo Studio & Rental";

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
  openGraph?: { title?: string; description?: string; type?: "website" };
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
  const canonical = buildCanonical(canonicalPath);
  const ogTitle = openGraph?.title ?? title;
  const ogDescription = openGraph?.description ?? description;

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
    },
    twitter: {
      card: "summary",
      title: ogTitle,
      description: ogDescription,
    },
    alternates: {
      canonical,
    },
  };
}

export { SITE_NAME };
