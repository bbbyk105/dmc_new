import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { findSecretsInPublicEnv } from "./lib/public-env";

// NEXT_PUBLIC_ に秘密の鍵が入っていたら、ブラウザに出る前にビルドを止める
const leaked = findSecretsInPublicEnv(process.env);
if (leaked.length > 0) {
  throw new Error(
    `${leaked.join(", ")} に秘密の鍵（Supabase の secret / service_role）が入っています。NEXT_PUBLIC_ の値はブラウザに出るので、公開用の鍵（publishable）を入れてください`,
  );
}

const withNextIntl = createNextIntlPlugin("./i18n.ts");

const nextConfig: NextConfig = {
  // ロケールのない URL（/about など）と末尾スラッシュは proxy.ts でまとめて 1 回のリダイレクトにする。
  // Next 本体の末尾スラッシュの 308 が先に走ると /about/ → /about → /ja/about と 2 回になるので止める。
  // proxy の matcher の外（/api/*、/sitemap.xml などの拡張子つき）は末尾スラッシュを外さなくなる（/sitemap.xml/ が 200 になる）が、
  // 外から使われる URL ではないので許容する
  skipTrailingSlashRedirect: true,
  // next dev が AI 向けの AGENTS.md を自動で作らないようにする（AGENTS.md は人が書く指示の置き場として使う）
  agentRules: false,
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
