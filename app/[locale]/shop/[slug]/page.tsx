import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/app/components/Breadcrumb";
import AddToCart from "@/app/components/(shop)/AddToCart";
import CartLink from "@/app/components/(shop)/CartLink";
import ProductGallery from "@/app/components/(shop)/ProductGallery";
import { toShopProduct } from "@/app/components/(shop)/to-shop-product";
import Link from "next/link";
import { getProductBySlug, getShopSettings } from "@/lib/db/shop";
import { formatYen } from "@/lib/reserve/pricing";
import { buildPageMeta } from "@/lib/seo";

// 初めて開かれたときに作って、1 分ごとに作り直す（ビルドのときはデータベースを読まない）
export const revalidate = 60;

export async function generateStaticParams() {
  return [];
}

type Props = { params: Promise<{ locale: string; slug: string }> };

async function load(slug: string, locale: "ja" | "en") {
  if (!/^[a-z0-9-]{1,80}$/.test(slug)) return null;
  const row = await getProductBySlug(slug);
  return row ? toShopProduct(row, locale) : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await load(slug, locale === "en" ? "en" : "ja");
  if (!product) return {};
  return buildPageMeta({
    title: `${product.name} | DMC FUJI`,
    description: product.description.slice(0, 120) || product.name,
    locale,
    canonicalPath: `/${locale}/shop/${slug}`,
    openGraph: product.images[0]?.startsWith("https://") ? { image: product.images[0] } : undefined,
  });
}

export default async function ProductPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const lang = locale === "en" ? "en" : "ja";
  const isJa = lang === "ja";
  const product = await load(slug, lang);
  if (!product) notFound();
  const settings = await getShopSettings();
  const shipping = `${formatYen(settings.shipping_fee)}${
    settings.free_shipping_threshold !== null
      ? isJa
        ? `（${formatYen(settings.free_shipping_threshold)}以上のご注文で無料）`
        : ` (free on orders of ${formatYen(settings.free_shipping_threshold)} or more)`
      : ""
  }`;
  const details: [string, React.ReactNode][] = isJa
    ? [
        ["送料", `${shipping}（日本国内へのお届け）`],
        ["お届け", settings.delivery_note_ja],
        ["お支払い", "クレジットカード"],
        ["返品・交換", "初期不良の場合を除き、お受けしていません"],
      ]
    : [
        ["Shipping", `Flat rate ${formatYen(settings.overseas_shipping_fee)} (we ship to Australia only)`],
        ["Delivery", settings.delivery_note_en],
        ["Payment", "Credit card"],
        ["Returns", "Not accepted except for defective items"],
      ];

  return (
    <>
      <Breadcrumb
        items={[
          { name: isJa ? "ホーム" : "Home", href: `/${locale}` },
          { name: isJa ? "ショップ" : "Shop", href: `/${locale}/shop` },
          { name: product.name },
        ]}
      />
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-8 flex justify-end">
            <CartLink locale={lang} />
          </div>
          <div className="grid gap-10 md:grid-cols-2 lg:gap-16">
            <ProductGallery name={product.name} images={product.images} locale={lang} />
            <div>
              <h1 className="font-serif text-3xl font-light tracking-wide text-text">{product.name}</h1>
              <p className="mt-4 font-serif text-2xl tabular-nums text-text">
                {formatYen(product.price)}
                <span className="ml-2 font-sans text-xs text-text-muted">{isJa ? "税込" : "tax incl."}</span>
              </p>
              <div className="mt-8">
                <AddToCart productId={product.id} stock={product.stock} locale={lang} />
              </div>
              {product.description && (
                <p className="mt-8 whitespace-pre-wrap border-t border-border pt-8 text-sm leading-8 text-text">{product.description}</p>
              )}
              <dl className="mt-10 border-t border-border text-xs">
                {details.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-border py-3">
                    <dt className="text-text-muted">{label}</dt>
                    <dd className="text-text">{value}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={`/${locale}/legal/tokushoho`}
                className="mt-4 inline-block text-xs text-text-muted underline decoration-border underline-offset-4 hover:text-text hover:decoration-text"
              >
                {isJa ? "特定商取引法に基づく表記" : "Legal notice"}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
