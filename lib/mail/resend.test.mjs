import { test } from "node:test";
import assert from "node:assert/strict";
import { sendViaResend } from "./resend.ts";

/** Resend の SDK の代わり。送った中身を残し、決めた結果を返す */
function fakeClient(result = { data: { id: "email_1" }, error: null }) {
  const sent = [];
  return {
    sent,
    emails: {
      send: async (payload) => {
        sent.push(payload);
        return { ...result, headers: null };
      },
    },
  };
}

test("1 通ずつ、送り元・宛先・件名・本文（HTML とテキスト）・返信先を付けて送る", async () => {
  const client = fakeClient();
  await sendViaResend(
    [
      { to: "guest@example.com", subject: "ご予約を承りました", html: "<p>本文</p>", text: "本文", replyTo: "shop@example.com" },
      { to: "shop@example.com", subject: "【予約】", html: "<p>店</p>", text: "店" },
    ],
    { client, from: "DMC FUJI <noreply@dmc123.jp>" },
  );
  assert.deepEqual(client.sent, [
    {
      from: "DMC FUJI <noreply@dmc123.jp>",
      to: "guest@example.com",
      subject: "ご予約を承りました",
      html: "<p>本文</p>",
      text: "本文",
      replyTo: "shop@example.com",
    },
    { from: "DMC FUJI <noreply@dmc123.jp>", to: "shop@example.com", subject: "【予約】", html: "<p>店</p>", text: "店", replyTo: undefined },
  ]);
});

test("Resend が失敗を返したら（例外にはならない）、送れなかったことを例外にして知らせる", async () => {
  const client = fakeClient({ data: null, error: { name: "validation_error", message: "The dmc123.jp domain is not verified.", statusCode: 403 } });
  await assert.rejects(
    sendViaResend([{ to: "guest@example.com", subject: "s", html: "h", text: "t" }], { client, from: "DMC FUJI <noreply@dmc123.jp>" }),
    /domain is not verified/,
  );
});
