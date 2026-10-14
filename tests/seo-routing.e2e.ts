import { describe, expect, test } from "e2e";

/**
 * 検索エンジンに見せる URL とメタデータ。
 *
 * 画面ではなく HTTP の応答（ステータス・Location・ヘッダー・ハイドレーション前の HTML）を確かめるので、
 * ブラウザは使わず fetch で取る。ブラウザはリダイレクトを自動で追い、<body> に出た <link> も
 * React が <head> へ移してしまうため、検索エンジンが受け取るものと同じにならない。
 */

const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36";
const GOOGLEBOT_UA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

const USER_AGENTS = [
  { label: "ブラウザ", value: BROWSER_UA },
  { label: "Googlebot", value: GOOGLEBOT_UA },
  // User-Agent を送らないクローラーや SEO のチェックツール
  { label: "User-Agent なし", value: "" },
];

/** リダイレクトを追わずに 1 回だけ取る */
function get(baseUrl: string | undefined, path: string, headers: Record<string, string> = {}) {
  return fetch(new URL(path, baseUrl), { redirect: "manual", headers });
}

/** Location のパスとクエリ（ホストは見ない） */
function locationPath(response: Response) {
  const location = response.headers.get("location");
  if (location === null) return null;
  const url = new URL(location, "http://localhost");
  return url.pathname + url.search;
}

/** sitemap.xml に載っているページ（本番の URL と、そのパス） */
async function sitemapPages(baseUrl: string | undefined) {
  const response = await get(baseUrl, "/sitemap.xml");
  expect(response.status).toBe(200);
  const urls = [...(await response.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  expect(urls.length).toBeGreaterThan(0);
  return urls.map((url) => ({ url, path: new URL(url).pathname }));
}

function attr(tag: string, name: string) {
  return new RegExp(`\\s${name}="([^"]*)"`, "i").exec(tag)?.[1];
}

function linkTags(html: string, rel: string) {
  return [...html.matchAll(/<link\b[^>]*>/gi)].map((m) => m[0]).filter((tag) => attr(tag, "rel") === rel);
}

describe("ロケールのない URL", () => {
  test("サイトマップの各ページは、ロケールのない URL から 1 回の 308 で /ja へ送る", async ({ app }) => {
    const pages = (await sitemapPages(app.baseUrl)).filter((p) => /^\/ja(\/|$)/.test(p.path));
    for (const page of pages) {
      const path = page.path.replace(/^\/ja/, "") || "/";
      const response = await get(app.baseUrl, path, { "user-agent": GOOGLEBOT_UA });
      expect({ path, status: response.status, location: locationPath(response) }).toEqual({
        path,
        status: 308,
        location: page.path,
      });
    }
  });

  test("末尾にスラッシュがあっても、1 回の 308 で正規の URL へ送る", async ({ app }) => {
    const cases = [
      ["/about/", "/ja/about"],
      ["/service/camu/", "/ja/service/camu"],
      ["/ja/about/", "/ja/about"],
      ["/en/service/camu/", "/en/service/camu"],
      ["/ja/", "/ja"],
    ];
    for (const [path, expected] of cases) {
      const response = await get(app.baseUrl, path, { "user-agent": GOOGLEBOT_UA });
      expect({ path, status: response.status, location: locationPath(response) }).toEqual({
        path,
        status: 308,
        location: expected,
      });
    }
  });

  test("ページのない URL は恒久リダイレクトにせず、/ja へ 307 で送る（行き先で 404）", async ({ app }) => {
    for (const path of ["/foo", "/fr/about", "/about/xyz", "/blog/a/b"]) {
      const response = await get(app.baseUrl, path, { "user-agent": GOOGLEBOT_UA });
      expect({ path, status: response.status, location: locationPath(response) }).toEqual({
        path,
        status: 307,
        location: `/ja${path}`,
      });
    }
  });

  test("リダイレクトしてもクエリ文字列を残す", async ({ app }) => {
    const cases: { path: string; headers: Record<string, string>; status: number; expected: string }[] = [
      { path: "/about?utm_source=x", headers: {}, status: 308, expected: "/ja/about?utm_source=x" },
      { path: "/ja/about/?utm_source=x", headers: {}, status: 308, expected: "/ja/about?utm_source=x" },
      { path: "/about/?utm_source=x", headers: { cookie: "NEXT_LOCALE=en" }, status: 307, expected: "/en/about?utm_source=x" },
    ];
    for (const { path, headers, status, expected } of cases) {
      const response = await get(app.baseUrl, path, { "user-agent": BROWSER_UA, ...headers });
      expect({ path, status: response.status, location: locationPath(response) }).toEqual({
        path,
        status,
        location: expected,
      });
    }
  });

  test("英語を選んでいる人は、ロケールのない URL から /en へ一時的なリダイレクトで送る", async ({ app }) => {
    const cases: { path: string; headers: Record<string, string>; expected: string }[] = [
      { path: "/about", headers: { cookie: "NEXT_LOCALE=en" }, expected: "/en/about" },
      { path: "/about", headers: { "accept-language": "en-US,en;q=0.9" }, expected: "/en/about" },
      { path: "/", headers: { "accept-language": "en-US,en;q=0.9" }, expected: "/en" },
    ];
    for (const { path, headers, expected } of cases) {
      const response = await get(app.baseUrl, path, { "user-agent": BROWSER_UA, ...headers });
      expect({ path, headers, status: response.status, location: locationPath(response) }).toEqual({
        path,
        headers,
        status: 307,
        location: expected,
      });
    }
  });

  test("/ja への 308 はブラウザに保存させない（あとで英語を選んでも /ja に固定されないように）", async ({ app }) => {
    const response = await get(app.baseUrl, "/about", {
      "user-agent": BROWSER_UA,
      "accept-language": "ja,en;q=0.8",
    });
    expect({ status: response.status, cacheControl: response.headers.get("cache-control") }).toEqual({
      status: 308,
      cacheControl: expect.stringContaining("no-store"),
    });
  });
});

describe("ページの応答", () => {
  test("Link ヘッダーで hreflang を出さない（<head> の hreflang と食い違うため）", async ({ app }) => {
    for (const path of ["/ja", "/ja/about", "/en/about"]) {
      const response = await get(app.baseUrl, path, { "user-agent": GOOGLEBOT_UA });
      expect({ path, status: response.status, link: response.headers.get("link") }).toEqual({
        path,
        status: 200,
        link: null,
      });
    }
  });

  test("サイトマップの各ページを静的に生成して配る", async ({ app }) => {
    for (const page of await sitemapPages(app.baseUrl)) {
      const response = await get(app.baseUrl, page.path, { "user-agent": BROWSER_UA });
      // リクエストごとに描くページには private, no-cache, no-store が付く
      expect({ path: page.path, status: response.status, cacheControl: response.headers.get("cache-control") }).toEqual({
        path: page.path,
        status: 200,
        cacheControl: expect.stringContaining("s-maxage="),
      });
    }
  });

  test("canonical と hreflang を <head> に出す（ブラウザ・Googlebot・User-Agent なし）", async ({ app }) => {
    for (const page of await sitemapPages(app.baseUrl)) {
      const origin = new URL(page.url).origin;
      const rest = page.path.replace(/^\/(ja|en)/, "");
      for (const ua of USER_AGENTS) {
        const response = await get(app.baseUrl, page.path, { "user-agent": ua.value });
        const html = await response.text();
        const headEnd = html.indexOf("</head>");
        const head = html.slice(0, headEnd);
        const body = html.slice(headEnd);
        expect({
          path: page.path,
          ua: ua.label,
          status: response.status,
          canonical: linkTags(head, "canonical").map((tag) => attr(tag, "href")),
          alternates: Object.fromEntries(
            linkTags(head, "alternate").map((tag) => [attr(tag, "hreflang"), attr(tag, "href")]),
          ),
          inBody: linkTags(body, "canonical").length + linkTags(body, "alternate").length,
        }).toEqual({
          path: page.path,
          ua: ua.label,
          status: 200,
          canonical: [page.url],
          alternates: { ja: `${origin}/ja${rest}`, en: `${origin}/en${rest}`, "x-default": `${origin}/ja${rest}` },
          inBody: 0,
        });
      }
    }
  });
});
