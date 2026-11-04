import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/app/components/Breadcrumb";
import CartView from "@/app/components/(shop)/CartView";
import { toShopProduct, toShopRule } from "@/app/components/(shop)/to-shop-product";
import { getActiveProducts, getShopSettings } from "@/lib/db/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  // レイアウトの title テンプレート（%s | DMC FUJI）を重ねない
  return { title: { absolute: locale === "en" ? "Cart | DMC FUJI" : "カート | DMC FUJI" }, robots: { index: false, follow: false } };
}

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ release?: string }>;
};

export default async function CartPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale === "en" ? "en" : "ja";
  const isJa = lang === "ja";
  const { release } = await searchParams;

  // カートの中身はブラウザにあるので、公開中の商品をまとめて渡し、画面で突き合わせる
  const [products, settings] = await Promise.all([getActiveProducts(), getShopSettings()]);

  return (
    <>
      <Breadcrumb
        items={[
          { name: isJa ? "ホーム" : "Home", href: `/${locale}` },
          { name: isJa ? "ショップ" : "Shop", href: `/${locale}/shop` },
          { name: isJa ? "カート" : "Cart" },
        ]}
      />
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <h1 className="mb-12 text-center font-serif text-3xl font-light tracking-wide text-text md:text-4xl">
            {isJa ? "カート" : "Cart"}
          </h1>
          <CartView
            locale={lang}
            products={products.map((p) => toShopProduct(p, lang))}
            rule={toShopRule(settings, lang)}
            releaseToken={release}
          />
        </div>
      </section>
    </>
  );
}
