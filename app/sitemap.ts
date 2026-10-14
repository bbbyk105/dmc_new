import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getSiteUrl } from "@/lib/seo";
import { fetchBlogList } from "@/lib/microcms";
import { pageRoutes } from "@/lib/routes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();
  const lastModified = new Date();

  const staticEntries = locales.flatMap((locale) =>
    pageRoutes.map((route) => ({
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
