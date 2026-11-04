// node --test で流す（npm run test:unit）
import { test } from "node:test";
import assert from "node:assert/strict";
import { findSecretsInPublicEnv } from "./public-env.ts";

/** 署名は見ないので、中身（payload）だけそれらしくした JWT */
function jwt(payload) {
  const part = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  return `${part({ alg: "HS256", typ: "JWT" })}.${part(payload)}.signature`;
}

test("NEXT_PUBLIC_ に Supabase の service_role の鍵（古い形式）が入っていたら見つける", () => {
  const env = {
    NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: jwt({ iss: "supabase", role: "service_role" }),
  };
  assert.deepEqual(findSecretsInPublicEnv(env), ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
});

test("NEXT_PUBLIC_ に Supabase の secret の鍵（sb_secret_）が入っていたら見つける", () => {
  assert.deepEqual(findSecretsInPublicEnv({ NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_secret_abc" }), ["NEXT_PUBLIC_SUPABASE_ANON_KEY"]);
});

test("公開してよい鍵（publishable・古い anon）と、NEXT_PUBLIC_ でない変数の秘密の鍵は通す", () => {
  const env = {
    NEXT_PUBLIC_SUPABASE_ANON_KEY: "sb_publishable_abc",
    NEXT_PUBLIC_OLD_ANON: jwt({ iss: "supabase", role: "anon" }),
    SUPABASE_SERVICE_ROLE_KEY: "sb_secret_abc",
  };
  assert.deepEqual(findSecretsInPublicEnv(env), []);
});
