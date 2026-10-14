import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { locales, defaultLocale } from "./i18n";

const handleI18nRouting = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
  // 既定の Link ヘッダーは hreflang の x-default を接頭辞なしの URL（/ja へリダイレクトする URL）に向け、
  // ホストもリクエストのものを使う。<head> の hreflang（lib/seo/meta.ts）と食い違うので出さない
  alternateLinks: false,
});

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 末尾スラッシュ（/about/・/ja/about/）は外してからロケールを決め、1 回のリダイレクトで正規の URL へ送る。
  // Next 本体の 308（/about/ → /about）は next.config の skipTrailingSlashRedirect で止めてある
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith("/");
  let target = request;
  if (hasTrailingSlash) {
    // nextUrl.clone() は元の末尾スラッシュを覚えていて、pathname を変えても付け直すので使わない
    const url = new URL(request.url);
    url.pathname = pathname.replace(/\/+$/, "") || "/";
    target = new NextRequest(url, { headers: request.headers, method: request.method });
  }

  const response = handleI18nRouting(target);
  const location = response.headers.get("location");

  if (location) {
    // ロケールのない URL は、next-intl がクッキー（NEXT_LOCALE）と Accept-Language でロケールを決めて 307 で送る。
    // 既定の ja へは 308 にして検索エンジンに正規 URL を伝える（Googlebot は Accept-Language を送らないので必ずこちら）。
    // 判定が人によって変わるので、ブラウザには保存させない。en へは 307 のまま
    if (new URL(location).pathname.split("/")[1] === defaultLocale) {
      const redirect = new NextResponse(null, { status: 308, headers: response.headers });
      redirect.headers.set("Cache-Control", "no-store");
      return redirect;
    }
    return response;
  }

  if (hasTrailingSlash) {
    return NextResponse.redirect(target.url, 308);
  }
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
