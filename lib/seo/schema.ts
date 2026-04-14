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
    address: ADDRESS_SCHEMA,
    telephone: TELEPHONE_E164,
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
