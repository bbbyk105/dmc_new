/**
 * メールの枠（見出し・本文・表・末尾の店の情報）を HTML とテキストにする。
 * Next に依存しない（render.test.mjs が node --test で直接読む）。
 */
import { ADDRESS_EN, ADDRESS_JA, TELEPHONE_DISPLAY } from "../site-info.ts";

export type Mail = {
  to: string;
  subject: string;
  heading: string;
  lines: string[];
  rows: [string, string][];
  replyTo?: string;
  /** メールの言語（お客さまが見ていたサイトの言語。お店あては ja） */
  locale?: "ja" | "en";
};

function escape(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

export function renderMail(mail: Mail): { html: string; text: string } {
  const locale = mail.locale === "en" ? "en" : "ja";
  const address = locale === "en" ? ADDRESS_EN : ADDRESS_JA;
  const rows = mail.rows
    .map(
      ([label, value]) =>
        `<tr><th style="text-align:left;padding:8px 12px;border-bottom:1px solid #E3DFD4;color:#817D75;font-weight:normal;white-space:nowrap;vertical-align:top">${escape(label)}</th><td style="padding:8px 12px;border-bottom:1px solid #E3DFD4;white-space:pre-wrap">${escape(value)}</td></tr>`,
    )
    .join("");
  const html = `<!DOCTYPE html><html lang="${locale}"><head><meta charset="utf-8"></head><body style="margin:0;background:#F4F1EA;font-family:'Hiragino Sans','Noto Sans JP',sans-serif;color:#181816;line-height:1.8">
<div style="max-width:600px;margin:0 auto;padding:24px">
<div style="background:#181816;color:#F4F1EA;padding:24px;text-align:center;font-size:18px;letter-spacing:0.1em">${escape(mail.heading)}</div>
<div style="background:#FAF9F6;border:1px solid #E3DFD4;padding:24px">
${mail.lines.map((l) => `<p style="margin:0 0 12px">${escape(l)}</p>`).join("")}
${rows ? `<table style="width:100%;border-collapse:collapse;margin-top:12px;font-size:14px">${rows}</table>` : ""}
</div>
<p style="text-align:center;color:#817D75;font-size:12px;margin-top:16px">DMC FUJI / ${escape(address)} / ${escape(TELEPHONE_DISPLAY)}</p>
</div></body></html>`;
  const text = [
    mail.heading,
    "",
    ...mail.lines,
    "",
    ...mail.rows.map(([label, value]) => `■ ${label}\n${value}`),
    "",
    `DMC FUJI / ${address} / ${TELEPHONE_DISPLAY}`,
  ].join("\n");
  return { html, text };
}
