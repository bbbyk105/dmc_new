/**
 * データベースの行の型（supabase/migrations/20261031000000_reserve_and_shop.sql と同じ）。
 * 列を足したらここにも足す。
 */

export type ServiceRow = {
  id: string;
  name_ja: string;
  name_en: string;
  summary_ja: string;
  summary_en: string;
  resource: string;
  start_times: string[];
  closes_at: string;
  weekdays: number[];
  lead_hours: number;
  max_advance_days: number;
  sort: number;
  active: boolean;
};

export type ServiceOptionRow = {
  id: string;
  service_id: string;
  name_ja: string;
  name_en: string;
  summary_ja: string;
  summary_en: string;
  duration_minutes: number;
  price: number;
  extra_person_price: number;
  max_people: number;
  sort: number;
  active: boolean;
};

export type ServiceWithOptions = ServiceRow & { service_options: ServiceOptionRow[] };

export type ClosedDateRow = {
  id: number;
  date: string;
  resource: string | null;
  note: string;
  created_at: string;
};

export type BookingStatus = "pending" | "confirmed" | "cancelled" | "expired";

export type BookingRow = {
  id: string;
  code: string;
  service_id: string;
  option_id: string;
  resource: string;
  starts_at: string;
  ends_at: string;
  people: number;
  amount: number;
  status: BookingStatus;
  hold_expires_at: string | null;
  release_token: string | null;
  client_key: string | null;
  source: "web" | "admin";
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_note: string;
  locale: "ja" | "en";
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  cancellation_fee: number | null;
  refunded_amount: number;
  change_count: number;
  admin_note: string;
  cancel_reason: "conflict" | "admin" | null;
  created_at: string;
  confirmed_at: string | null;
  cancelled_at: string | null;
};

export type BookingWithNames = BookingRow & {
  services: Pick<ServiceRow, "name_ja" | "name_en"> | null;
  service_options: Pick<ServiceOptionRow, "name_ja" | "name_en" | "duration_minutes"> | null;
};

export type ProductRow = {
  id: string;
  slug: string;
  name_ja: string;
  name_en: string;
  description_ja: string;
  description_en: string;
  price: number;
  stock: number;
  images: string[];
  active: boolean;
  sort: number;
  created_at: string;
  updated_at: string;
};

export type ShopSettingsRow = {
  id: true;
  shipping_fee: number;
  free_shipping_threshold: number | null;
  /** オーストラリア（英語のページ）への一律の送料 */
  overseas_shipping_fee: number;
  delivery_note_ja: string;
  delivery_note_en: string;
  updated_at: string;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled" | "expired";

export type OrderRow = {
  id: string;
  code: string;
  status: OrderStatus;
  hold_expires_at: string | null;
  release_token: string | null;
  client_key: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  locale: "ja" | "en";
  customer_email: string;
  customer_name: string;
  customer_phone: string;
  shipping_name: string;
  shipping_postal_code: string;
  shipping_address: string;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  refunded_amount: number;
  stock_reserved: boolean;
  /** オーストラリアへの発送（英語のページからの注文。一律の海外送料をいただいている） */
  overseas: boolean;
  tracking_number: string;
  needs_attention: boolean;
  admin_note: string;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  cancelled_at: string | null;
};

export type OrderItemRow = {
  id: number;
  order_id: string;
  product_id: string;
  name_ja: string;
  name_en: string;
  unit_price: number;
  quantity: number;
};

export type OrderWithItems = OrderRow & { order_items: OrderItemRow[] };
