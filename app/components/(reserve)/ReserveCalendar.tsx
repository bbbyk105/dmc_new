"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthGrid } from "@/lib/reserve/schedule";
import { formatDateString } from "@/lib/reserve/format";
import type { ReserveCopy } from "./copy";
import type { DayStatus } from "./types";

type Props = {
  copy: ReserveCopy["calendar"];
  locale: string;
  month: string;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  days: Record<string, DayStatus>;
  loading: boolean;
  error: boolean;
  selectedDate: string | null;
  selectedTime: string | null;
  onSelectDate: (date: string) => void;
  onSelectTime: (time: string) => void;
};

/** 日付の下の印。色は使わず、墨の濃淡と記号で見分ける（● 空きあり・× 満席・休） */
function DayMark({ status, selected }: { status: DayStatus["status"]; selected: boolean }) {
  if (status === "open") {
    return <span aria-hidden="true" className={`mt-1 h-1.5 w-1.5 rounded-full ${selected ? "bg-background" : "bg-text"}`} />;
  }
  return (
    <span aria-hidden="true" className="mt-0.5 text-[10px] leading-none text-text-muted">
      {status === "full" ? "×" : "休"}
    </span>
  );
}

/**
 * 日時の選択。左に月のカレンダー（空きあり・満席・休み）、右にその日の時間の一覧（予約可・満席）。
 * 埋まった時間は「満席」で見せて、押せないようにする
 */
export default function ReserveCalendar(props: Props) {
  const { copy, locale, month, days, selectedDate, selectedTime } = props;
  const [year, monthNumber] = month.split("-").map(Number);
  const selectedDay = selectedDate ? days[selectedDate] : undefined;

  const dayLabel = (date: string, status?: DayStatus["status"]) => {
    const label = formatDateString(date, locale);
    if (!status) return label;
    const state = status === "open" ? copy.legendOpen : status === "full" ? copy.legendFull : copy.legendClosed;
    return `${label} ${state}`;
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      {/* 月のカレンダー */}
      <div className="border border-border bg-surface p-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={props.onPrev}
            disabled={!props.canGoPrev}
            aria-label={copy.prev}
            className="p-2 text-text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-serif text-xl tracking-wide text-text" aria-live="polite">
            {copy.month(year, monthNumber)}
          </h3>
          <button
            type="button"
            onClick={props.onNext}
            disabled={!props.canGoNext}
            aria-label={copy.next}
            className="p-2 text-text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {props.loading && <p className="mb-2 text-xs text-text-muted">{copy.loading}</p>}
        {props.error && <p className="mb-2 text-xs text-text">{copy.error}</p>}

        <div className="mb-2 grid grid-cols-7">
          {copy.weekdays.map((w) => (
            <div key={w} className="py-2 text-center text-xs font-medium text-text-muted">
              {w}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {monthGrid(month).map((date, i) => {
            if (!date) return <div key={`blank-${i}`} />;
            const day = days[date];
            const selectable = day?.status === "open";
            const selected = date === selectedDate;
            return (
              <button
                key={date}
                type="button"
                disabled={!selectable}
                onClick={() => props.onSelectDate(date)}
                aria-pressed={selected}
                aria-label={dayLabel(date, day?.status)}
                className={`flex aspect-square flex-col items-center justify-center text-sm transition-colors ${
                  selected
                    ? "bg-text text-background"
                    : selectable
                      ? "text-text hover:bg-border/60"
                      : "cursor-not-allowed text-text-muted/50"
                }`}
              >
                <span>{Number(date.slice(8))}</span>
                {day && <DayMark status={day.status} selected={selected} />}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-5 border-t border-border pt-4 text-xs text-text-muted">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-text" aria-hidden="true" />
            {copy.legendOpen}
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true">×</span>
            {copy.legendFull}
          </span>
          <span className="flex items-center gap-2">
            <span aria-hidden="true">休</span>
            {copy.legendClosed}
          </span>
        </div>
      </div>

      {/* その日の時間の一覧 */}
      <div className="border border-border bg-surface p-6">
        <h3 className="mb-6 font-serif text-xl tracking-wide text-text">
          {selectedDate ? copy.slotsTitle(formatDateString(selectedDate, locale)) : copy.slotsHeading}
        </h3>
        {!selectedDate || !selectedDay ? (
          <p className="flex min-h-48 items-center justify-center text-sm text-text-muted">{copy.noDate}</p>
        ) : selectedDay.status !== "open" ? (
          <p className="flex min-h-48 items-center justify-center text-center text-sm text-text-muted">
            {selectedDay.status === "closed" ? copy.closed : copy.full}
          </p>
        ) : (
          <div className="space-y-2" role="group" aria-label={copy.slotsTitle(formatDateString(selectedDate, locale))}>
            {selectedDay.slots.map((slot) => {
              const booked = slot.status === "booked";
              const selected = slot.time === selectedTime;
              return (
                <button
                  key={slot.time}
                  type="button"
                  disabled={booked}
                  onClick={() => props.onSelectTime(slot.time)}
                  aria-pressed={selected}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                    selected
                      ? "bg-text text-background"
                      : booked
                        ? "cursor-not-allowed bg-background text-text-muted/60"
                        : "bg-background text-text hover:bg-border/60"
                  }`}
                >
                  <span className={`font-medium tabular-nums ${booked ? "line-through" : ""}`}>{slot.time}</span>
                  <span className={`flex items-center gap-2 text-xs ${selected ? "text-background/80" : "text-text-muted"}`}>
                    {booked ? (
                      <span aria-hidden="true">×</span>
                    ) : (
                      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-background" : "bg-text"}`} />
                    )}
                    {booked ? copy.booked : copy.available}
                  </span>
                </button>
              );
            })}
          </div>
        )}
        {selectedDate && selectedTime && (
          <p className="mt-6 border-t border-border pt-4 text-sm text-text">
            {copy.selected(`${formatDateString(selectedDate, locale)} ${selectedTime}`)}
          </p>
        )}
      </div>
    </div>
  );
}
