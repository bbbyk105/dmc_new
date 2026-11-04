/**
 * 予約フォームから届いた値の確認。サーバー（/api/reserve/checkout）でだけ信じる。
 *
 * Next に依存しない（validate.test.mjs が node --test で直接読む）。
 */
import { isDateString, isTimeString } from "./schedule.ts";

export type BookingRequest = {
  serviceId: string;
  optionId: string;
  date: string;
  time: string;
  people: number;
  name: string;
  email: string;
  phone: string;
  note: string;
  locale: "ja" | "en";
};

export type BookingField = keyof BookingRequest;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 海外のお客さまもいるので、数字・+・-・空白・括弧だけを見る
const PHONE_RE = /^\+?[0-9()\-\s]{8,20}$/;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function isEmail(value: string): boolean {
  return value.length <= 254 && EMAIL_RE.test(value);
}

export function parseBookingRequest(
  body: unknown,
): { ok: true; value: BookingRequest } | { ok: false; errors: BookingField[] } {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const errors: BookingField[] = [];

  const serviceId = text(b.serviceId);
  if (!/^[a-z0-9-]{1,40}$/.test(serviceId)) errors.push("serviceId");

  const optionId = text(b.optionId);
  if (!isUuid(optionId)) errors.push("optionId");

  const date = text(b.date);
  if (!isDateString(date)) errors.push("date");

  const time = text(b.time);
  if (!isTimeString(time)) errors.push("time");

  const people = typeof b.people === "number" ? b.people : Number(text(b.people));
  if (!Number.isInteger(people) || people < 1 || people > 50) errors.push("people");

  const name = text(b.name);
  if (name.length < 1 || name.length > 100) errors.push("name");

  const email = text(b.email);
  if (!isEmail(email)) errors.push("email");

  const phone = text(b.phone);
  if (!PHONE_RE.test(phone)) errors.push("phone");

  const note = text(b.note);
  if (note.length > 1000) errors.push("note");

  const locale = b.locale === "en" ? "en" : "ja";

  if (errors.length > 0) return { ok: false, errors };
  return { ok: true, value: { serviceId, optionId, date, time, people, name, email, phone, note, locale } };
}
