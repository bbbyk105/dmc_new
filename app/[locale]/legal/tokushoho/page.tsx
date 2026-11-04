import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/app/components/Breadcrumb";
import { buildPageMeta } from "@/lib/seo";
import { ADDRESS_EN, ADDRESS_JA, TELEPHONE_DISPLAY } from "@/lib/site-info";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa ? "特定商取引法に基づく表記 | DMC FUJI" : "Legal Notice (Specified Commercial Transactions Act) | DMC FUJI",
    description: isJa
      ? "DMC FUJI（DMC合同会社）の特定商取引法に基づく表記。販売価格・お支払い方法・キャンセルポリシー・返品について。"
      : "Legal notice for DMC FUJI (DMC LLC): prices, payment, cancellation policy, and returns.",
    locale,
    canonicalPath: `/${locale}/legal/tokushoho`,
  });
}

const EMAIL = "dmc.fuji0823@gmail.com";

/**
 * 特定商取引法に基づく表記（Wix の予約サイトにあった内容を引き継ぎ、物販の項目を足した）。
 * 中身を変えたら、予約・カートの確認画面の文言（キャンセル料・返品）とも合わせる
 */
export default async function TokushohoPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const isJa = locale !== "en";

  const rows: [string, string][] = isJa
    ? [
        ["販売業者", "DMC合同会社"],
        ["運営統括責任者", "齋藤 昌孝"],
        ["所在地", ADDRESS_JA],
        ["電話番号", `${TELEPHONE_DISPLAY}（受付 11:00〜17:00、水曜定休）`],
        ["メールアドレス", EMAIL],
        ["販売価格", "各サービス・商品のページに税込価格で表示しています。"],
        ["商品代金以外の必要料金", "物販は送料がかかります（日本国内・オーストラリアとも、カートに表示します）。ご予約のサービスには、料金のほかにかかる費用はありません。"],
        ["お支払い方法", "クレジットカード（Stripe）"],
        ["お支払い時期", "ご予約・ご注文の確定時に決済されます。"],
        ["サービスの提供時期", "ご予約いただいた日時にご提供します。"],
        ["商品の引渡時期", "カートに表示する発送の目安のとおり発送します。"],
        ["配送地域", "日本国内（日本語のページからのご注文）、オーストラリア（英語のページからのご注文）"],
        ["オーストラリアへの発送", "送料は一律です（カートに表示します）。実際の送料が大きく異なる場合は、発送の前にご相談します。"],
        [
          "キャンセルポリシー（ご予約）",
          "開始の48時間前を過ぎてからのキャンセルは料金の50%、24時間前を過ぎてからは料金の100%をキャンセル料としていただきます。キャンセル料を差し引いた金額をカードに返金します。\nご予約の変更は1回まで、お電話で承ります。変更の期限を過ぎた場合はキャンセルとして扱い、キャンセル料がかかります。\nサービスの提供後・提供開始後の返金はお受けしていません。",
        ],
        ["ご予約の受付期間", "開始の3日前（72時間前）まで受け付けます。直前のご予約は受け付けておりません。"],
        ["返品・交換（物販）", "商品に初期不良があった場合を除き、返品・交換はお受けしていません。"],
      ]
    : [
        ["Seller", "DMC LLC (DMC合同会社)"],
        ["Responsible person", "齋藤 昌孝"],
        ["Address", ADDRESS_EN],
        ["Phone", `${TELEPHONE_DISPLAY} (11:00–17:00 JST, closed Wednesdays)`],
        ["Email", EMAIL],
        ["Prices", "Shown with tax included on each service and product page."],
        ["Other fees", "Shipping fees apply to products, both within Japan and to Australia (shown in the cart). No other fees apply to bookings."],
        ["Payment", "Credit card (Stripe)"],
        ["Payment timing", "Charged when your booking or order is confirmed."],
        ["Service date", "Provided on the date and time you booked."],
        ["Delivery", "Shipped according to the estimate shown in the cart. Orders from the English page ship to Australia only; orders from the Japanese page ship within Japan."],
        ["Shipping to Australia", "Charged at a flat rate shown in the cart. If the actual cost is very different, we will contact you before shipping."],
        [
          "Cancellation policy (bookings)",
          "Cancellations within 48 hours of the start time are charged 50% of the price, and within 24 hours 100%. The rest is refunded to your card.\nYou can change your booking once by phone. Changes after the deadline are treated as cancellations.\nNo refunds after the service has started.",
        ],
        ["Booking window", "Bookings close 3 days (72 hours) before the start time. We do not accept last-minute bookings."],
        ["Returns (products)", "We do not accept returns or exchanges except for defective items."],
      ];

  return (
    <>
      <Breadcrumb
        items={[
          { name: isJa ? "ホーム" : "Home", href: `/${locale}` },
          { name: isJa ? "特定商取引法に基づく表記" : "Legal Notice" },
        ]}
      />
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <h1 className="mb-12 text-center font-serif text-3xl font-light tracking-wide text-text md:text-4xl">
            {isJa ? "特定商取引法に基づく表記" : "Legal Notice (Specified Commercial Transactions Act)"}
          </h1>
          <dl className="border-t border-border">
            {rows.map(([label, value]) => (
              <div key={label} className="grid gap-2 border-b border-border py-5 md:grid-cols-3 md:gap-6">
                <dt className="text-sm text-text-muted">{label}</dt>
                <dd className="whitespace-pre-wrap text-sm leading-7 text-text md:col-span-2">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  );
}
