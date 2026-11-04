// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { isAdminEmail } from "./allowlist.ts";

test("ADMIN_EMAILS にあるアドレスだけ通す（大文字小文字・空白は気にしない）", () => {
  const list = " shop@dmc.test, Owner@DMC.test ,";
  assert.equal(isAdminEmail("shop@dmc.test", list), true);
  assert.equal(isAdminEmail("owner@dmc.test", list), true);
  assert.equal(isAdminEmail("someone@dmc.test", list), false);
});

test("ADMIN_EMAILS が無い・メールが無いときは、誰も通さない", () => {
  assert.equal(isAdminEmail("shop@dmc.test", undefined), false);
  assert.equal(isAdminEmail("shop@dmc.test", ""), false);
  assert.equal(isAdminEmail(null, "shop@dmc.test"), false);
  assert.equal(isAdminEmail("", ","), false);
});
