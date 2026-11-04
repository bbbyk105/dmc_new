import "server-only";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { OrderWithItems, ProductRow, ShopSettingsRow } from "./types";

export const ORDER_SELECT = "*, order_items(*)";

/** ショップに出す商品（公開中のもの） */
export async function getActiveProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*")
    .eq("active", true)
    .order("sort")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ProductRow[];
}

export async function getAllProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabaseAdmin()
    .from("products")
    .select("*")
    .order("sort")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as ProductRow[];
}

export async function getProductBySlug(slug: string, opts: { includeInactive?: boolean } = {}): Promise<ProductRow | null> {
  let query = supabaseAdmin().from("products").select("*").eq("slug", slug);
  if (!opts.includeInactive) query = query.eq("active", true);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return data as ProductRow | null;
}

export async function getProduct(id: string): Promise<ProductRow | null> {
  const { data, error } = await supabaseAdmin().from("products").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data as ProductRow | null;
}

export async function getShopSettings(): Promise<ShopSettingsRow> {
  const { data, error } = await supabaseAdmin().from("shop_settings").select("*").eq("id", true).single();
  if (error) throw error;
  return data as ShopSettingsRow;
}

export async function getOrder(id: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabaseAdmin().from("orders").select(ORDER_SELECT).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as OrderWithItems | null;
}

export async function getOrderBySession(sessionId: string): Promise<OrderWithItems | null> {
  const { data, error } = await supabaseAdmin()
    .from("orders")
    .select(ORDER_SELECT)
    .eq("stripe_session_id", sessionId)
    .maybeSingle();
  if (error) throw error;
  return data as OrderWithItems | null;
}
