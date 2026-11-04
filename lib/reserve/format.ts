/**
 * 予約の日時の表示。サーバーが UTC でも日本時間で出す。
 * Next に依存しない（format.test.mjs が node --test で直接読む）。
 */

const WEEKDAYS_JA = ["日", "月", "火", "水", "木", "金", "土"];
const WEEKDAYS_EN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function jstParts(at: Date) {
  const d = new Date(at.getTime() + 9 * 60 * 60 * 1000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
    time: d.toISOString().slice(11, 16),
  };
}

/** 2026年11月10日（火） / Tue, Nov 10, 2026 */
export function formatDate(at: Date, locale: string): string {
  const p = jstParts(at);
  return locale === "en"
    ? `${WEEKDAYS_EN[p.weekday]}, ${MONTHS_EN[p.month - 1]} ${p.day}, ${p.year}`
    : `${p.year}年${p.month}月${p.day}日（${WEEKDAYS_JA[p.weekday]}）`;
}

/** 2026年11月10日（火）11:00〜14:00 / Tue, Nov 10, 2026, 11:00–14:00 (JST) */
export function formatSlot(startsAt: Date, endsAt: Date, locale: string): string {
  const start = jstParts(startsAt).time;
  const end = jstParts(endsAt).time;
  return locale === "en"
    ? `${formatDate(startsAt, locale)}, ${start}–${end} (JST)`
    : `${formatDate(startsAt, locale)}${start}〜${end}`;
}

/** 日付の文字列（YYYY-MM-DD）の表示 */
export function formatDateString(date: string, locale: string): string {
  return formatDate(new Date(`${date}T12:00:00+09:00`), locale);
}
