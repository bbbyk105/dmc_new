import { createClient } from "@supabase/supabase-js";
import { addDays, jstDateString, jstInstant, weekdayOf } from "../../lib/reserve/schedule.ts";

/** Supabase のエラーを、中身の読める Error にする（そのまま投げると [object Object] と出る） */
function raise(error: { message: string; code?: string }): never {
  throw new Error(`Supabase: ${error.code ?? ""} ${error.message}`);
}

/**
 * E2E のテストが、手元の Supabase に予約を作って片付けるための道具。
 * 鍵は e2e.config.ts が .env.development.local から読み込んでいる
 */
export function db() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が要ります（supabase start と .env.development.local）");
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function optionId(serviceId: string, nameEn?: string): Promise<string> {
  let query = db().from("service_options").select("id").eq("service_id", serviceId);
  if (nameEn) query = query.eq("name_en", nameEn);
  const { data, error } = await query.limit(1).single();
  if (error) raise(error);
  return (data as { id: string }).id;
}

/**
 * from 日後から、その resource の予約も休みも無く、予約を受ける曜日（水曜の定休日などを除く）の日を探す
 * （手で確かめたときの予約と重ならないように）。締切（72 時間前）より先で、受付（90 日先まで）の中の日を返す。
 * テストのファイルは並んで動くので、ファイルごとに from をずらして同じ日を取り合わないようにする
 */
export async function freeDate(resource: string, from = 10): Promise<string> {
  const today = jstDateString(new Date());
  const { data: services, error } = await db().from("services").select("weekdays").eq("resource", resource);
  if (error) raise(error);
  // その resource のどのサービスでも予約を受ける曜日
  const open = [0, 1, 2, 3, 4, 5, 6].filter((d) => (services as { weekdays: number[] }[]).every((s) => s.weekdays.includes(d)));
  for (let offset = from; offset < 85; offset++) {
    const date = addDays(today, offset);
    if (!open.includes(weekdayOf(date))) continue;
    const start = jstInstant(date, "00:00").toISOString();
    const end = jstInstant(addDays(date, 1), "00:00").toISOString();
    const [{ count: bookings }, { count: closed }] = await Promise.all([
      db().from("bookings").select("id", { count: "exact", head: true }).eq("resource", resource).lt("starts_at", end).gt("ends_at", start).in("status", ["pending", "confirmed"]),
      db().from("closed_dates").select("id", { count: "exact", head: true }).eq("date", date),
    ]);
    if (!bookings && !closed) return date;
  }
  throw new Error("空いている日が見つかりません");
}

/** 確定した予約を 1 件入れる（お店が電話で受けた予約と同じ形） */
export async function insertBooking(input: {
  serviceId: string;
  optionId: string;
  resource: string;
  date: string;
  time: string;
  minutes: number;
  status?: "pending" | "confirmed";
  stripeSessionId?: string;
  email?: string;
}): Promise<{ id: string; code: string }> {
  const start = jstInstant(input.date, input.time);
  const code = `R-E2E${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const { data, error } = await db()
    .from("bookings")
    .insert({
      code,
      service_id: input.serviceId,
      option_id: input.optionId,
      resource: input.resource,
      starts_at: start.toISOString(),
      ends_at: new Date(start.getTime() + input.minutes * 60 * 1000).toISOString(),
      people: 1,
      amount: 5000,
      status: input.status ?? "confirmed",
      hold_expires_at: input.status === "pending" ? new Date(Date.now() + 30 * 60 * 1000).toISOString() : null,
      stripe_session_id: input.stripeSessionId ?? null,
      customer_name: "E2E テスト",
      customer_email: input.email ?? "",
      source: input.stripeSessionId ? "web" : "admin",
    })
    .select("id, code")
    .single();
  if (error) raise(error);
  return data as { id: string; code: string };
}

export async function bookingStatus(id: string): Promise<string> {
  const { data, error } = await db().from("bookings").select("status").eq("id", id).single();
  if (error) raise(error);
  return (data as { status: string }).status;
}

/** テストで作った予約を消す */
export async function removeBookings(ids: string[]) {
  if (ids.length === 0) return;
  const { error } = await db().from("bookings").delete().in("id", ids);
  if (error) raise(error);
}
