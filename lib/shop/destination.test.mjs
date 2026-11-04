import { test } from "node:test";
import assert from "node:assert/strict";
import { destinationFor } from "./destination.ts";

test("日本語のページは日本国内へのお届け（国内の送料）", () => {
  assert.deepEqual(destinationFor("ja"), { overseas: false, country: "JP" });
});

test("英語のページはオーストラリアへのお届けだけ（海外の一律の送料）", () => {
  assert.deepEqual(destinationFor("en"), { overseas: true, country: "AU" });
});

test("言語がわからないときは日本国内として扱う", () => {
  assert.deepEqual(destinationFor(undefined), { overseas: false, country: "JP" });
  assert.deepEqual(destinationFor("fr"), { overseas: false, country: "JP" });
});
