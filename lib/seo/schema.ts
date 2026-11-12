import { getSiteUrl } from "./site-url";
import { BUSINESS_NAME } from "@/lib/site-info";
import { buildLocalBusiness, businessId } from "./local-business";

/**
 * LocalBusiness JSON-LD（中身は lib/seo/local-business.ts）
 */
export function buildOrganizationOrLocalBusiness(siteUrl: string, locale: string): object {
  return buildLocalBusiness(siteUrl, locale);
}

/**
 * WebSite JSON-LD（SearchAction は削除・/search が存在しないため）
 */
export function buildWebsite(siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BUSINESS_NAME,
    url: siteUrl,
    inLanguage: ["ja", "en"],
  };
}

/**
 * @deprecated Use buildWebsite. SearchAction を削除したため。
 */
export function buildWebsiteSearchAction(siteUrl: string): object {
  return buildWebsite(siteUrl);
}

/**
 * FAQPage JSON-LD
 */
export function buildFaqSchema(
  faqs: readonly { readonly question: string; readonly answer: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * BlogPosting JSON-LD（ブログ記事ページ用）
 */
export function buildBlogPostingSchema(post: {
  title: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  inLanguage: string;
}): object {
  const siteUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    url: post.url,
    mainEntityOfPage: { "@type": "WebPage", "@id": post.url },
    ...(post.image && { image: post.image }),
    datePublished: post.datePublished,
    dateModified: post.dateModified,
    inLanguage: post.inLanguage,
    author: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: BUSINESS_NAME,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo/logo.png`,
      },
    },
  };
}

/**
 * BreadcrumbList JSON-LD
 */
export function buildBreadcrumbSchema(
  items: { name: string; url: string }[],
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Service JSON-LD（個別サービスページ用）
 */
export function buildServiceSchema(service: {
  name: string;
  description: string;
  url: string;
  providerName: string;
  providerUrl: string;
  areaServed?: string;
  image?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.description,
    url: service.url,
    ...(service.image && { image: service.image }),
    provider: {
      "@type": "LocalBusiness",
      // <head> の LocalBusiness（lib/seo/local-business.ts）と同じお店として結びつける
      "@id": businessId(getSiteUrl()),
      name: service.providerName,
      url: service.providerUrl,
    },
    ...(service.areaServed && {
      areaServed: { "@type": "City", name: service.areaServed },
    }),
  };
}
