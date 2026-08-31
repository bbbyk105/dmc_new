import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // 非ロケールURLが Search Console に露出しているため、既定言語(ja)へ正規化
      { source: "/", destination: "/ja", permanent: true },
      { source: "/service", destination: "/ja/service", permanent: true },
      { source: "/service/camu", destination: "/ja/service/camu", permanent: true },
      { source: "/gallery", destination: "/ja/gallery", permanent: true },
      { source: "/blog", destination: "/ja/blog", permanent: true },
      { source: "/blog/:id", destination: "/ja/blog/:id", permanent: true },
      { source: "/contact", destination: "/ja/contact", permanent: true },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 2560, 3200, 3840],
    qualities: [75, 85, 90],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        // microCMS のアイキャッチ・本文画像
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
      {
        protocol: "https",
        hostname: "hexahlchflqtbohyshxy.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "hexahlchflqtbohyshxy.supabase.co",
        port: "",
        pathname: "/storage/v1/render/image/public/**",
      },
    ],
    minimumCacheTTL: 60,
    // 画像最適化のタイムアウトを延長
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default withNextIntl(nextConfig);
