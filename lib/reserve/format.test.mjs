// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDateString, formatSlot } from "./format.ts";

const start = new Date("2026-11-10T11:00:00+09:00");
const end = new Date("2026-11-10T14:00:00+09:00");

test("予約の日時は日本時間で出す", () => {
  assert.equal(formatSlot(start, end, "ja"), "2026年11月10日（火）11:00〜14:00");
  assert.equal(formatSlot(start, end, "en"), "Tue, Nov 10, 2026, 11:00–14:00 (JST)");
});

test("日本時間の 0 時台も、前の日にならない", () => {
  const early = new Date("2026-11-01T00:30:00+09:00");
  assert.equal(formatSlot(early, early, "ja"), "2026年11月1日（日）00:30〜00:30");
});

test("日付だけの表示", () => {
  assert.equal(formatDateString("2026-11-03", "ja"), "2026年11月3日（火）");
  assert.equal(formatDateString("2026-11-03", "en"), "Tue, Nov 3, 2026");
});
