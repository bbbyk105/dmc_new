/**
 * 予約の料金とキャンセル料。金額はすべて税込・円。
 *
 * キャンセルポリシー（特定商取引法に基づく表記と同じ）:
 * - 開始の 48 時間前を過ぎてからの取消は料金の 50%
 * - 開始の 24 時間前を過ぎてからの取消は料金の 100%
 *
 * Next に依存しない（pricing.test.mjs が node --test で直接読む）。
 */

const HOUR_MS = 60 * 60 * 1000;

/** 料金。1 人目は price、2 人目から 1 人ごとに extraPersonPrice を足す（データベースの hold_booking と同じ計算） */
export function bookingAmount(price: number, extraPersonPrice: number, people: number): number {
  return price + extraPersonPrice * Math.max(0, people - 1);
}

/** 料金のうち、キャンセル料として返金しない割合（0・0.5・1） */
export function cancellationRate(startsAt: Date, cancelledAt: Date): number {
  const hoursBefore = (startsAt.getTime() - cancelledAt.getTime()) / HOUR_MS;
  if (hoursBefore <= 24) return 1;
  if (hoursBefore <= 48) return 0.5;
  return 0;
}

/** キャンセル料（円未満は切り捨てて、お客さまに有利にする） */
export function cancellationFee(amount: number, startsAt: Date, cancelledAt: Date): number {
  return Math.floor(amount * cancellationRate(startsAt, cancelledAt));
}

/** 円の表示（¥10,000） */
export function formatYen(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}
