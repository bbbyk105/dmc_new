import { getSiteUrl } from "./site-url";
import {
  SITE_NAME,
  ADDRESS_SCHEMA,
  TELEPHONE_E164,
  OPENING_HOURS_SPECIFICATION,
  SAME_AS_INSTAGRAM,
} from "@/lib/site-info";

/**
 * LocalBusiness JSON-LD（NAP + makesOffer で主要サービスを表現）
 */
export function buildOrganizationOrLocalBusiness(siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: siteUrl,
    image: `${siteUrl}/images/hero.jpg`,
    priceRange: "¥10,000–¥100,000",
    address: ADDRESS_SCHEMA,
    telephone: TELEPHONE_E164,
    hasMap:
      "https://www.google.com/maps/search/?api=1&query=" +
      encodeURIComponent("1-13 Aratajimacho, Fuji-shi, Shizuoka, 417-0043"),
    openingHoursSpecification: OPENING_HOURS_SPECIFICATION,
    areaServed: [
      {
        "@type": "City",
        name: "Fuji-shi",
        containedInPlace: { "@type": "AdministrativeArea", name: "Shizuoka" },
      },
      { "@type": "Country", name: "Japan" },
    ],
    sameAs: [SAME_AS_INSTAGRAM],
    makesOffer: [
      {
        "@type": "Offer",
        name: "Kimono Experience in Fuji",
        description:
          "Kimono wearing and photo session with Mt. Fuji and tea fields as your backdrop. Traditional ceremonial kimono experience in Fuji City, Shizuoka.",
        itemOffered: {
          "@type": "Service",
          name: "Kimono Experience in Fuji",
          areaServed: { "@type": "City", name: "Fuji-shi" },
        },
      },
      {
        "@type": "Offer",
        name: "Photo Studio Rental (Chloe)",
        description:
          "Rental studio for photo shoots and portraits. Chloe studio space available for hire in Fuji City.",
        itemOffered: {
          "@type": "Service",
          name: "Photo Studio Rental (Chloe)",
        },
      },
      {
        "@type": "Offer",
        name: "Matcha / Tea Experience",
        description:
          "Matcha and tea tasting experience. Optional add-on to kimono or studio sessions.",
        itemOffered: {
          "@type": "Service",
          name: "Matcha / Tea Experience",
        },
      },
    ],
  };
}

/**
 * WebSite JSON-LD（SearchAction は削除・/search が存在しないため）
 */
export function buildWebsite(siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
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
      name: SITE_NAME,
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
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
      name: service.providerName,
      url: service.providerUrl,
    },
    ...(service.areaServed && {
      areaServed: { "@type": "City", name: service.areaServed },
    }),
  };
}
