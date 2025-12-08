import type { MetadataRoute } from "next";
import { locales } from "@/i18n";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://example.com";

const routes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/service", changeFrequency: "monthly", priority: 0.9 },
  { path: "/service/camu", changeFrequency: "monthly", priority: 0.85 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${BASE_URL}/${locale}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      lastModified,
    }))
  );
}
