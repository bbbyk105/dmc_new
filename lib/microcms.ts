import { createClient, type MicroCMSQueries } from "microcms-js-sdk";

function normalizeServiceDomain(value: string | undefined): string | undefined {
  if (!value) return undefined;
  // 例: https://dmcfuji.microcms.io/api/v1/blogs を渡されても
  //     dmcfuji だけ抽出する
  const match = value.match(
    /^(?:https?:\/\/)?([a-z0-9-]+)(?:\.microcms\.io.*)?$/i,
  );
  return match?.[1] ?? value;
}

const serviceDomain = normalizeServiceDomain(
  process.env.MICROCMS_SERVICE_DOMAIN,
);
const apiKey = process.env.MICROCMS_API_KEY;
const endpoint = process.env.MICROCMS_BLOG_ENDPOINT ?? "blogs";

const client =
  serviceDomain && apiKey ? createClient({ serviceDomain, apiKey }) : null;

export type BlogThumbnail = {
  url: string;
  height: number;
  width: number;
};

export type BlogCategoryRef = {
  id: string;
  name: string;
  publishedAt?: string;
  updatedAt?: string;
};

/** microCMS の標準ブログテンプレート（blogs）互換 */
export type BlogItem = {
  id: string;
  title: string;
  /** 一覧・meta description 用の抜粋（任意フィールド） */
  excerpt?: string;
  /** 文字列(セレクト)・コンテンツ参照(オブジェクト)・配列(複数参照)のいずれにも対応 */
  category?: string | BlogCategoryRef | BlogCategoryRef[];
  eyecatch?: BlogThumbnail;
  /** 旧フィールド名 / 別運用との互換 */
  thumbnail?: BlogThumbnail;
  /** リッチエディタのHTML */
  content?: string;
  publishedAt: string;
  updatedAt: string;
  createdAt: string;
  revisedAt?: string;
};

export type BlogListResponse = {
  contents: BlogItem[];
  totalCount: number;
  offset: number;
  limit: number;
};

export function getThumbnail(item: BlogItem): BlogThumbnail | undefined {
  return item.eyecatch ?? item.thumbnail;
}

export function getCategoryName(
  category: BlogItem["category"],
): string | undefined {
  if (!category) return undefined;
  if (typeof category === "string") return category;
  if (Array.isArray(category)) {
    return (
      category
        .map((c) => c.name)
        .filter(Boolean)
        .join(" / ") || undefined
    );
  }
  return category.name;
}

/** HTMLタグを除去してプレーンテキスト化（description のフォールバック用） */
export function stripHtml(html: string, maxLength = 120): string {
  const text = html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

export async function fetchBlogList(
  queries?: MicroCMSQueries,
): Promise<BlogListResponse> {
  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY 未設定のため、blog を空で返します。",
      );
    }
    return { contents: [], totalCount: 0, offset: 0, limit: 0 };
  }
  try {
    return await client.get<BlogListResponse>({
      endpoint,
      queries: { limit: 100, orders: "-publishedAt", ...queries },
    });
  } catch (err) {
    console.error("microCMS list fetch failed:", err);
    return { contents: [], totalCount: 0, offset: 0, limit: 0 };
  }
}

export async function fetchBlogItem(id: string): Promise<BlogItem | null> {
  if (!client) return null;
  try {
    return await client.get<BlogItem>({ endpoint, contentId: id });
  } catch (err) {
    console.error(`microCMS detail fetch failed (id=${id}):`, err);
    return null;
  }
}

export function formatPublishedDate(iso: string, locale: string): string {
  const d = new Date(iso);
  if (locale === "en") {
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}
