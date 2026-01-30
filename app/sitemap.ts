import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getSiteUrl } from "@/lib/seo";

const routes = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/service", changeFrequency: "monthly" as const, priority: 0.9 },
  {
    path: "/service/camu",
    changeFrequency: "monthly" as const,
    priority: 0.85,
  },
  { path: "/gallery", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  return locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      lastModified,
    })),
  );
}
