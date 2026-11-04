import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { BOOKING_SELECT } from "./reserve";
import { ORDER_SELECT } from "./shop";
import type { BookingWithNames, ClosedDateRow, OrderWithItems } from "./types";

/** 管理画面の一覧の読み出し */

export type BookingView = "upcoming" | "past" | "cancelled";

export async function listBookings(view: BookingView, now = new Date()): Promise<BookingWithNames[]> {
  let query = supabaseAdmin().from("bookings").select(BOOKING_SELECT);
  if (view === "upcoming") {
    query = query.eq("status", "confirmed").gte("ends_at", now.toISOString()).order("starts_at").limit(300);
  } else if (view === "past") {
    query = query.eq("status", "confirmed").lt("ends_at", now.toISOString()).order("starts_at", { ascending: false }).limit(200);
  } else {
    query = query.eq("status", "cancelled").order("cancelled_at", { ascending: false }).limit(200);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data as BookingWithNames[];
}

export type OrderView = "open" | "shipped" | "cancelled";

export async function listOrders(view: OrderView): Promise<OrderWithItems[]> {
  const status = view === "open" ? "paid" : view;
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select(ORDER_SELECT)
    .eq("status", status)
    .order("needs_attention", { ascending: false })
    .order("paid_at", { ascending: view === "open" })
    .limit(300);
  if (error) throw error;
  return data as OrderWithItems[];
}

export async function countOpenOrders(): Promise<number> {
  const { count, error } = await supabaseAdmin().from("orders").select("id", { count: "exact", head: true }).eq("status", "paid");
  if (error) throw error;
  return count ?? 0;
}

export async function listClosedDates(fromDate: string): Promise<ClosedDateRow[]> {
  const { data, error } = await supabaseAdmin().from("closed_dates").select("*").gte("date", fromDate).order("date");
  if (error) throw error;
  return data as ClosedDateRow[];
}
