import { Resend } from "resend";

/** 送り元。Resend で dmc123.jp のドメインを認証しておく（MAIL_FROM で変えられる） */
export const DEFAULT_MAIL_FROM = "DMC FUJI <noreply@dmc123.jp>";

export type OutgoingMail = { to: string; subject: string; html: string; text: string; replyTo?: string };

/** Resend の SDK のうち、ここで使うところ（テストで差し替える） */
type EmailClient = { emails: { send: Resend["emails"]["send"] } };

/** RESEND_API_KEY があれば Resend のクライアントを返す（無ければ送らない） */
export function resendClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

export function mailFrom(): string {
  return process.env.MAIL_FROM || DEFAULT_MAIL_FROM;
}

/** お店の受信箱（予約・注文・お問い合わせの通知が届く。お客さまへのメールの返信先にもする） */
export function shopInbox(): string {
  return process.env.CONTACT_EMAIL || "dmc.fuji0823@gmail.com";
}

/** Resend で送る。Resend は失敗を例外ではなく error で返すので、ここで例外にする */
export async function sendViaResend(mails: OutgoingMail[], opts: { client: EmailClient; from: string }): Promise<void> {
  await Promise.all(
    mails.map(async (m) => {
      const { error } = await opts.client.emails.send({
        from: opts.from,
        to: m.to,
        subject: m.subject,
        html: m.html,
        text: m.text,
        replyTo: m.replyTo,
      });
      if (error) throw new Error(`Resend: ${error.name} ${error.message}`);
    }),
  );
}
