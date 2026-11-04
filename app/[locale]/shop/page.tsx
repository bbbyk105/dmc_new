import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/app/components/Breadcrumb";
import CartLink from "@/app/components/(shop)/CartLink";
import ProductImage from "@/app/components/(shop)/ProductImage";
import { toShopProduct } from "@/app/components/(shop)/to-shop-product";
import { getActiveProducts } from "@/lib/db/shop";
import { isBuildPhase } from "@/lib/build-phase";
import { formatYen } from "@/lib/reserve/pricing";
import { buildPageMeta } from "@/lib/seo";
import type { ShopProduct } from "@/app/components/(shop)/types";

// 静的に生成し、1 分ごとに作り直す（管理画面で変えたときは、その場で作り直す）。
// 在庫はカートと支払いの前にデータベースで確かめ直すので、ここの「売り切れ」は目安
export const revalidate = 60;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa ? "オンラインショップ | DMC FUJI" : "Online Shop | DMC FUJI",
    description: isJa
      ? "静岡県富士市のDMC FUJIのオンラインショップ。お店で扱っている品を、ご自宅にお届けします。"
      : "The DMC FUJI online shop. Items from our studio in Fuji City, delivered to your home in Japan.",
    locale,
    canonicalPath: `/${locale}/shop`,
  });
}

export default async function ShopPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale === "en" ? "en" : "ja";
  const isJa = lang === "ja";

  let products: ShopProduct[] = [];
  try {
    products = (await getActiveProducts()).map((p) => toShopProduct(p, lang));
  } catch (error) {
    // 作り直しのときは投げて、前の正常なページを残す
    if (!isBuildPhase()) throw error;
    console.error("[shop] 商品を読めませんでした", error);
  }

  return (
    <>
      <Breadcrumb
        items={[
          { name: isJa ? "ホーム" : "Home", href: `/${locale}` },
          { name: isJa ? "ショップ" : "Shop" },
        ]}
      />
      <section className="border-b border-border py-16 md:py-20">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <h1 className="mb-6 font-serif text-4xl font-light tracking-wide text-text md:text-5xl">
            {isJa ? "オンラインショップ" : "Online Shop"}
          </h1>
          <div className="mx-auto h-px w-16 bg-text" />
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-10 flex justify-end">
            <CartLink locale={lang} />
          </div>
          {products.length === 0 ? (
            <p className="text-center text-sm text-text-muted">
              {isJa ? "ただいま販売している商品はありません。" : "No items are available right now."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:gap-x-10">
              {products.map((p) => (
                <li key={p.id}>
                  <Link href={`/${locale}/shop/${p.slug}`} className="group block">
                    <div className="relative aspect-square overflow-hidden bg-background">
                      <ProductImage src={p.images[0] ?? null} alt={p.name} sizes="(min-width: 768px) 33vw, 50vw" fit="contain" />
                    </div>
                    <p className="mt-4 text-sm text-text group-hover:underline">{p.name}</p>
                    <p className="mt-1 text-sm tabular-nums text-text-muted">
                      {p.stock > 0 ? formatYen(p.price) : isJa ? "売り切れ" : "Sold out"}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
