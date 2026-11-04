// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingCancelledLines, bookingConflictLines } from "./messages.ts";

const text = (lines) => lines.join("\n");

test("自動返金に失敗したときは、お客さまに「返金しました」と書かない", () => {
  for (const locale of ["ja", "en"]) {
    const failed = text(bookingConflictLines({ name: "花子", refunded: false, locale }));
    assert.doesNotMatch(failed, /返金しました|have refunded/);
    const done = text(bookingConflictLines({ name: "花子", refunded: true, locale }));
    assert.match(done, /全額カードに返金しました|refunded the full amount/);
  }
});

test("当日払いの予約を取り消したときは、キャンセル料や返金の話を書かない", () => {
  for (const locale of ["ja", "en"]) {
    const unpaid = text(bookingCancelledLines({ name: "花子", refund: 0, paidOnline: false, locale }));
    assert.doesNotMatch(unpaid, /キャンセルポリシー|返金|cancellation policy|refund/i);
  }
});

test("カード払いの予約は、返金額か、返金が無いことを書く", () => {
  assert.match(text(bookingCancelledLines({ name: "花子", refund: 5000, paidOnline: true, locale: "ja" })), /¥5,000をカードに返金しました/);
  assert.match(text(bookingCancelledLines({ name: "花子", refund: 0, paidOnline: true, locale: "ja" })), /キャンセルポリシーにより、返金はありません/);
});

test("海外発送の注文には、送料が大きく違うときは発送の前に相談すると書き、別に請求するとは書かない", async () => {
  const { orderPaidLines } = await import("./messages.ts");
  for (const locale of ["ja", "en"]) {
    const overseas = text(orderPaidLines({ name: "Hanako", deliveryNote: "ご注文から3営業日以内に発送します。", overseas: true, locale }));
    assert.match(overseas, /発送の前に.*ご相談|contact you before shipping/);
    assert.doesNotMatch(overseas, /別に請求|separate|お支払いが済みましたら発送/);
    const domestic = text(orderPaidLines({ name: "Hanako", deliveryNote: "ご注文から3営業日以内に発送します。", overseas: false, locale }));
    assert.match(domestic, /3営業日/);
  }
});
