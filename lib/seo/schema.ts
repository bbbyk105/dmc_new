const SITE_NAME = "DMC FUJI | Ceremonial Kimono Photo Studio & Rental";

/**
 * Organization または LocalBusiness の JSON-LD を組み立てる（プレーンオブジェクト）
 */
export function buildOrganizationOrLocalBusiness(siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    url: siteUrl,
  };
}

/**
 * WebSite + SearchAction の JSON-LD を組み立てる（プレーンオブジェクト）
 */
export function buildWebsiteSearchAction(siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}
