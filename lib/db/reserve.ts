import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  addDays,
  jstDateString,
  monthAvailability,
  monthRange,
  slotsForDate,
  type BusyRange,
  type DayAvailability,
  type ServiceRule,
} from "@/lib/reserve/schedule";
import type {
  BookingRow,
  BookingWithNames,
  ServiceOptionRow,
  ServiceWithOptions,
} from "./types";

const SERVICE_SELECT = "*, service_options(*)";
export const BOOKING_SELECT = "*, services(name_ja, name_en), service_options(name_ja, name_en, duration_minutes)";

function sortOptions(service: ServiceWithOptions, includeInactive: boolean): ServiceWithOptions {
  return {
    ...service,
    service_options: service.service_options
      .filter((o) => includeInactive || o.active)
      .sort((a, b) => a.sort - b.sort),
  };
}

/** 予約のページに出すサービス（受付中のものと、受付中のプラン） */
export async function getActiveServices(): Promise<ServiceWithOptions[]> {
  const { data, error } = await supabaseAdmin()
    .from("services")
    .select(SERVICE_SELECT)
    .eq("active", true)
    .order("sort");
  if (error) throw error;
  return (data as ServiceWithOptions[])
    .map((s) => sortOptions(s, false))
    .filter((s) => s.service_options.length > 0);
}

/** 管理画面用。止めているサービス・プランも出す */
export async function getAllServices(): Promise<ServiceWithOptions[]> {
  const { data, error } = await supabaseAdmin().from("services").select(SERVICE_SELECT).order("sort");
  if (error) throw error;
  return (data as ServiceWithOptions[]).map((s) => sortOptions(s, true));
}

export async function getService(id: string, opts: { includeInactive?: boolean } = {}): Promise<ServiceWithOptions | null> {
  let query = supabaseAdmin().from("services").select(SERVICE_SELECT).eq("id", id);
  if (!opts.includeInactive) query = query.eq("active", true);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data ? sortOptions(data as ServiceWithOptions, !!opts.includeInactive) : null;
}

export function ruleOf(service: ServiceWithOptions): ServiceRule {
  return {
    startTimes: service.start_times,
    closesAt: service.closes_at,
    weekdays: service.weekdays,
    leadHours: service.lead_hours,
    maxAdvanceDays: service.max_advance_days,
  };
}

/**
 * 埋まっている時間。確定の予約と、まだ期限内の仮押さえ（支払い中）。
 * exceptBookingId は、予約の変更のときに自分自身を外すため
 */
export async function getBusyRanges(
  resource: string,
  from: Date,
  to: Date,
  exceptBookingId?: string,
): Promise<BusyRange[]> {
  let query = supabaseAdmin()
    .from("bookings")
    .select("id, starts_at, ends_at")
    .eq("resource", resource)
    .lt("starts_at", to.toISOString())
    .gt("ends_at", from.toISOString())
    .or(`status.eq.confirmed,and(status.eq.pending,hold_expires_at.gt.${new Date().toISOString()})`);
  if (exceptBookingId) query = query.neq("id", exceptBookingId);
  const { data, error } = await query;
  if (error) throw error;
  return (data as Pick<BookingRow, "starts_at" | "ends_at">[]).map((b) => ({
    start: new Date(b.starts_at),
    end: new Date(b.ends_at),
  }));
}

/** 休みの日（そのサービスの resource の休みと、全部の休み） */
export async function getClosedDates(resource: string, fromDate: string, toDate: string): Promise<Set<string>> {
  const { data, error } = await supabaseAdmin()
    .from("closed_dates")
    .select("date")
    .gte("date", fromDate)
    .lte("date", toDate)
    .or(`resource.is.null,resource.eq.${resource}`);
  if (error) throw error;
  return new Set((data as { date: string }[]).map((d) => d.date));
}

/** 月の、日ごとの状態（空きあり・満席・休み）と時間の枠 */
export async function getMonthAvailability(
  service: ServiceWithOptions,
  option: ServiceOptionRow,
  month: string,
  now = new Date(),
): Promise<Record<string, DayAvailability>> {
  const { from, to } = monthRange(month);
  const [busy, closedDates] = await Promise.all([
    getBusyRanges(service.resource, from, to),
    getClosedDates(service.resource, jstDateString(from), addDays(jstDateString(to), -1)),
  ]);
  return monthAvailability({
    rule: ruleOf(service),
    durationMinutes: option.duration_minutes,
    month,
    now,
    busy,
    closedDates,
  });
}

/**
 * その日のその時刻が、いま予約できるか。
 * ignoreLead は管理画面で予約を入れる・変えるとき（締切を過ぎた直前の電話予約も入れられるように。過ぎた時刻は入れない）
 */
export async function isSlotAvailable(input: {
  service: ServiceWithOptions;
  option: ServiceOptionRow;
  date: string;
  time: string;
  exceptBookingId?: string;
  ignoreLead?: boolean;
  now?: Date;
}): Promise<boolean> {
  const { service, option, date, time } = input;
  const from = new Date(`${date}T00:00:00+09:00`);
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  const [busy, closedDates] = await Promise.all([
    getBusyRanges(service.resource, from, to, input.exceptBookingId),
    getClosedDates(service.resource, date, date),
  ]);
  const rule = ruleOf(service);
  const slots = slotsForDate({
    rule: input.ignoreLead ? { ...rule, leadHours: 0 } : rule,
    durationMinutes: option.duration_minutes,
    date,
    now: input.now ?? new Date(),
    busy,
    closedDates,
  });
  return slots.includes(time);
}

export async function getBookingBySession(sessionId: string): Promise<BookingWithNames | null> {
  const { data, error } = await supabaseAdmin()
    .from("bookings")
    .select(BOOKING_SELECT)
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data as BookingWithNames | null;
}

export async function getBooking(id: string): Promise<BookingWithNames | null> {
  const { data, error } = await supabaseAdmin().from("bookings").select(BOOKING_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as BookingWithNames | null;
}
