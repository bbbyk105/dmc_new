import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import ClearCart from "@/app/components/(shop)/ClearCart";
import { stripe } from "@/lib/stripe";
import { completeOrderSession } from "@/lib/checkout/order";
import { getOrderBySession, getShopSettings } from "@/lib/db/shop";
import { formatYen } from "@/lib/reserve/pricing";
import { TELEPHONE_DISPLAY } from "@/lib/site-info";
import type { OrderWithItems } from "@/lib/db/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
};

/** Stripe で払い終わって戻ってくるページ。Webhook より先に着いても、ここで支払いを確かめて注文を確定する */
async function loadOrder(sessionId: string | undefined): Promise<OrderWithItems | null> {
  if (!sessionId || !/^cs_[A-Za-z0-9_]{10,200}$/.test(sessionId)) return null;
  try {
    const session = await stripe().checkout.sessions.retrieve(sessionId);
    if (session.metadata?.kind !== "order") return null;
    await completeOrderSession(session);
    return await getOrderBySession(sessionId);
  } catch (error) {
    console.error("[shop] 完了ページで注文を確かめられませんでした", error);
    return null;
  }
}

export default async function ShopCompletePage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isJa = locale !== "en";
  const order = await loadOrder((await searchParams).session_id);
  const paid = order?.status === "paid" || order?.status === "shipped";
  const settings = paid ? await getShopSettings().catch(() => null) : null;

  return (
    <section className="pb-24 pt-32 md:pt-40">
      {paid && <ClearCart />}
      <div className="container mx-auto max-w-2xl px-6">
        <h1 className="mb-6 text-center font-serif text-3xl font-light tracking-wide text-text md:text-4xl">
          {paid
            ? isJa
              ? "ご注文ありがとうございます"
              : "Thank you for your order"
            : isJa
              ? "ご注文を確認できませんでした"
              : "We could not find your order"}
        </h1>
        <div className="mx-auto mb-8 h-px w-16 bg-text" />
        <p className="text-center text-sm leading-7 text-text-muted">
          {paid
            ? isJa
              ? `確認のメールを ${order.customer_email} にお送りしました。${settings?.delivery_note_ja ?? ""}`
              : `We have sent a confirmation email to ${order.customer_email}. ${settings?.delivery_note_en ?? ""}`
            : isJa
              ? `お支払いの確認に時間がかかっています。しばらくたってもメールが届かないときは、お電話（${TELEPHONE_DISPLAY}）でお問い合わせください。`
              : `Your payment is still being confirmed. If you do not receive an email, please call us at ${TELEPHONE_DISPLAY}.`}
        </p>

        {paid && (
          <dl className="mt-12 border-t border-border text-sm">
            <div className="grid grid-cols-3 gap-4 border-b border-border py-4">
              <dt className="text-text-muted">{isJa ? "注文番号" : "Order number"}</dt>
              <dd className="col-span-2 text-text">{order.code}</dd>
            </div>
            {order.order_items.map((item) => (
              <div key={item.id} className="grid grid-cols-3 gap-4 border-b border-border py-4">
                <dt className="text-text-muted">{isJa ? item.name_ja : item.name_en || item.name_ja}</dt>
                <dd className="col-span-2 tabular-nums text-text">
                  {formatYen(item.unit_price)} × {item.quantity}
                </dd>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-4 border-b border-border py-4">
              <dt className="text-text-muted">{isJa ? "合計（税込・送料込み）" : "Total (tax and shipping incl.)"}</dt>
              <dd className="col-span-2 tabular-nums text-text">{formatYen(order.total)}</dd>
            </div>
          </dl>
        )}

        <div className="mt-12 flex justify-center">
          <Link href={`/${locale}/shop`} className="btn-secondary">
            {isJa ? "ショップへ戻る" : "Back to shop"}
          </Link>
        </div>
      </div>
    </section>
  );
}
