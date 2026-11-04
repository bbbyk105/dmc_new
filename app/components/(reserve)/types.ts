/** 予約の画面に渡すサービス（ロケールに合わせた名前にしてから渡す） */
export type ReserveOption = {
  id: string;
  name: string;
  summary: string;
  durationMinutes: number;
  price: number;
  extraPersonPrice: number;
  maxPeople: number;
};

export type ReserveService = {
  id: string;
  name: string;
  summary: string;
  leadHours: number;
  maxAdvanceDays: number;
  options: ReserveOption[];
};

/** /api/reserve/availability の days（lib/reserve/schedule.ts の DayAvailability と同じ形） */
export type DayStatus =
  | { status: "open" | "full"; slots: { time: string; status: "available" | "booked" }[] }
  | { status: "closed"; slots: [] };
