// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLocalBusiness } from "./local-business.ts";

const SITE = "https://www.dmc123.jp";
const MAPS_URL = "https://maps.google.com/?cid=6772274389816221658";

test("店名は「DMC」（Dad・Mom・Child）。サイトの表記「DMC FUJI」と Google マップでの名前は別名に入れる", () => {
  const ja = buildLocalBusiness(SITE, "ja");
  assert.equal(ja.name, "DMC");
  assert.ok(ja.alternateName.includes("DMC FUJI"));
  assert.ok(ja.alternateName.includes("DMC ドレスマンコード"));
  assert.equal(ja.legalName, "DMC合同会社");
});

test("説明は、海外から来る方向けの着物撮影（CAMU）から始める", () => {
  assert.match(buildLocalBusiness(SITE, "en").description, /visitors from overseas/);
  assert.equal(buildLocalBusiness(SITE, "en").makesOffer[0].name, "Kimono Photo Experience at Mt. Fuji (CAMU)");
  assert.match(buildLocalBusiness(SITE, "ja").makesOffer[0].name, /CAMU/);
});

test("地図は Google マップの店舗ページを指し、位置（緯度・経度）を持つ", () => {
  const ja = buildLocalBusiness(SITE, "ja");
  assert.equal(ja.hasMap, MAPS_URL);
  assert.ok(ja.sameAs.includes(MAPS_URL));
  assert.ok(ja.sameAs.includes("https://www.instagram.com/dmcfuji123/"));
  assert.deepEqual(ja.geo, { "@type": "GeoCoordinates", latitude: 35.1582153, longitude: 138.6861072 });
});

test("日本語のページでは住所を日本語で、英語のページでは英語で出す", () => {
  const ja = buildLocalBusiness(SITE, "ja");
  assert.equal(ja.address.addressRegion, "静岡県");
  assert.equal(ja.address.addressLocality, "富士市");
  assert.equal(ja.address.streetAddress, "荒田島町1-13 ラシェット1");
  assert.equal(ja.address.postalCode, "417-0043");

  const en = buildLocalBusiness(SITE, "en");
  assert.equal(en.address.addressRegion, "Shizuoka");
  assert.equal(en.address.addressLocality, "Fuji-shi");
  assert.equal(en.address.postalCode, "417-0043");
});

test("料金の幅は、いちばん安い Chloe 1 時間 ¥2,000 から CAMU Premium ¥100,000 まで", () => {
  assert.equal(buildLocalBusiness(SITE, "ja").priceRange, "¥2,000–¥100,000");
});

test("電話・営業時間・無料駐車場を持ち、ほかのデータから @id で参照できる", () => {
  const ja = buildLocalBusiness(SITE, "ja");
  assert.equal(ja["@id"], `${SITE}/#business`);
  // Google マップの店舗ページの「ウェブサイト」と同じ URL。日英のどちらのページでも同じにする
  assert.equal(ja.url, SITE);
  assert.equal(buildLocalBusiness(SITE, "en").url, SITE);
  assert.equal(ja.telephone, "+81545554550");
  assert.equal(ja.openingHoursSpecification[0].opens, "11:00");
  assert.ok(!ja.openingHoursSpecification[0].dayOfWeek.includes("Wednesday"));
  assert.deepEqual(ja.amenityFeature, [
    { "@type": "LocationFeatureSpecification", name: "無料駐車場", value: true },
  ]);
});
