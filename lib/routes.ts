/**
 * サイトのページ（ロケールを除いたパス）。sitemap.xml と、ロケールのない URL のリダイレクト（proxy.ts）が使う。
 * ページを足したらここにも足す（足し忘れると、ロケールのない URL が恒久リダイレクトにならない）
 */
export const pageRoutes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.7 },
  { path: "/service", changeFrequency: "monthly", priority: 0.9 },
  { path: "/service/camu", changeFrequency: "monthly", priority: 0.85 },
  { path: "/gallery", changeFrequency: "weekly", priority: 0.8 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.8 },
  { path: "/contact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/reserve", changeFrequency: "weekly", priority: 0.9 },
  { path: "/shop", changeFrequency: "weekly", priority: 0.7 },
  { path: "/legal/tokushoho", changeFrequency: "yearly", priority: 0.2 },
] as const;

/** ロケールのないパス（/、/about、/blog/xxx）が、サイトのページに当たるか */
export function isPagePath(pathname: string): boolean {
  const path = pathname === "/" ? "" : pathname;
  // ブログ記事（app/[locale]/blog/[id]）・ショップの商品（app/[locale]/shop/[slug]）
  return pageRoutes.some((route) => route.path === path) || /^\/(blog|shop)\/[^/]+$/.test(path);
}
