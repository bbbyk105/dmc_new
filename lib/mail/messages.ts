/**
 * お客さまに送るメールの本文のうち、状況で変わる文。
 * Next に依存しない（messages.test.mjs が node --test で直接読む）。
 */
import { formatYen } from "../reserve/pricing.ts";

/** 予約の取消のお知らせ。当日払いの予約（お店が登録した予約）には、キャンセル料・返金の話を書かない */
export function bookingCancelledLines(input: { name: string; refund: number; paidOnline: boolean; locale: string }): string[] {
  const { name, refund, paidOnline } = input;
  if (input.locale === "en") {
    const money = !paidOnline
      ? ""
      : refund > 0
        ? ` We have refunded ${formatYen(refund)} to your card. It may take several days to appear on your statement.`
        : " No refund applies under our cancellation policy.";
    return [`Dear ${name},`, `Your booking has been cancelled.${money}`];
  }
  const money = !paidOnline
    ? ""
    : refund > 0
      ? `${formatYen(refund)}をカードに返金しました。明細に反映されるまで、カード会社によっては数日から数週間かかることがあります。`
      : "キャンセルポリシーにより、返金はありません。";
  return [`${name} 様`, `ご予約をキャンセルしました。${money}`];
}

/** 支払いの途中で枠が取られ、予約を確定できなかったときのお知らせ。返金に失敗したときは、返金したと書かない */
export function bookingConflictLines(input: { name: string; refunded: boolean; locale: string }): string[] {
  const { name, refunded } = input;
  return input.locale === "en"
    ? [
        `Dear ${name},`,
        "We are sorry. Your payment took longer than the time we could hold the slot, and the slot was booked by someone else in the meantime.",
        refunded
          ? "We have refunded the full amount to your card."
          : "We will return the full amount to your card. We will contact you once it is done.",
        "Please choose another time on our website or call us.",
      ]
    : [
        `${name} 様`,
        "申し訳ありません。お支払いの手続きに時間がかかったため、お取りしていた時間の期限が過ぎ、そのあいだに別のお客さまのご予約が入ってしまいました。",
        refunded
          ? "お支払いいただいた金額は全額カードに返金しました。"
          : "お支払いいただいた金額は、全額をカードにお返しします。手続きが済みましたら、あらためてご連絡します。",
        "お手数ですが、別の日時でご予約いただくか、お電話でご相談ください。",
      ];
}

/** 注文の確定のお知らせ。オーストラリアへの発送は、一律の送料でいただき、実際の送料が大きく違うときは発送の前に相談すると書く */
export function orderPaidLines(input: { name: string; deliveryNote: string; overseas: boolean; locale: string }): string[] {
  const { name, deliveryNote, overseas } = input;
  if (input.locale === "en") {
    return overseas
      ? [
          `Dear ${name},`,
          "We have received your order and payment, including flat-rate shipping to Australia.",
          "If the actual shipping cost turns out to be very different, we will contact you before shipping.",
          "We will email you again when your order ships.",
        ]
      : [`Dear ${name},`, "We have received your payment.", deliveryNote, "We will email you again when your order ships."];
  }
  return overseas
    ? [
        `${name} 様`,
        "ご注文と、オーストラリアへの送料（一律）を含むお支払いを確認しました。",
        "実際の送料が大きく異なる場合は、発送の前にメールでご相談します。",
        "発送しましたら、あらためてメールでお知らせします。",
      ]
    : [`${name} 様`, "ご注文とお支払いを確認しました。", deliveryNote, "発送しましたら、あらためてメールでお知らせします。"];
}
