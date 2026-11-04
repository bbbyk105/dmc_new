import { test } from "node:test";
import assert from "node:assert/strict";
import { formatShippingAddress, shippingAddressLabel, shippingDetailsOf } from "./address.ts";

test("日本の住所は、都道府県・市区町村・番地の順に並べる（郵便番号は〒を付けて前に出す）", () => {
  const address = formatShippingAddress({
    country: "JP",
    postal_code: "417-0043",
    state: "静岡県",
    city: "富士市",
    line1: "荒田島町1-13",
    line2: "ラシェット1",
  });
  assert.equal(address, "静岡県 富士市 荒田島町1-13 ラシェット1");
  assert.equal(
    shippingAddressLabel({ shipping_postal_code: "417-0043", shipping_address: address, overseas: false }),
    "〒417-0043 静岡県 富士市 荒田島町1-13 ラシェット1",
  );
});

test("オーストラリアの住所は、向こうの宛名の書き方で国名まで入れ、〒は付けない", () => {
  const address = formatShippingAddress({
    country: "AU",
    postal_code: "2000",
    state: "NSW",
    city: "Sydney",
    line1: "1 George St",
    line2: "Unit 5",
  });
  assert.equal(address, "1 George St, Unit 5, Sydney NSW 2000, Australia");
  assert.equal(
    shippingAddressLabel({ shipping_postal_code: "2000", shipping_address: address, overseas: true }),
    "1 George St, Unit 5, Sydney NSW 2000, Australia",
  );
});

test("お届け先は、新しい API の形（collected_information の下）から取り出す", () => {
  const details = { name: "Jane Test", address: { country: "AU", city: "Sydney" } };
  assert.deepEqual(shippingDetailsOf({ collected_information: { shipping_details: details } }), details);
});

test("Webhook が古い API の版で届いたとき（shipping_details が上にある）も、お届け先を取り出す", () => {
  const details = { name: "テスト 花子", address: { country: "JP", state: "静岡県", city: "富士市" } };
  assert.deepEqual(shippingDetailsOf({ shipping_details: details }), details);
});
