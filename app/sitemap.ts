import type { MetadataRoute } from "next";
import { locales } from "@/i18n";
import { getSiteUrl } from "@/lib/seo";
import { fetchBlogList } from "@/lib/microcms";
import { pageRoutes } from "@/lib/routes";
import { getActiveProducts } from "@/lib/db/shop";

// 管理画面で足した商品・新しいブログ記事を、デプロイし直さなくても載せる（1 時間ごとに作り直す）
export const revalidate = 3600;

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

  // ショップの商品（読めなければ商品だけ外し、ほかのページの sitemap は出す）
  const products = await getActiveProducts().catch((error) => {
    console.error("[sitemap] 商品を読めませんでした", error);
    return [];
  });
  const productEntries = locales.flatMap((locale) =>
    products.map((product) => ({
      url: `${baseUrl}/${locale}/shop/${product.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
      lastModified: new Date(product.updated_at),
    })),
  );

  return [...staticEntries, ...blogEntries, ...productEntries];
}
