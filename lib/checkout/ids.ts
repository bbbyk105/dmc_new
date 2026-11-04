import "server-only";
import { createHash, randomBytes, randomInt } from "node:crypto";

// 読み間違えやすい 0/O・1/I/L を入れない
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** お客さまに見せる番号（予約 R-XXXXXX、注文 S-XXXXXX） */
export function newCode(prefix: "R" | "S"): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return `${prefix}-${code}`;
}

/** Stripe の画面から戻ってきたときに仮押さえを外すための鍵（URL に載る） */
export function newReleaseToken(): string {
  return randomBytes(24).toString("base64url");
}

/** 仮押さえの数を接続元ごとに抑えるための鍵。IP をそのまま残さない */
export function clientKeyOf(headers: Headers): string | null {
  const ip = headers.get("x-real-ip") ?? headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (!ip) return null;
  return createHash("sha256").update(`dmc-hold:${ip}`).digest("hex").slice(0, 32);
}
