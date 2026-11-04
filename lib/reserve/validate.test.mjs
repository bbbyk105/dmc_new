// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBookingRequest } from "./validate.ts";

const valid = {
  serviceId: "camu",
  optionId: "2f1c9a8e-6a40-4d8e-9a3b-5f0f6c1d2e3a",
  date: "2026-11-10",
  time: "11:00",
  people: 2,
  name: "  山田 花子 ",
  email: "hanako@example.com",
  phone: "090-1234-5678",
  note: "",
  locale: "ja",
};

test("正しい入力は、前後の空白を落として通す", () => {
  const result = parseBookingRequest(valid);
  assert.equal(result.ok, true);
  assert.equal(result.value.name, "山田 花子");
  assert.equal(result.value.people, 2);
});

test("海外の電話番号も通す", () => {
  assert.equal(parseBookingRequest({ ...valid, phone: "+1 (415) 555-0100" }).ok, true);
});

test("足りない・おかしい項目を、項目の名前で返す", () => {
  const result = parseBookingRequest({
    ...valid,
    optionId: "x",
    date: "2026-02-30",
    time: "9:00",
    people: 0,
    name: " ",
    email: "hanako@",
    phone: "abc",
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors, ["optionId", "date", "time", "people", "name", "email", "phone"]);
});

test("人数は整数だけ、ご要望は 1000 文字まで", () => {
  assert.deepEqual(parseBookingRequest({ ...valid, people: 1.5 }).errors, ["people"]);
  assert.deepEqual(parseBookingRequest({ ...valid, note: "あ".repeat(1001) }).errors, ["note"]);
});

test("言語は en 以外なら ja にする", () => {
  assert.equal(parseBookingRequest({ ...valid, locale: "fr" }).value.locale, "ja");
  assert.equal(parseBookingRequest({ ...valid, locale: "en" }).value.locale, "en");
});

test("オブジェクトでない入力も落ちずに弾く", () => {
  assert.equal(parseBookingRequest(null).ok, false);
  assert.equal(parseBookingRequest("x").ok, false);
});
