"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cartSummary, setQuantity, MAX_QUANTITY } from "@/lib/shop/cart";
import { destinationFor } from "@/lib/shop/destination";
import { formatYen } from "@/lib/reserve/pricing";
import { useCart, writeCart } from "./cart-store";
import ProductImage from "./ProductImage";
import QuantityStepper from "./QuantityStepper";
import type { ShopProduct, ShopRule } from "./types";

type Props = {
  locale: "ja" | "en";
  products: ShopProduct[];
  rule: ShopRule;
  /** Stripe の画面から戻ってきたとき（?release=）。在庫の仮押さえを外す */
  releaseToken?: string;
};

const copy = {
  ja: {
    empty: "カートに商品が入っていません。",
    toShop: "ショップへ戻る",
    unavailable: "販売を終了したか、売り切れになりました。お手数ですが、カートから削除してください。",
    short: (n: number) => `在庫が残り${n}点です。数量を減らしてください。`,
    remove: "削除",
    shippingNote: (rule: ShopRule) =>
      `日本国内へのお届けです。送料 ${formatYen(rule.shippingFee)}${rule.freeShippingThreshold !== null ? `（${formatYen(rule.freeShippingThreshold)}以上のご注文で無料）` : ""}`,
    subtotal: "小計",
    shipping: "送料",
    total: "合計（税込）",
    details: (rule: ShopRule): [string, string][] => [
      ["お支払い", "クレジットカード。次の Stripe の画面で、お届け先とご連絡先を入力してお支払いください。お支払いが済んだ時点でご注文が確定します。"],
      ["お届け", rule.deliveryNote],
      ["返品・交換", "初期不良の場合を除き、お受けしていません。"],
    ],
    legal: "特定商取引法に基づく表記",
    checkout: "ご購入手続きへ進む",
    submitting: "お支払いの画面を準備しています…",
    released: "お支払いを中断しました。カートの商品はそのまま残っています。",
    errors: {
      out_of_stock: "在庫が足りなくなった商品があります。数量をご確認ください。",
      too_many_holds: "お支払いが済んでいないご注文が重なっています。しばらく時間をおいて、もう一度お試しください。",
      invalid: "カートの中身を確認できませんでした。もう一度お試しください。",
      server: "お支払いの画面を開けませんでした。しばらくしてからもう一度お試しください。",
    },
  },
  en: {
    empty: "Your cart is empty.",
    toShop: "Back to shop",
    unavailable: "This item is no longer available. Please remove it.",
    short: (n: number) => `Only ${n} left. Please reduce the quantity.`,
    remove: "Remove",
    shippingNote: (rule: ShopRule) =>
      `We ship to Australia only. Flat-rate shipping ${formatYen(rule.overseasShippingFee)}; if the actual cost is very different, we will contact you before shipping. For delivery within Japan, please order from the Japanese page.`,
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total (tax incl.)",
    details: (rule: ShopRule): [string, string][] => [
      ["Payment", "Credit card. On the next Stripe page, enter your shipping address in Australia and your contact details, then pay. Your order is confirmed once payment is complete."],
      ["Delivery", `${rule.deliveryNote} We will email you when your order ships.`],
      ["Returns", "Not accepted except for defective items."],
    ],
    legal: "Legal notice (Specified Commercial Transactions Act)",
    checkout: "Proceed to checkout",
    submitting: "Preparing the payment page…",
    released: "Payment was cancelled. Your cart has been kept.",
    errors: {
      out_of_stock: "Some items no longer have enough stock. Please check the quantities.",
      too_many_holds: "Too many orders are waiting for payment. Please try again later.",
      invalid: "We could not read your cart. Please try again.",
      server: "We could not open the payment page. Please try again later.",
    },
  },
} as const;

/**
 * カート（Stripe に進む前の最終確認の画面）。数量・お届け先・金額・送料・支払い方法・発送・返品の扱いを見せる。
 * 金額は画面の目安で、支払う金額はサーバーがデータベースの値段と送料で決める
 */
export default function CartView({ locale, products, rule, releaseToken }: Props) {
  const t = copy[locale];
  const router = useRouter();
  const lines = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // お届け先はページの言語で決まる（日本語は日本国内、英語はオーストラリア）
  const { overseas } = destinationFor(locale);

  useEffect(() => {
    if (!releaseToken) return;
    fetch("/api/checkout/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "order", token: releaseToken }),
    })
      .then((res) => res.json())
      .then((data: { released?: boolean }) => {
        if (data.released) setNotice(t.released);
      })
      .catch(() => {})
      .finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("release");
        window.history.replaceState(null, "", url);
        // 戻した在庫を出し直す
        router.refresh();
      });
  }, [releaseToken, t.released, router]);

  const summary = cartSummary(lines, products, rule, overseas);

  const checkout = async () => {
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/shop/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: lines, locale }),
      });
      const data = (await res.json()) as { url?: string; error?: keyof typeof t.errors };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      setNotice(t.errors[data.error ?? "server"] ?? t.errors.server);
      if (data.error === "out_of_stock") router.refresh();
    } catch {
      setNotice(t.errors.server);
    }
    setSubmitting(false);
  };

  const noticeBox = notice && (
    <p role="status" className="mb-8 border-l border-text py-1 pl-4 text-sm text-text">
      {notice}
    </p>
  );

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl text-center">
        {noticeBox}
        <p className="text-sm text-text-muted">{t.empty}</p>
        <Link href={`/${locale}/shop`} className="btn-secondary mt-8">
          {t.toShop}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {noticeBox}

      <ul className="border-t border-border">
        {summary.items.map(({ line, product, problem, lineTotal }) => (
          <li key={line.productId} className="flex gap-5 border-b border-border py-6">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden bg-background">
              <ProductImage src={product?.images[0] ?? null} alt={product?.name ?? ""} sizes="96px" fit="contain" />
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {product ? (
                    <Link href={`/${locale}/shop/${product.slug}`} className="text-sm text-text hover:underline">
                      {product.name}
                    </Link>
                  ) : (
                    <span className="text-sm text-text-muted">—</span>
                  )}
                  {product && <p className="mt-1 text-xs tabular-nums text-text-muted">{formatYen(product.price)}</p>}
                </div>
                <span className="text-sm tabular-nums text-text">{problem ? "—" : formatYen(lineTotal)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                {product && problem !== "unavailable" ? (
                  <QuantityStepper
                    size="sm"
                    locale={locale}
                    value={line.quantity}
                    max={Math.min(MAX_QUANTITY, Math.max(product.stock, line.quantity))}
                    onChange={(n) => writeCart(setQuantity(lines, line.productId, n))}
                    label={`${product.name} ${locale === "en" ? "quantity" : "の数量"}`}
                  />
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => writeCart(setQuantity(lines, line.productId, 0))}
                  className="text-xs tracking-[0.12em] text-text-muted underline decoration-border underline-offset-4 transition-colors hover:text-text hover:decoration-text"
                >
                  {t.remove}
                </button>
              </div>
              {problem === "unavailable" && <p className="text-xs text-text">{t.unavailable}</p>}
              {problem === "short" && product && <p className="text-xs text-text">{t.short(product.stock)}</p>}
            </div>
          </li>
        ))}
      </ul>

      {/* 送料とお届け先（日本語は日本国内、英語はオーストラリアだけ） */}
      <p className="mt-10 text-xs leading-6 text-text-muted">{t.shippingNote(rule)}</p>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-text-muted">{t.subtotal}</dt>
          <dd className="tabular-nums text-text">{formatYen(summary.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-text-muted">{t.shipping}</dt>
          <dd className="tabular-nums text-text">{formatYen(summary.shipping)}</dd>
        </div>
        <div className="flex items-baseline justify-between border-t border-border pt-4">
          <dt className="text-text-muted">{t.total}</dt>
          <dd className="font-serif text-2xl tabular-nums text-text">{formatYen(summary.total)}</dd>
        </div>
      </dl>

      {/* ご購入の前に（最終確認の画面に出す支払い・お届け・返品の扱い） */}
      <dl className="mt-10 border-t border-border text-xs">
        {t.details(rule).map(([label, value]) => (
          <div key={label} className="grid grid-cols-[6rem_1fr] gap-4 border-b border-border py-3">
            <dt className="text-text-muted">{label}</dt>
            <dd className="leading-6 text-text">{value}</dd>
          </div>
        ))}
      </dl>
      <Link
        href={`/${locale}/legal/tokushoho`}
        className="mt-4 inline-block text-xs text-text-muted underline decoration-border underline-offset-4 hover:text-text hover:decoration-text"
      >
        {t.legal}
      </Link>

      <div className="mt-10 flex flex-col-reverse justify-center gap-4 sm:flex-row">
        <Link href={`/${locale}/shop`} className="btn-secondary">
          {t.toShop}
        </Link>
        <button type="button" className="btn-primary" onClick={checkout} disabled={!summary.canCheckout || submitting}>
          {submitting ? t.submitting : t.checkout}
        </button>
      </div>
    </div>
  );
}
