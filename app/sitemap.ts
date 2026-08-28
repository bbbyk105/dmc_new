import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getSiteUrl } from "@/lib/seo";
import { fetchBlogList } from "@/lib/microcms";

const routes = [
  { path: "", changeFrequency: "weekly" as const, priority: 1 },
  { path: "/service", changeFrequency: "monthly" as const, priority: 0.9 },
  {
    path: "/service/camu",
    changeFrequency: "monthly" as const,
    priority: 0.85,
  },
  { path: "/gallery", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly" as const, priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly" as const, priority: 0.8 },
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  const staticEntries = locales.flatMap((locale) =>
    routes.map((route) => ({
      url: `${baseUrl}/${locale}${route.path}`,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      lastModified,
    })),
  );

  // microCMS のブログ記事（未設定・取得失敗時は空配列になる）
  const { contents: posts } = await fetchBlogList({
    limit: 100,
    fields: "id,updatedAt",
  });
  const blogEntries = locales.flatMap((locale) =>
    posts.map((post) => ({
      url: `${baseUrl}/${locale}/blog/${post.id}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
      lastModified: new Date(post.updatedAt),
    })),
  );

  return [...staticEntries, ...blogEntries];
}
