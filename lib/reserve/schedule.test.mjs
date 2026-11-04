// node --test で流す（npm run test:unit）。schedule.ts は Next に依存しないので、Node の型除去でそのまま読める。
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  addMonths,
  bookableMonths,
  dayAvailability,
  isDateString,
  jstDateString,
  jstInstant,
  jstTimeString,
  monthAvailability,
  monthGrid,
  monthRange,
  slotsForDate,
  weekdayOf,
} from "./schedule.ts";

// Wix の CAMU と同じ設定（11:00〜14:00 の 30 分刻み、3 時間、17:00 まで、3 日前締切）
const camu = {
  startTimes: ["11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00"],
  closesAt: "17:00",
  weekdays: [0, 1, 2, 3, 4, 5, 6],
  leadHours: 72,
  maxAdvanceDays: 90,
};

const none = new Set();
// 2026-10-30（金）10:00 日本時間
const now = jstInstant("2026-10-30", "10:00");

function slots(overrides = {}) {
  return slotsForDate({ rule: camu, durationMinutes: 180, date: "2026-11-10", now, busy: [], closedDates: none, ...overrides });
}

test("日本時間の日付と時刻を、サーバーが UTC でもずれずに扱う", () => {
  const at = jstInstant("2026-11-01", "00:30");
  assert.equal(at.toISOString(), "2026-10-31T15:30:00.000Z");
  assert.equal(jstDateString(at), "2026-11-01");
  assert.equal(jstTimeString(at), "00:30");
  assert.equal(weekdayOf("2026-11-01"), 0); // 日曜
});

test("存在しない日付は日付として通さない", () => {
  assert.equal(isDateString("2026-11-30"), true);
  assert.equal(isDateString("2026-02-29"), false);
  assert.equal(isDateString("2026-02-31"), false);
  assert.equal(isDateString("2026-13-01"), false);
  assert.equal(isDateString("2026-1-01"), false);
  assert.equal(isDateString(undefined), false);
});

test("先の日は、開始時刻がすべて出る", () => {
  assert.deepEqual(slots(), camu.startTimes);
});

test("開始の 72 時間前を過ぎた枠は出さない（10/30 10:00 なら 11/2 は 10:00 より後だけ）", () => {
  assert.deepEqual(slots({ date: "2026-11-02" }), camu.startTimes);
  assert.deepEqual(slots({ date: "2026-11-02", now: jstInstant("2026-10-30", "12:00") }), [
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
  ]);
  assert.deepEqual(slots({ date: "2026-11-01" }), []);
});

test("閉店（17:00）までに終わらない枠は出さない", () => {
  // 4 時間なら 13:00 開始までで終わる
  assert.deepEqual(slots({ durationMinutes: 240 }), ["11:00", "11:30", "12:00", "12:30", "13:00"]);
});

test("ほかの予約と重なる枠は出さず、ちょうど終わった時刻からは出す", () => {
  const busy = [{ start: jstInstant("2026-11-10", "12:00"), end: jstInstant("2026-11-10", "13:00") }];
  // 3 時間なので 11:00 開始（〜14:00）も重なる。13:00 開始は重ならない
  assert.deepEqual(slots({ busy }), ["13:00", "13:30", "14:00"]);
});

test("休みの日・受けない曜日・受付期間より先は、枠を出さない", () => {
  assert.deepEqual(slots({ closedDates: new Set(["2026-11-10"]) }), []);
  // 2026-11-10 は火曜
  assert.deepEqual(slots({ rule: { ...camu, weekdays: [0, 1, 3, 4, 5, 6] } }), []);
  assert.deepEqual(slots({ date: "2027-01-28" }), camu.startTimes); // 90 日後
  assert.deepEqual(slots({ date: "2027-01-29" }), []);
});

test("開始時刻の重複や順番の乱れ、不正な時刻があっても、並べ直して一度だけ出す", () => {
  const rule = { ...camu, startTimes: ["14:00", "11:00", "11:00", "25:00", "abc"] };
  assert.deepEqual(slots({ rule }), ["11:00", "14:00"]);
});

test("埋まっている枠は「満席」として出し、選べる枠と分ける", () => {
  const busy = [{ start: jstInstant("2026-11-10", "11:00"), end: jstInstant("2026-11-10", "14:00") }];
  const day = dayAvailability({ rule: camu, durationMinutes: 180, date: "2026-11-10", now, busy, closedDates: none });
  assert.equal(day.status, "open");
  assert.deepEqual(
    day.slots.map((s) => `${s.time}:${s.status}`),
    ["11:00:booked", "11:30:booked", "12:00:booked", "12:30:booked", "13:00:booked", "13:30:booked", "14:00:available"],
  );
});

test("すべての枠が埋まった日は満席。ほかの人は選べない", () => {
  const busy = [{ start: jstInstant("2026-11-10", "10:00"), end: jstInstant("2026-11-10", "17:00") }];
  const input = { rule: camu, durationMinutes: 180, date: "2026-11-10", now, busy, closedDates: none };
  assert.equal(dayAvailability(input).status, "full");
  assert.deepEqual(slotsForDate(input), []);
});

test("休みの日と受けない曜日は closed、締切を過ぎた日と受付より先の日は null（選べない日）", () => {
  const base = { rule: camu, durationMinutes: 180, now, busy: [], closedDates: new Set(["2026-11-10"]) };
  assert.deepEqual(dayAvailability({ ...base, date: "2026-11-10" }), { status: "closed", slots: [] });
  assert.equal(dayAvailability({ ...base, date: "2026-11-11", rule: { ...camu, weekdays: [0, 1, 2, 4, 5, 6] } }).status, "closed");
  assert.equal(dayAvailability({ ...base, date: "2026-11-01" }), null);
  assert.equal(dayAvailability({ ...base, date: "2027-01-29" }), null);
});

test("締切の日は、締切を過ぎた時間を出さない（満席とは見せない）", () => {
  const day = dayAvailability({ rule: camu, durationMinutes: 180, date: "2026-11-02", now: jstInstant("2026-10-30", "13:10"), busy: [], closedDates: none });
  assert.deepEqual(day.slots.map((s) => s.time), ["13:30", "14:00"]);
});

test("月の一覧は、受付期間の中の日だけを入れる", () => {
  const month = monthAvailability({ rule: camu, durationMinutes: 180, month: "2026-11", now, busy: [], closedDates: new Set(["2026-11-15"]) });
  const days = Object.keys(month);
  assert.equal(days[0], "2026-11-02");
  assert.equal(days.includes("2026-11-01"), false);
  assert.equal(month["2026-11-15"].status, "closed");
  assert.equal(month["2026-11-16"].status, "open");
  assert.equal(days.at(-1), "2026-11-30");
  assert.equal(days.length, 29);
});

test("月の範囲は、日本時間の月初めから翌月の月初めまで", () => {
  const { from, to } = monthRange("2026-12");
  assert.equal(from.toISOString(), "2026-11-30T15:00:00.000Z");
  assert.equal(to.toISOString(), "2026-12-31T15:00:00.000Z");
});

test("月を前後に動かす（年をまたぐ）", () => {
  assert.equal(addMonths("2026-12", 1), "2027-01");
  assert.equal(addMonths("2026-01", -1), "2025-12");
});

test("カレンダーで動ける月は、今月から受付の最後の日の月まで（日本時間）", () => {
  assert.deepEqual(bookableMonths(90, jstInstant("2026-10-30", "10:00")), { first: "2026-10", last: "2027-01" });
  // UTC ではまだ 10/31 でも、日本時間で 11/1 なら 11 月から
  assert.equal(bookableMonths(90, new Date("2026-10-31T15:30:00Z")).first, "2026-11");
});

test("カレンダーのマスは日曜始まりで、月の初めの前を空ける", () => {
  const grid = monthGrid("2026-12"); // 12/1 は火曜
  assert.deepEqual(grid.slice(0, 3), [null, null, "2026-12-01"]);
  assert.equal(grid.length, 2 + 31);
});
