// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { PAGE_BACKGROUND, toShopPhoto } from "./photo.ts";

/** 背景色の上に、真ん中に商品（色のついた四角）を置いた写真 */
async function photo({ width, height, background, product }) {
  const box = Buffer.from(
    `<svg width="${width}" height="${height}"><rect width="100%" height="100%" fill="rgb(${background})"/>` +
      `<rect x="${width / 3}" y="${height / 3}" width="${width / 3}" height="${height / 3}" fill="rgb(${product})"/></svg>`,
  );
  return sharp(box).jpeg({ quality: 95 }).withExif({ IFD0: { Copyright: "camera" } }).toBuffer();
}

async function pixel(buffer, x, y) {
  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  const i = (y * info.width + x) * info.channels;
  return [data[i], data[i + 1], data[i + 2]];
}

function near(actual, expected, tolerance, label) {
  actual.forEach((v, i) => assert.ok(Math.abs(v - expected[i]) <= tolerance, `${label}: ${actual} と ${expected} の差が ${tolerance} を超える`));
}

test("白っぽい背景は、ページの生成りになる（写真の外側も生成りの正方形）", async () => {
  const out = await toShopPhoto(await photo({ width: 600, height: 400, background: "247,245,252", product: "190,40,40" }), 400);
  const meta = await sharp(out).metadata();
  assert.equal(meta.format, "webp");
  assert.deepEqual([meta.width, meta.height], [400, 400]);
  near(await pixel(out, 5, 5), PAGE_BACKGROUND, 3, "写真の外（角）");
  near(await pixel(out, 60, 200), PAGE_BACKGROUND, 4, "写真の中の背景");
});

test("商品の色は、白の色味を合わせる分しか変わらない", async () => {
  const out = await toShopPhoto(await photo({ width: 600, height: 400, background: "247,245,252", product: "190,40,40" }), 400);
  near(await pixel(out, 200, 200), [190, 40, 40], 12, "商品");
});

test("縦長の写真も、切らずに正方形の真ん中に置く", async () => {
  const out = await toShopPhoto(await photo({ width: 400, height: 600, background: "250,250,250", product: "20,90,80" }), 300);
  near(await pixel(out, 150, 150), [20, 90, 80], 12, "商品");
  near(await pixel(out, 10, 150), PAGE_BACKGROUND, 3, "左の余白");
});

test("暗い背景の写真は、明るくせずに色を変えない", async () => {
  const out = await toShopPhoto(await photo({ width: 600, height: 400, background: "40,40,40", product: "190,40,40" }), 400);
  near(await pixel(out, 200, 200), [190, 40, 40], 6, "商品");
  near(await pixel(out, 60, 200), [40, 40, 40], 6, "背景");
});

test("撮影情報は残さない", async () => {
  const out = await toShopPhoto(await photo({ width: 300, height: 200, background: "250,250,250", product: "0,0,0" }), 200);
  const meta = await sharp(out).metadata();
  assert.equal(meta.exif, undefined);
});
