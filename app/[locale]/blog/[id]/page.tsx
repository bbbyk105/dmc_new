import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import JsonLd from "@/app/components/JsonLd";
import Breadcrumb from "@/app/components/Breadcrumb";
import {
  fetchBlogItem,
  fetchBlogList,
  formatPublishedDate,
  getCategoryName,
  getThumbnail,
  stripHtml,
} from "@/lib/microcms";
import {
  buildPageMeta,
  buildBreadcrumbSchema,
  buildBlogPostingSchema,
  getSiteUrl,
} from "@/lib/seo";

// microCMS の更新を60秒ごとに反映（ISR）
export const revalidate = 60;

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateStaticParams() {
  const { contents } = await fetchBlogList({ limit: 100, fields: "id" });
  return contents.map((post) => ({ id: post.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params;
  const post = await fetchBlogItem(id);
  if (!post) {
    return {
      title: locale === "ja" ? "記事が見つかりません" : "Post Not Found",
      robots: { index: false, follow: false },
    };
  }
  const thumb = getThumbnail(post);
  const description =
    post.excerpt ?? (post.content ? stripHtml(post.content) : post.title);
  return buildPageMeta({
    title: post.title,
    description,
    locale,
    canonicalPath: `/${locale}/blog/${id}`,
    openGraph: {
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      ...(thumb && { image: thumb.url }),
    },
  });
}

export default async function BlogDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const isJa = locale === "ja";
  const post = await fetchBlogItem(id);
  if (!post) notFound();

  const siteUrl = getSiteUrl();
  const thumb = getThumbnail(post);
  const categoryName = getCategoryName(post.category);
  const description =
    post.excerpt ?? (post.content ? stripHtml(post.content) : post.title);
  const postUrl = `${siteUrl}/${locale}/blog/${id}`;

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
    { name: isJa ? "ブログ" : "Blog", url: `${siteUrl}/${locale}/blog` },
    { name: post.title, url: postUrl },
  ]);

  const blogPosting = buildBlogPostingSchema({
    title: post.title,
    description,
    url: postUrl,
    image: thumb?.url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    inLanguage: locale,
  });

  return (
    <div className="min-h-screen bg-white">
      <JsonLd data={breadcrumb} />
      <JsonLd data={blogPosting} />
      <Breadcrumb
        items={[
          { name: isJa ? "ホーム" : "Home", href: `/${locale}` },
          { name: isJa ? "ブログ" : "Blog", href: `/${locale}/blog` },
          { name: post.title },
        ]}
      />

      <article className="pb-16 md:pb-24">
        {/* Header */}
        <header className="bg-white py-10 md:py-14">
          <div className="mx-auto max-w-[820px] px-5 md:px-6">
            <div className="flex flex-wrap items-center gap-3 font-['Noto_Sans_JP'] text-xs text-[#8B7355] md:text-sm">
              <time dateTime={post.publishedAt}>
                {formatPublishedDate(post.publishedAt, locale)}
              </time>
              {categoryName && (
                <span className="rounded-full border border-[#C9A97C]/50 px-3 py-0.5 text-[11px] md:text-xs">
                  {categoryName}
                </span>
              )}
            </div>
            <h1 className="mt-4 font-mincho text-2xl font-semibold leading-snug tracking-tight text-[#111] md:text-4xl">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="mt-4 text-sm leading-7 text-[#5A5A5A] md:text-[15px]">
                {post.excerpt}
              </p>
            )}
          </div>
        </header>

        {/* Eyecatch */}
        {thumb && (
          <div className="mx-auto max-w-[820px] px-5 md:px-6">
            <div className="relative aspect-video overflow-hidden rounded-lg bg-[#F5F1ED]">
              <Image
                src={thumb.url}
                alt={post.title}
                fill
                sizes="(min-width: 1024px) 820px, 100vw"
                priority
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Body */}
        <div className="mx-auto mt-10 max-w-[760px] px-5 md:mt-12 md:px-6">
          {post.content ? (
            <div
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-sm leading-7 text-[#5A5A5A]">
              {isJa ? "本文は準備中です。" : "This post is coming soon."}
            </p>
          )}

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-black/5 pt-8 font-['Noto_Sans_JP'] text-sm">
            <span className="text-[#8B7355]">
              {isJa ? "最終更新: " : "Last updated: "}
              {formatPublishedDate(post.updatedAt, locale)}
            </span>
            <Link
              href={`/${locale}/blog`}
              className="font-medium text-[#8B7355] transition-colors hover:text-[#5A4A3A]"
            >
              {isJa ? "ブログ一覧に戻る →" : "Back to Blog →"}
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
