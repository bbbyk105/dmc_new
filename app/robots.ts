import type { MetadataRoute } from "next";
import { locales } from "@/i18n";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://example.com";

export default function robots(): MetadataRoute.Robots {
  const sitemaps = locales.map((locale) => `${BASE_URL}/${locale}/sitemap.xml`);

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: sitemaps,
  };
}

