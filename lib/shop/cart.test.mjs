// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { addToCart, cartSummary, parseCart, setQuantity, shippingFeeFor } from "./cart.ts";

const rule = { shippingFee: 800, freeShippingThreshold: 10000, overseasShippingFee: 5000 };

test("壊れた値は捨て、同じ商品はまとめ、数は 99 までにする", () => {
  assert.deepEqual(parseCart("x"), []);
  assert.deepEqual(
    parseCart([
      { productId: "a", quantity: 2 },
      { productId: "a", quantity: 3 },
      { productId: "b", quantity: 0 },
      { productId: "c", quantity: 1.5 },
      { productId: "d", quantity: 120 },
      null,
      { quantity: 1 },
    ]),
    [
      { productId: "a", quantity: 5 },
      { productId: "d", quantity: 99 },
    ],
  );
});

test("足す・数を変える・0 にすると外れる", () => {
  let lines = addToCart([], "a", 1);
  lines = addToCart(lines, "a", 2);
  assert.deepEqual(lines, [{ productId: "a", quantity: 3 }]);
  assert.deepEqual(setQuantity(lines, "a", 5), [{ productId: "a", quantity: 5 }]);
  assert.deepEqual(setQuantity(lines, "a", 0), []);
});

test("送料は、無料になる金額ちょうどから 0 円", () => {
  assert.equal(shippingFeeFor(9999, rule), 800);
  assert.equal(shippingFeeFor(10000, rule), 0);
  assert.equal(shippingFeeFor(50000, { shippingFee: 800, freeShippingThreshold: null, overseasShippingFee: 5000 }), 800);
});

test("合計は小計と送料。在庫が足りない・売っていない商品があれば支払いに進めない", () => {
  const products = [
    { id: "a", price: 3000, stock: 5, active: true },
    { id: "b", price: 1500, stock: 1, active: true },
    { id: "c", price: 9000, stock: 3, active: false },
  ];

  const ok = cartSummary([{ productId: "a", quantity: 2 }, { productId: "b", quantity: 1 }], products, rule);
  assert.equal(ok.subtotal, 7500);
  assert.equal(ok.shipping, 800);
  assert.equal(ok.total, 8300);
  assert.equal(ok.canCheckout, true);

  const short = cartSummary([{ productId: "a", quantity: 1 }, { productId: "b", quantity: 2 }], products, rule);
  assert.equal(short.items[1].problem, "short");
  assert.equal(short.subtotal, 3000);
  assert.equal(short.canCheckout, false);

  const gone = cartSummary([{ productId: "c", quantity: 1 }, { productId: "z", quantity: 1 }], products, rule);
  assert.deepEqual(gone.items.map((i) => i.problem), ["unavailable", "unavailable"]);
  assert.equal(gone.total, 0);
  assert.equal(gone.canCheckout, false);
});

test("海外は一律の海外送料で、国内の送料無料は当てない", () => {
  const rule2 = { shippingFee: 800, freeShippingThreshold: 10000, overseasShippingFee: 5000 };
  assert.equal(shippingFeeFor(3000, rule2, true), 5000);
  assert.equal(shippingFeeFor(20000, rule2, true), 5000);
  assert.equal(shippingFeeFor(20000, rule2, false), 0);
  const summary = cartSummary([{ productId: "a", quantity: 1 }], [{ id: "a", price: 3000, stock: 5, active: true }], rule2, true);
  assert.equal(summary.shipping, 5000);
  assert.equal(summary.total, 8000);
});
