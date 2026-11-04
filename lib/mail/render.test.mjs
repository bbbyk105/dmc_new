// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { renderMail } from "./render.ts";
import { ADDRESS_EN, ADDRESS_JA } from "../site-info.ts";

const base = { to: "a@example.com", subject: "s", heading: "h", lines: ["line"], rows: [["k", "v"]] };

test("英語のメールの末尾は、英語の住所にする", () => {
  const { html, text } = renderMail({ ...base, locale: "en" });
  assert.ok(text.includes(ADDRESS_EN), "テキストに英語の住所がない");
  assert.ok(html.includes(ADDRESS_EN), "HTML に英語の住所がない");
  assert.ok(!text.includes(ADDRESS_JA), "テキストに日本語の住所が残っている");
  assert.match(html, /<html lang="en">/);
});

test("日本語のメール（お店あてを含む）の末尾は、日本語の住所にする", () => {
  const { text, html } = renderMail({ ...base });
  assert.ok(text.includes(ADDRESS_JA));
  assert.match(html, /<html lang="ja">/);
});

test("本文の記号は、HTML のタグにならないようにする", () => {
  const { html } = renderMail({ ...base, lines: ["<script>alert(1)</script>"] });
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
});
