import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import JsonLd from "@/app/components/JsonLd";
import Breadcrumb from "@/app/components/Breadcrumb";
import {
  fetchBlogList,
  formatPublishedDate,
  getCategoryName,
  getThumbnail,
} from "@/lib/microcms";
import { buildPageMeta, buildBreadcrumbSchema, getSiteUrl } from "@/lib/seo";

// microCMS の更新を60秒ごとに反映（ISR）
export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa ? "ブログ | DMC FUJI" : "Blog | DMC FUJI",
    description: isJa
      ? "DMC FUJIのブログ。富士市での着物撮影のコツ、富士山や茶畑のベストシーズン、スタジオの最新情報などをお届けします。"
      : "Blog by DMC FUJI. Tips for kimono photography in Fuji City, the best seasons for Mt. Fuji and tea fields, and studio news.",
    locale,
    canonicalPath: `/${locale}/blog`,
    keywords: isJa
      ? [
          "DMC FUJI ブログ",
          "着物撮影 コツ",
          "富士市 フォトスタジオ",
          "富士山 撮影 シーズン",
          "成人式 前撮り 準備",
        ]
      : [
          "DMC FUJI blog",
          "kimono photography tips",
          "Fuji City photo studio",
          "Mt Fuji photo season",
          "kimono experience Japan",
        ],
  });
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  const isJa = locale === "ja";
  const siteUrl = getSiteUrl();
  const { contents: posts } = await fetchBlogList();

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
    { name: isJa ? "ブログ" : "Blog", url: `${siteUrl}/${locale}/blog` },
  ]);

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumb} />
      <Breadcrumb
        items={[
          { name: isJa ? "ホーム" : "Home", href: `/${locale}` },
          { name: isJa ? "ブログ" : "Blog" },
        ]}
      />

      {/* Hero */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-[1200px] px-5 md:px-6">
          <div className="space-y-3">
            <h1 className="font-mincho text-3xl font-semibold tracking-tight text-[#111] md:text-5xl">
              <span className="sr-only">
                {isJa
                  ? "富士市の着物撮影ブログ｜DMC FUJI"
                  : "Kimono Photography Blog in Fuji｜DMC FUJI"}
              </span>
              <span aria-hidden="true">Blog</span>
            </h1>
            <p className="text-[15px] leading-7 text-[#5A5A5A] md:text-base">
              {isJa
                ? "撮影のコツやスタジオの最新情報をお届けします"
                : "Photography tips and the latest news from our studio"}
            </p>
          </div>
        </div>
      </section>

      {/* Post List */}
      <section className="bg-white pb-16 md:pb-24">
        <div className="mx-auto max-w-[1200px] px-5 md:px-6">
          {posts.length === 0 ? (
            <p className="border-t border-black/5 pt-10 text-sm leading-7 text-[#5A5A5A]">
              {isJa
                ? "記事は準備中です。公開まで少々お待ちください。"
                : "Posts are coming soon. Please check back later."}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-8 border-t border-black/5 pt-10 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const thumb = getThumbnail(post);
                const categoryName = getCategoryName(post.category);
                return (
                  <article key={post.id} className="group">
                    <Link
                      href={`/${locale}/blog/${post.id}`}
                      className="block space-y-3"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-[#F5F1ED]">
                        {thumb ? (
                          <Image
                            src={thumb.url}
                            alt={post.title}
                            fill
                            sizes="(min-width: 1024px) 384px, (min-width: 640px) 50vw, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <span className="font-mincho text-2xl text-[#C9A97C]">
                              DMC FUJI
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 font-['Noto_Sans_JP'] text-xs text-[#8B7355]">
                        <time dateTime={post.publishedAt}>
                          {formatPublishedDate(post.publishedAt, locale)}
                        </time>
                        {categoryName && (
                          <span className="rounded-full border border-[#C9A97C]/50 px-3 py-0.5 text-[11px] text-[#8B7355]">
                            {categoryName}
                          </span>
                        )}
                      </div>
                      <h2 className="font-mincho text-base font-semibold leading-7 text-[#2C2C2C] transition-colors group-hover:text-[#8B7355] md:text-lg">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="line-clamp-3 text-sm leading-6 text-[#5A5A5A]">
                          {post.excerpt}
                        </p>
                      )}
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
