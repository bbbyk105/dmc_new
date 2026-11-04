import "server-only";
import { formatSlot } from "@/lib/reserve/format";
import { formatYen } from "@/lib/reserve/pricing";
import { bookingCancelledLines, bookingConflictLines, orderPaidLines } from "./messages";
import { renderMail, type Mail } from "./render";
import { mailFrom, resendClient, sendViaResend, shopInbox } from "./resend";
import { ADDRESS_EN, ADDRESS_JA, TELEPHONE_DISPLAY } from "@/lib/site-info";
import type { BookingWithNames, OrderWithItems } from "@/lib/db/types";
import { shippingAddressLabel } from "@/lib/shop/address";

/**
 * 予約・注文のメール。送信は Resend（RESEND_API_KEY、送り元は MAIL_FROM）。
 * MAIL_MODE=log のとき（手元の確認・E2E）と、RESEND_API_KEY が無いときは、送らずにログへ出す。
 * 送れなくても予約・注文の確定は取り消さない（管理画面と Stripe には残る）ので、失敗はログに残して続ける。
 */

async function send(mails: Mail[]): Promise<void> {
  const targets = mails.filter((m) => m.to);
  if (targets.length === 0) return;
  const client = resendClient();
  if (process.env.MAIL_MODE === "log" || !client) {
    for (const m of targets) console.info(`[mail] to=${m.to} subject=${m.subject}`);
    return;
  }
  try {
    await sendViaResend(
      targets.map((m) => ({
        to: m.to,
        subject: m.subject,
        ...renderMail(m),
        // お客さまが返信したら、お店に届くようにする（送り元は noreply）
        replyTo: m.replyTo ?? shopInbox(),
      })),
      { client, from: mailFrom() },
    );
  } catch (error) {
    console.error("[mail] 送信に失敗", error);
  }
}

// ---------------------------------------------------------------------------
// 予約
// ---------------------------------------------------------------------------

function bookingRows(b: BookingWithNames, locale: string): [string, string][] {
  const en = locale === "en";
  const service = en ? b.services?.name_en : b.services?.name_ja;
  const option = en ? b.service_options?.name_en : b.service_options?.name_ja;
  return [
    [en ? "Booking number" : "予約番号", b.code],
    [en ? "Service" : "サービス", `${service ?? ""} / ${option ?? ""}`],
    [en ? "Date & time" : "日時", formatSlot(new Date(b.starts_at), new Date(b.ends_at), locale)],
    [en ? "Guests" : "人数", en ? `${b.people}` : `${b.people}名`],
    [en ? "Amount (tax incl.)" : "料金（税込）", formatYen(b.amount)],
    [en ? "Name" : "お名前", b.customer_name],
  ];
}

const POLICY_JA = [
  "ご予約の変更・キャンセルは、お電話（" + TELEPHONE_DISPLAY + "、11:00〜17:00、水曜定休）でご連絡ください。変更は1回までです。",
  "キャンセル料：開始の48時間前を過ぎてからは料金の50%、24時間前を過ぎてからは100%をいただきます。",
];
const POLICY_EN = [
  `To change or cancel, please call us at ${TELEPHONE_DISPLAY} (11:00–17:00 JST, closed Wednesdays). You can change your booking once.`,
  "Cancellation fee: 50% within 48 hours of the start time, 100% within 24 hours.",
];

export async function sendBookingConfirmed(b: BookingWithNames): Promise<void> {
  const en = b.locale === "en";
  await send([
    {
      to: b.customer_email,
      locale: b.locale,
      subject: en ? `[DMC FUJI] Booking confirmed (${b.code})` : `【DMC FUJI】ご予約を承りました（${b.code}）`,
      heading: en ? "Your booking is confirmed" : "ご予約を承りました",
      lines: en
        ? [`Dear ${b.customer_name},`, "Thank you for booking with DMC FUJI. Your payment has been received and your booking is confirmed.", ...POLICY_EN, `Address: ${ADDRESS_EN}`]
        : [`${b.customer_name} 様`, "DMC FUJI をご予約いただき、ありがとうございます。お支払いを確認し、ご予約が確定しました。当日お待ちしております。", ...POLICY_JA, `所在地：${ADDRESS_JA}（無料駐車場あり）`],
      rows: bookingRows(b, b.locale),
    },
    {
      to: shopInbox(),
      subject: `【予約】${b.code} ${formatSlot(new Date(b.starts_at), new Date(b.ends_at), "ja")} ${b.customer_name}様`,
      heading: "新しい予約が入りました",
      lines: ["サイトから予約が入り、カードの決済が完了しました。"],
      rows: [
        ...bookingRows(b, "ja"),
        ["メール", b.customer_email],
        ["電話", b.customer_phone],
        ["ご要望", b.customer_note || "なし"],
        ["言語", b.locale === "en" ? "英語" : "日本語"],
      ],
      replyTo: b.customer_email,
    },
  ]);
}

export async function sendBookingCancelled(b: BookingWithNames, refund: number): Promise<void> {
  const en = b.locale === "en";
  await send([
    {
      to: b.customer_email,
      locale: b.locale,
      subject: en ? `[DMC FUJI] Booking cancelled (${b.code})` : `【DMC FUJI】ご予約のキャンセルを承りました（${b.code}）`,
      heading: en ? "Your booking has been cancelled" : "ご予約のキャンセルを承りました",
      lines: bookingCancelledLines({ name: b.customer_name, refund, paidOnline: !!b.stripe_payment_intent_id, locale: b.locale }),
      rows: [
        ...bookingRows(b, b.locale),
        ...(b.stripe_payment_intent_id ? ([[en ? "Refund" : "返金額", formatYen(refund)]] as [string, string][]) : []),
      ],
    },
  ]);
}

export async function sendBookingRescheduled(b: BookingWithNames): Promise<void> {
  const en = b.locale === "en";
  await send([
    {
      to: b.customer_email,
      locale: b.locale,
      subject: en ? `[DMC FUJI] Booking changed (${b.code})` : `【DMC FUJI】ご予約の日時を変更しました（${b.code}）`,
      heading: en ? "Your booking has been changed" : "ご予約の日時を変更しました",
      lines: en
        ? [`Dear ${b.customer_name},`, "We have changed your booking as below. Please note that a booking can only be changed once."]
        : [`${b.customer_name} 様`, "ご予約の日時を、下記のとおり変更しました。なお、ご予約の変更は1回までとさせていただいております。"],
      rows: bookingRows(b, b.locale),
    },
  ]);
}

/** 支払いの途中で仮押さえの期限が切れ、同じ時間に別の予約が入っていたとき（全額返金済み） */
export async function sendBookingConflictRefunded(b: BookingWithNames, refunded: boolean): Promise<void> {
  const en = b.locale === "en";
  await send([
    {
      to: b.customer_email,
      locale: b.locale,
      subject: en ? `[DMC FUJI] We could not confirm your booking (${b.code})` : `【DMC FUJI】ご予約を確定できませんでした（${b.code}）`,
      heading: en ? "We could not confirm your booking" : "ご予約を確定できませんでした",
      lines: bookingConflictLines({ name: b.customer_name, refunded, locale: b.locale }),
      rows: bookingRows(b, b.locale),
    },
    {
      to: shopInbox(),
      subject: `【要確認】予約 ${b.code} を自動で取り消し${refunded ? "（全額返金済み）" : "（返金に失敗）"}`,
      heading: "予約を自動で取り消しました",
      lines: [
        "支払いの途中で仮押さえの期限が切れ、そのあいだに同じ時間の予約が入ったため、この予約は確定できませんでした。",
        refunded ? "全額を Stripe で返金済みです。" : "Stripe の返金に失敗しました。Stripe の管理画面から返金してください。",
      ],
      rows: [...bookingRows(b, "ja"), ["メール", b.customer_email], ["電話", b.customer_phone]],
    },
  ]);
}

// ---------------------------------------------------------------------------
// 注文
// ---------------------------------------------------------------------------

function orderRows(o: OrderWithItems, locale: string): [string, string][] {
  const en = locale === "en";
  const items = o.order_items
    .map((i) => `${en ? i.name_en || i.name_ja : i.name_ja} × ${i.quantity}　${formatYen(i.unit_price * i.quantity)}`)
    .join("\n");
  return [
    [en ? "Order number" : "注文番号", o.code],
    [en ? "Items" : "商品", items],
    [en ? "Subtotal" : "小計", formatYen(o.subtotal)],
    [en ? "Shipping" : "送料", o.overseas ? `${formatYen(o.shipping_fee)}${en ? " (to Australia, flat rate)" : "（オーストラリア・一律）"}` : formatYen(o.shipping_fee)],
    [en ? "Total (tax incl.)" : "合計（税込）", formatYen(o.total)],
    [en ? "Ship to" : "お届け先", `${o.shipping_name}\n${shippingAddressLabel(o)}`],
  ];
}

export async function sendOrderPaid(o: OrderWithItems, deliveryNote: string): Promise<void> {
  const en = o.locale === "en";
  await send([
    {
      to: o.customer_email,
      locale: o.locale,
      subject: en ? `[DMC FUJI] Thank you for your order (${o.code})` : `【DMC FUJI】ご注文ありがとうございます（${o.code}）`,
      heading: en ? "Thank you for your order" : "ご注文ありがとうございます",
      lines: orderPaidLines({ name: o.customer_name || o.shipping_name, deliveryNote, overseas: o.overseas, locale: o.locale }),
      rows: orderRows(o, o.locale),
    },
    {
      to: shopInbox(),
      subject: `【注文${o.overseas ? "・オーストラリア" : ""}】${o.code} ${formatYen(o.total)} ${o.shipping_name}様${o.needs_attention ? "（要確認：在庫不足）" : ""}`,
      heading: "新しい注文が入りました",
      lines: [
        "ショップで注文が入り、カードの決済が完了しました。管理画面の「注文」から発送を登録してください。",
        ...(o.overseas
          ? [`オーストラリアへのご注文です（英語のページから）。送料は一律の ${formatYen(o.shipping_fee)} をいただいています。実際の送料と大きく違うときは、発送の前にお客さまへメールで相談してください。`]
          : []),
        ...(o.needs_attention ? ["支払いの途中で在庫が足りなくなりました。返金するか、取り寄せるかを決めてください。"] : []),
      ],
      rows: [...orderRows(o, "ja"), ["メール", o.customer_email], ["電話", o.customer_phone]],
      replyTo: o.customer_email,
    },
  ]);
}

export async function sendOrderShipped(o: OrderWithItems): Promise<void> {
  const en = o.locale === "en";
  await send([
    {
      to: o.customer_email,
      locale: o.locale,
      subject: en ? `[DMC FUJI] Your order has shipped (${o.code})` : `【DMC FUJI】ご注文の商品を発送しました（${o.code}）`,
      heading: en ? "Your order has shipped" : "ご注文の商品を発送しました",
      lines: en
        ? [`Dear ${o.customer_name || o.shipping_name},`, "Your order is on its way."]
        : [`${o.customer_name || o.shipping_name} 様`, "ご注文の商品を発送しました。到着まで今しばらくお待ちください。"],
      rows: [...orderRows(o, o.locale), ...(o.tracking_number ? [[en ? "Tracking number" : "お問い合わせ番号", o.tracking_number] as [string, string]] : [])],
    },
  ]);
}

export async function sendOrderCancelled(o: OrderWithItems, refund: number): Promise<void> {
  const en = o.locale === "en";
  await send([
    {
      to: o.customer_email,
      locale: o.locale,
      subject: en ? `[DMC FUJI] Order cancelled (${o.code})` : `【DMC FUJI】ご注文をキャンセルしました（${o.code}）`,
      heading: en ? "Your order has been cancelled" : "ご注文をキャンセルしました",
      lines: en
        ? [`Dear ${o.customer_name || o.shipping_name},`, `Your order has been cancelled and ${formatYen(refund)} has been refunded to your card.`]
        : [`${o.customer_name || o.shipping_name} 様`, `ご注文をキャンセルし、${formatYen(refund)}をカードに返金しました。明細に反映されるまで、カード会社によっては数日から数週間かかることがあります。`],
      rows: orderRows(o, o.locale),
    },
  ]);
}
