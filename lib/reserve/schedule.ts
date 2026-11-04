/**
 * 予約できる枠の計算。時刻はすべて日本時間で考える（サーバーは UTC で動くので、Date のローカル時刻は使わない）。
 * 日本に夏時間は無いので、+09:00 の固定で足りる。
 *
 * Next に依存しない（schedule.test.mjs が node --test で直接読む）。
 */

export type ServiceRule = {
  /** 開始できる時刻（HH:MM） */
  startTimes: string[];
  /** この時刻までに終わる枠だけを出す（HH:MM） */
  closesAt: string;
  /** 予約を受ける曜日（0 = 日曜） */
  weekdays: number[];
  /** 開始の何時間前で締め切るか */
  leadHours: number;
  /** 何日先まで受けるか */
  maxAdvanceDays: number;
};

/** 埋まっている時間（確定の予約と、支払い中の仮押さえ） */
export type BusyRange = { start: Date; end: Date };

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const JST_OFFSET_MS = 9 * HOUR_MS;

const DATE_RE = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isDateString(value: unknown): value is string {
  if (typeof value !== "string" || !DATE_RE.test(value)) return false;
  // 2026-02-31 のような存在しない日を弾く（3/3 に繰り上がるか、Invalid Date になる）
  const at = jstInstant(value, "00:00");
  return !Number.isNaN(at.getTime()) && jstDateString(at) === value;
}

export function isMonthString(value: unknown): value is string {
  return typeof value === "string" && MONTH_RE.test(value);
}

export function isTimeString(value: unknown): value is string {
  return typeof value === "string" && TIME_RE.test(value);
}

/** 日本時間の日付と時刻を、その瞬間の Date にする */
export function jstInstant(date: string, time: string): Date {
  return new Date(`${date}T${time}:00+09:00`);
}

/** その瞬間の、日本時間の日付（YYYY-MM-DD） */
export function jstDateString(at: Date): string {
  return new Date(at.getTime() + JST_OFFSET_MS).toISOString().slice(0, 10);
}

/** その瞬間の、日本時間の時刻（HH:MM） */
export function jstTimeString(at: Date): string {
  return new Date(at.getTime() + JST_OFFSET_MS).toISOString().slice(11, 16);
}

/** 日付の曜日（0 = 日曜） */
export function weekdayOf(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

/** 月（YYYY-MM）の日付の一覧 */
export function datesInMonth(month: string): string[] {
  const [y, m] = month.split("-").map(Number);
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return Array.from({ length: days }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`);
}

/** その日付から n 日後の日付 */
export function addDays(date: string, days: number): string {
  return jstDateString(new Date(jstInstant(date, "00:00").getTime() + days * DAY_MS));
}

function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** 予約を受ける最後の日（今日から maxAdvanceDays 日後） */
export function lastBookableDate(rule: ServiceRule, now: Date): string {
  return addDays(jstDateString(now), rule.maxAdvanceDays);
}

/** 時間の枠。booked はほかの予約（支払い中の仮押さえを含む）で埋まっている */
export type Slot = { time: string; status: "available" | "booked" };

/**
 * 日の状態。カレンダーの印に使う。
 * - open   … 予約できる枠がある
 * - full   … 枠はあるが、すべて埋まっている（満席）
 * - closed … 休みの日・予約を受けない曜日
 * 受付期間の外（締切を過ぎた日・受付より先の日）は null（カレンダーでは選べない日）
 */
export type DayAvailability = { status: "open" | "full"; slots: Slot[] } | { status: "closed"; slots: [] };

type DayInput = {
  rule: ServiceRule;
  durationMinutes: number;
  date: string;
  now: Date;
  busy: BusyRange[];
  closedDates: ReadonlySet<string>;
};

/**
 * その日の枠と状態。
 * 閉店時刻までに終わらない枠と、締切（開始の leadHours 時間前）を過ぎた枠は出さない。
 * ほかの予約と時間が重なる枠は booked にする（埋まった枠は、ほかの人が選べない）
 */
export function dayAvailability(input: DayInput): DayAvailability | null {
  const { rule, durationMinutes, date, now, busy, closedDates } = input;

  if (date > lastBookableDate(rule, now)) return null;

  const closesAt = minutesOf(rule.closesAt);
  const deadline = now.getTime() + rule.leadHours * HOUR_MS;
  const times = [...new Set(rule.startTimes)]
    .filter(isTimeString)
    .sort()
    .filter((time) => minutesOf(time) + durationMinutes <= closesAt)
    .filter((time) => jstInstant(date, time).getTime() >= deadline);
  if (times.length === 0) return null;

  if (closedDates.has(date) || !rule.weekdays.includes(weekdayOf(date))) {
    return { status: "closed", slots: [] };
  }

  const slots: Slot[] = times.map((time) => {
    const start = jstInstant(date, time).getTime();
    const end = start + durationMinutes * 60 * 1000;
    const booked = busy.some((b) => b.start.getTime() < end && start < b.end.getTime());
    return { time, status: booked ? "booked" : "available" };
  });
  return { status: slots.some((s) => s.status === "available") ? "open" : "full", slots };
}

/** その日に予約できる開始時刻 */
export function slotsForDate(input: DayInput): string[] {
  const day = dayAvailability(input);
  return day ? day.slots.filter((s) => s.status === "available").map((s) => s.time) : [];
}

/** 月（YYYY-MM）の日ごとの状態。受付期間の外の日は入れない */
export function monthAvailability(input: Omit<DayInput, "date"> & { month: string }): Record<string, DayAvailability> {
  const result: Record<string, DayAvailability> = {};
  for (const date of datesInMonth(input.month)) {
    const day = dayAvailability({ ...input, date });
    if (day) result[date] = day;
  }
  return result;
}

/** その月の枠を出すときに、埋まっている予約を読む範囲（月の初めから終わりまで） */
export function monthRange(month: string): { from: Date; to: Date } {
  const dates = datesInMonth(month);
  return {
    from: jstInstant(dates[0], "00:00"),
    to: jstInstant(addDays(dates[dates.length - 1], 1), "00:00"),
  };
}

/** 月（YYYY-MM）から n か月後の月 */
export function addMonths(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** カレンダーで動ける月の範囲（今月から、受付の最後の日の月まで） */
export function bookableMonths(maxAdvanceDays: number, now: Date): { first: string; last: string } {
  const today = jstDateString(now);
  return { first: today.slice(0, 7), last: addDays(today, maxAdvanceDays).slice(0, 7) };
}

/** 月のカレンダーのマス。日曜始まりで、月の初めの前を null で埋める */
export function monthGrid(month: string): (string | null)[] {
  const dates = datesInMonth(month);
  return [...Array<null>(weekdayOf(dates[0])).fill(null), ...dates];
}
