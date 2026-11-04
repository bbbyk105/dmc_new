import { test } from "node:test";
import assert from "node:assert/strict";
import { serviceIdForLocale, servicesForLocale } from "./catalog.ts";

const all = [{ id: "camu" }, { id: "hanayume" }, { id: "chloe" }];

test("日本語の予約は花夢と Chloe（CAMU は出さない）", () => {
  assert.deepEqual(
    servicesForLocale(all, "ja").map((s) => s.id),
    ["hanayume", "chloe"],
  );
});

test("英語の予約は CAMU と Chloe（花夢は出さない）", () => {
  assert.deepEqual(
    servicesForLocale(all, "en").map((s) => s.id),
    ["camu", "chloe"],
  );
});

test("ほかの言語の着物のサービスを指す ?service= は、その言語のものに読み替える", () => {
  assert.equal(serviceIdForLocale("camu", "ja"), "hanayume");
  assert.equal(serviceIdForLocale("hanayume", "en"), "camu");
  assert.equal(serviceIdForLocale("hanayume", "ja"), "hanayume");
  assert.equal(serviceIdForLocale("chloe", "en"), "chloe");
  assert.equal(serviceIdForLocale(undefined, "ja"), undefined);
});
