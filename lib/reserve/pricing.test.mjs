// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { bookingAmount, cancellationFee, cancellationRate, formatYen } from "./pricing.ts";

const startsAt = new Date("2026-11-10T11:00:00+09:00");
const hoursBefore = (h) => new Date(startsAt.getTime() - h * 60 * 60 * 1000);

test("料金は 1 人目の料金に、2 人目から 1 人ごとの料金を足す", () => {
  // Kimono Experience: 1 着目 ¥10,000、2 着目から ¥5,000
  assert.equal(bookingAmount(10000, 5000, 1), 10000);
  assert.equal(bookingAmount(10000, 5000, 3), 20000);
  // Chloe は人数で変わらない
  assert.equal(bookingAmount(2000, 0, 4), 2000);
});

test("48 時間より前の取消はキャンセル料なし", () => {
  assert.equal(cancellationRate(startsAt, hoursBefore(49)), 0);
  assert.equal(cancellationFee(10000, startsAt, hoursBefore(72)), 0);
});

test("48 時間前を過ぎたら 50%、24 時間前を過ぎたら 100%", () => {
  assert.equal(cancellationFee(10000, startsAt, hoursBefore(48)), 5000);
  assert.equal(cancellationFee(10000, startsAt, hoursBefore(25)), 5000);
  assert.equal(cancellationFee(10000, startsAt, hoursBefore(24)), 10000);
  // 開始後（来なかった）も 100%
  assert.equal(cancellationFee(10000, startsAt, hoursBefore(-1)), 10000);
});

test("50% で円未満が出たら切り捨てる", () => {
  assert.equal(cancellationFee(2001, startsAt, hoursBefore(30)), 1000);
});

test("円の表示は 3 桁ごとに区切る", () => {
  assert.equal(formatYen(100000), "¥100,000");
  assert.equal(formatYen(0), "¥0");
});
