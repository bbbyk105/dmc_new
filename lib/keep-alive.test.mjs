// node --test で流す（npm run test:unit）。keep-alive.ts は Next に依存しないので、Node の型除去でそのまま読める。
import { test } from "node:test";
import assert from "node:assert/strict";
import { isCronRequest, pingSupabase } from "./keep-alive.ts";

const env = {
  NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
};

function fetchReturning(status) {
  const calls = [];
  const fetchImpl = async (input, init) => {
    calls.push([input, init]);
    return new Response(status === 200 ? "[]" : "error code: 1016", { status });
  };
  return { fetchImpl, calls };
}

test("ギャラリーと同じ Storage の一覧を、一件だけ anon key で読む", async () => {
  const { fetchImpl, calls } = fetchReturning(200);

  assert.equal(await pingSupabase(env, fetchImpl), 200);

  const [input, init] = calls[0];
  assert.equal(String(input), "https://abc.supabase.co/storage/v1/object/list/DMC");
  assert.equal(init?.method, "POST");
  assert.deepEqual(JSON.parse(init?.body), { prefix: "Kimono", limit: 1, offset: 0 });
  const headers = new Headers(init?.headers);
  assert.equal(headers.get("apikey"), "anon-key");
  assert.equal(headers.get("authorization"), "Bearer anon-key");
  assert.equal(headers.get("content-type"), "application/json");
});

test("URL の末尾に / があっても同じ所を読む", async () => {
  const { fetchImpl, calls } = fetchReturning(200);
  await pingSupabase({ ...env, NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co/" }, fetchImpl);
  assert.equal(String(calls[0][0]), "https://abc.supabase.co/storage/v1/object/list/DMC");
});

test("鍵が無ければ何もしない", async () => {
  const { fetchImpl, calls } = fetchReturning(200);
  assert.equal(await pingSupabase({}, fetchImpl), null);
  assert.equal(calls.length, 0);
});

test("読めなければ投げる（Vercel の Cron の履歴に失敗として残す）", async () => {
  const { fetchImpl } = fetchReturning(530);
  await assert.rejects(pingSupabase(env, fetchImpl), /Supabase 530/);
});

test("CRON_SECRET を入れていれば、Vercel Cron が付ける Authorization だけを通す", () => {
  assert.equal(isCronRequest("Bearer s3cret", "s3cret"), true);
  assert.equal(isCronRequest("Bearer wrong", "s3cret"), false);
  assert.equal(isCronRequest(null, "s3cret"), false);
});

test("CRON_SECRET が無ければ誰でも通す（中身は一件読むだけ）", () => {
  assert.equal(isCronRequest(null, undefined), true);
  assert.equal(isCronRequest(null, ""), true);
});
