import "server-only";
import { randomUUID } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { stripe } from "@/lib/stripe";
import { getBooking, getService, isSlotAvailable } from "@/lib/db/reserve";
import { getOrder } from "@/lib/db/shop";
import { jstInstant, isDateString, isTimeString } from "@/lib/reserve/schedule";
import { bookingAmount, cancellationFee } from "@/lib/reserve/pricing";
import { isEmail, isUuid } from "@/lib/reserve/validate";
import { newCode } from "@/lib/checkout/ids";
import { toShopPhoto } from "@/lib/shop/photo";
import {
  sendBookingCancelled,
  sendBookingRescheduled,
  sendOrderCancelled,
  sendOrderShipped,
} from "@/lib/mail/notify";

/** 管理画面の操作の結果。失敗の message はそのまま画面に出す */
export type OpResult = { ok: true } | { ok: false; message: string };

const EXCLUSION_VIOLATION = "23P01";

function fail(message: string): OpResult {
  return { ok: false, message };
}

// ---------------------------------------------------------------------------
// 予約
// ---------------------------------------------------------------------------

/**
 * 予約を取り消す。キャンセルポリシーどおりのキャンセル料を差し引いて Stripe で返金する。
 * waiveFee はお店の都合（天候など）で全額返すとき。お店が登録した予約（カード払いでない）は取り消すだけ
 */
export async function cancelBooking(id: string, opts: { waiveFee: boolean; now?: Date }): Promise<OpResult> {
  const booking = await getBooking(id);
  if (!booking) return fail("予約が見つかりません");
  if (booking.status !== "confirmed") return fail("確定している予約だけ取り消せます");

  const fee = opts.waiveFee ? 0 : cancellationFee(booking.amount, new Date(booking.starts_at), opts.now ?? new Date());
  const refund = booking.stripe_payment_intent_id ? Math.max(0, booking.amount - fee - booking.refunded_amount) : 0;

  if (refund > 0) {
    try {
      await stripe().refunds.create(
        { payment_intent: booking.stripe_payment_intent_id!, amount: refund },
        { idempotencyKey: `booking-cancel-${booking.id}-${refund}` },
      );
    } catch (error) {
      console.error("[admin] 返金に失敗", booking.code, error);
      return fail("Stripe で返金できませんでした。時間をおいてもう一度お試しください");
    }
  }

  // 確定している予約にだけ一度効く（二度押し・二人で同時に押しても、記録とメールは一度）
  const { data: changed, error } = await supabaseAdmin().rpc("cancel_booking", {
    p_booking_id: booking.id,
    p_fee: booking.stripe_payment_intent_id ? fee : 0,
    p_refund: refund,
    p_reason: "admin",
  });
  if (error) throw error;
  if (!changed) return fail("この予約はもう取り消されています");

  if (booking.customer_email) await sendBookingCancelled({ ...booking, status: "cancelled" }, refund);
  return { ok: true };
}

/** 予約の日時を変える（締切は見ない。ほかの予約と重なる時間には変えられない） */
export async function rescheduleBooking(id: string, date: string, time: string): Promise<OpResult> {
  if (!isDateString(date) || !isTimeString(time)) return fail("日付と時刻を正しく入れてください");
  const booking = await getBooking(id);
  if (!booking) return fail("予約が見つかりません");
  if (booking.status !== "confirmed") return fail("確定している予約だけ変更できます");

  const service = await getService(booking.service_id, { includeInactive: true });
  const option = service?.service_options.find((o) => o.id === booking.option_id);
  if (!service || !option) return fail("サービスが見つかりません");

  const startsAt = jstInstant(date, time);
  if (startsAt.getTime() < Date.now()) return fail("過ぎた日時には変更できません");
  const available = await isSlotAvailable({ service, option, date, time, exceptBookingId: booking.id, ignoreLead: true });
  if (!available) return fail("その時間はほかの予約と重なっているか、受付の時間外です");

  const endsAt = new Date(startsAt.getTime() + option.duration_minutes * 60 * 1000);
  // 確定している予約だけを動かす（同時に取り消されていたら変えない）
  const { data: moved, error } = await supabaseAdmin()
    .from("bookings")
    .update({
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      change_count: booking.change_count + 1,
    })
    .eq("id", booking.id)
    .eq("status", "confirmed")
    .select("id");
  if (error?.code === EXCLUSION_VIOLATION) return fail("その時間はほかの予約と重なっています");
  if (error) throw error;
  if (!moved?.length) return fail("この予約はもう取り消されています");

  const updated = await getBooking(booking.id);
  if (updated?.customer_email) await sendBookingRescheduled(updated);
  return { ok: true };
}

/** お店が電話などで受けた予約を登録する（支払いは当日。ほかの予約と重なる時間には入れられない） */
export async function createAdminBooking(input: {
  serviceId: string;
  optionId: string;
  date: string;
  time: string;
  people: number;
  name: string;
  phone: string;
  email: string;
  note: string;
  /** お客さまに送るメールの言語 */
  locale: "ja" | "en";
}): Promise<OpResult & { id?: string }> {
  if (!isDateString(input.date) || !isTimeString(input.time)) return fail("日付と時刻を正しく入れてください");
  if (!isUuid(input.optionId)) return fail("プランを選んでください");
  if (!input.name.trim()) return fail("お名前を入れてください");
  if (input.email && !isEmail(input.email)) return fail("メールアドレスが正しくありません");

  const service = await getService(input.serviceId, { includeInactive: true });
  const option = service?.service_options.find((o) => o.id === input.optionId);
  if (!service || !option) return fail("サービスとプランを選んでください");
  if (!Number.isInteger(input.people) || input.people < 1 || input.people > option.max_people) {
    return fail(`人数は 1〜${option.max_people} 名で入れてください`);
  }

  const startsAt = jstInstant(input.date, input.time);
  if (startsAt.getTime() < Date.now()) return fail("過ぎた日時には登録できません");
  const available = await isSlotAvailable({ service, option, date: input.date, time: input.time, ignoreLead: true });
  if (!available) return fail("その時間はほかの予約と重なっているか、受付の時間外です");

  const { data, error } = await supabaseAdmin()
    .from("bookings")
    .insert({
      code: newCode("R"),
      service_id: service.id,
      option_id: option.id,
      resource: service.resource,
      starts_at: startsAt.toISOString(),
      ends_at: new Date(startsAt.getTime() + option.duration_minutes * 60 * 1000).toISOString(),
      people: input.people,
      amount: bookingAmount(option.price, option.extra_person_price, input.people),
      status: "confirmed",
      source: "admin",
      confirmed_at: new Date().toISOString(),
      customer_name: input.name.trim(),
      customer_phone: input.phone.trim(),
      customer_email: input.email.trim(),
      customer_note: input.note.trim(),
      locale: input.locale,
    })
    .select("id")
    .single();
  if (error?.code === EXCLUSION_VIOLATION) return fail("その時間はほかの予約と重なっています");
  if (error) throw error;
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateBookingNote(id: string, note: string): Promise<OpResult> {
  const { error } = await supabaseAdmin().from("bookings").update({ admin_note: note.slice(0, 2000) }).eq("id", id);
  if (error) throw error;
  return { ok: true };
}

// ---------------------------------------------------------------------------
// 受付の設定
// ---------------------------------------------------------------------------

export async function addClosedDate(date: string, resource: string | null, note: string): Promise<OpResult> {
  if (!isDateString(date)) return fail("日付を正しく入れてください");
  const { error } = await supabaseAdmin().from("closed_dates").insert({ date, resource, note: note.slice(0, 200) });
  if (error?.code === "23505") return fail("その日はもう休みに登録されています");
  if (error) throw error;
  return { ok: true };
}

export async function removeClosedDate(id: number): Promise<OpResult> {
  const { error } = await supabaseAdmin().from("closed_dates").delete().eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function updateService(
  id: string,
  input: { startTimes: string[]; closesAt: string; weekdays: number[]; leadHours: number; maxAdvanceDays: number; active: boolean },
): Promise<OpResult> {
  if (!input.startTimes.every(isTimeString)) return fail("開始時刻は 11:00 のように入れてください");
  if (!isTimeString(input.closesAt)) return fail("終了の時刻は 17:00 のように入れてください");
  if (!Number.isInteger(input.leadHours) || input.leadHours < 0) return fail("締切は 0 以上の時間で入れてください");
  if (!Number.isInteger(input.maxAdvanceDays) || input.maxAdvanceDays < 1) return fail("受付の日数は 1 以上で入れてください");
  const { error } = await supabaseAdmin()
    .from("services")
    .update({
      start_times: [...new Set(input.startTimes)].sort(),
      closes_at: input.closesAt,
      weekdays: [...new Set(input.weekdays)].filter((d) => d >= 0 && d <= 6).sort(),
      lead_hours: input.leadHours,
      max_advance_days: input.maxAdvanceDays,
      active: input.active,
    })
    .eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function updateServiceOption(
  id: string,
  input: { nameJa: string; nameEn: string; durationMinutes: number; price: number; extraPersonPrice: number; maxPeople: number; active: boolean },
): Promise<OpResult> {
  if (!input.nameJa.trim() || !input.nameEn.trim()) return fail("プランの名前を入れてください");
  if (!Number.isInteger(input.durationMinutes) || input.durationMinutes < 15) return fail("時間は 15 分以上で入れてください");
  if (!Number.isInteger(input.price) || input.price < 50) return fail("料金は 50 円以上で入れてください（Stripe の最低額）");
  if (!Number.isInteger(input.extraPersonPrice) || input.extraPersonPrice < 0) return fail("追加の料金は 0 円以上で入れてください");
  if (!Number.isInteger(input.maxPeople) || input.maxPeople < 1 || input.maxPeople > 50) return fail("人数の上限は 1〜50 で入れてください");
  const { error } = await supabaseAdmin()
    .from("service_options")
    .update({
      name_ja: input.nameJa.trim(),
      name_en: input.nameEn.trim(),
      duration_minutes: input.durationMinutes,
      price: input.price,
      extra_person_price: input.extraPersonPrice,
      max_people: input.maxPeople,
      active: input.active,
    })
    .eq("id", id);
  if (error) throw error;
  return { ok: true };
}

// ---------------------------------------------------------------------------
// 注文
// ---------------------------------------------------------------------------

export async function markOrderShipped(id: string, trackingNumber: string): Promise<OpResult> {
  const order = await getOrder(id);
  if (!order) return fail("注文が見つかりません");
  if (order.status !== "paid") return fail("支払い済みの注文だけ発送済みにできます");
  const { error } = await supabaseAdmin()
    .from("orders")
    .update({ status: "shipped", shipped_at: new Date().toISOString(), tracking_number: trackingNumber.trim().slice(0, 100) })
    .eq("id", id)
    .eq("status", "paid");
  if (error) throw error;
  const updated = await getOrder(id);
  if (updated) await sendOrderShipped(updated);
  return { ok: true };
}

/** 注文を取り消して全額を返金する。発送前なら在庫を戻す */
export async function cancelOrder(id: string): Promise<OpResult> {
  const order = await getOrder(id);
  if (!order) return fail("注文が見つかりません");
  if (order.status !== "paid" && order.status !== "shipped") return fail("支払い済み・発送済みの注文だけ取り消せます");

  const refund = Math.max(0, order.total - order.refunded_amount);
  if (refund > 0 && order.stripe_payment_intent_id) {
    try {
      await stripe().refunds.create(
        { payment_intent: order.stripe_payment_intent_id, amount: refund },
        { idempotencyKey: `order-cancel-${order.id}-${refund}` },
      );
    } catch (error) {
      console.error("[admin] 返金に失敗", order.code, error);
      return fail("Stripe で返金できませんでした。時間をおいてもう一度お試しください");
    }
  }

  // 一度だけ効き、発送前なら押さえた在庫だけを戻す（データベースの cancel_order）
  const { data: changed, error } = await supabaseAdmin().rpc("cancel_order", { p_order_id: id, p_refund: refund });
  if (error) throw error;
  if (!changed) return fail("この注文はもう取り消されています");
  await sendOrderCancelled({ ...order, status: "cancelled" }, refund);
  return { ok: true };
}

export async function updateOrderNote(id: string, note: string, needsAttention: boolean): Promise<OpResult> {
  const { error } = await supabaseAdmin()
    .from("orders")
    .update({ admin_note: note.slice(0, 2000), needs_attention: needsAttention })
    .eq("id", id);
  if (error) throw error;
  return { ok: true };
}

// ---------------------------------------------------------------------------
// 商品・ショップの設定
// ---------------------------------------------------------------------------

export type ProductInput = {
  slug: string;
  nameJa: string;
  nameEn: string;
  descriptionJa: string;
  descriptionEn: string;
  price: number;
  stock: number;
  sort: number;
  active: boolean;
};

function checkProduct(input: ProductInput): string | null {
  if (!/^[a-z0-9-]{1,80}$/.test(input.slug)) return "URL の名前は半角英小文字・数字・ハイフンで入れてください（例: kimono-hadagi）";
  if (!input.nameJa.trim()) return "商品名を入れてください";
  if (!Number.isInteger(input.price) || input.price < 50) return "値段は 50 円以上で入れてください（Stripe の最低額）";
  if (!Number.isInteger(input.stock) || input.stock < 0) return "在庫は 0 以上で入れてください";
  return null;
}

function productRow(input: ProductInput) {
  return {
    slug: input.slug,
    name_ja: input.nameJa.trim(),
    name_en: input.nameEn.trim(),
    description_ja: input.descriptionJa.trim(),
    description_en: input.descriptionEn.trim(),
    price: input.price,
    stock: input.stock,
    sort: input.sort,
    active: input.active,
    updated_at: new Date().toISOString(),
  };
}

export async function createProduct(input: ProductInput): Promise<OpResult & { id?: string }> {
  const problem = checkProduct(input);
  if (problem) return fail(problem);
  const { data, error } = await supabaseAdmin().from("products").insert(productRow(input)).select("id").single();
  if (error?.code === "23505") return fail("その URL の名前はほかの商品で使われています");
  if (error) throw error;
  return { ok: true, id: (data as { id: string }).id };
}

export async function updateProduct(id: string, input: ProductInput): Promise<OpResult> {
  const problem = checkProduct(input);
  if (problem) return fail(problem);
  const { error } = await supabaseAdmin().from("products").update(productRow(input)).eq("id", id);
  if (error?.code === "23505") return fail("その URL の名前はほかの商品で使われています");
  if (error) throw error;
  return { ok: true };
}

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/**
 * 商品の写真を上げる URL を発行する（Storage の shop-images/<商品ID>/）。
 * 写真はブラウザから Storage へ直接上げる（Vercel の関数はリクエストが 4.5MB までで、スマホの写真が通らないため）
 */
export async function createProductImageUpload(
  id: string,
  contentType: string,
  size: number,
): Promise<{ ok: true; signedUrl: string; path: string } | { ok: false; message: string }> {
  const ext = IMAGE_TYPES[contentType];
  if (!ext) return { ok: false, message: "写真は JPEG・PNG・WebP・AVIF で上げてください" };
  if (!Number.isFinite(size) || size <= 0 || size > 10 * 1024 * 1024) return { ok: false, message: "写真は 10MB までです" };
  if (!isUuid(id)) return { ok: false, message: "商品が見つかりません" };
  const path = `${id}/${randomUUID()}.${ext}`;
  const { data, error } = await supabaseAdmin().storage.from("shop-images").createSignedUploadUrl(path);
  if (error) throw error;
  return { ok: true, signedUrl: data.signedUrl, path: data.path };
}

/**
 * 上がった写真を商品に付ける。背景をページの生成りになじませた正方形（lib/shop/photo.ts）に作り直してから付け、
 * ブラウザから上がった元の写真は消す
 */
export async function attachProductImage(id: string, uploadedPath: string): Promise<OpResult> {
  if (!isUuid(id) || !uploadedPath.startsWith(`${id}/`) || uploadedPath.includes("..")) return fail("写真の場所が正しくありません");
  const bucket = supabaseAdmin().storage.from("shop-images");
  const { data: uploaded, error: downloadError } = await bucket.download(uploadedPath);
  if (downloadError || !uploaded) return fail("写真を上げられませんでした。もう一度お試しください");

  let processed: Buffer;
  try {
    processed = await toShopPhoto(Buffer.from(await uploaded.arrayBuffer()));
  } catch (error) {
    console.error("[admin] 写真を読めませんでした", error);
    await bucket.remove([uploadedPath]);
    return fail("写真を読めませんでした。JPEG・PNG・WebP・AVIF の写真を上げてください");
  }
  const path = `${id}/${randomUUID()}.webp`;
  const { error: uploadError } = await bucket.upload(path, processed, { contentType: "image/webp" });
  if (uploadError) throw uploadError;
  await bucket.remove([uploadedPath]);

  const { data: product, error: readError } = await supabaseAdmin().from("products").select("images").eq("id", id).single();
  if (readError) throw readError;
  const images = (product as { images: string[] }).images ?? [];
  if (images.includes(path)) return { ok: true };
  const { error } = await supabaseAdmin()
    .from("products")
    .update({ images: [...images, path], updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  return { ok: true };
}

export async function removeProductImage(id: string, path: string): Promise<OpResult> {
  const { data: product, error: readError } = await supabaseAdmin().from("products").select("images").eq("id", id).single();
  if (readError) throw readError;
  const images = (product as { images: string[] }).images ?? [];
  if (!images.includes(path)) return fail("写真が見つかりません");
  const { error } = await supabaseAdmin()
    .from("products")
    .update({ images: images.filter((p) => p !== path), updated_at: new Date().toISOString() })
    .eq("id", id);
  if (error) throw error;
  await supabaseAdmin().storage.from("shop-images").remove([path]);
  return { ok: true };
}

export async function updateShopSettings(input: {
  shippingFee: number;
  freeShippingThreshold: number | null;
  overseasShippingFee: number;
  deliveryNoteJa: string;
  deliveryNoteEn: string;
}): Promise<OpResult> {
  if (!Number.isInteger(input.shippingFee) || input.shippingFee < 0) return fail("送料は 0 円以上で入れてください");
  if (!Number.isInteger(input.overseasShippingFee) || input.overseasShippingFee < 0) return fail("オーストラリアへの送料は 0 円以上で入れてください");
  if (input.freeShippingThreshold !== null && (!Number.isInteger(input.freeShippingThreshold) || input.freeShippingThreshold < 1)) {
    return fail("送料無料の金額は 1 円以上で入れるか、空にしてください");
  }
  if (!input.deliveryNoteJa.trim()) return fail("発送の目安を入れてください");
  const { error } = await supabaseAdmin()
    .from("shop_settings")
    .update({
      shipping_fee: input.shippingFee,
      free_shipping_threshold: input.freeShippingThreshold,
      overseas_shipping_fee: input.overseasShippingFee,
      delivery_note_ja: input.deliveryNoteJa.trim(),
      delivery_note_en: input.deliveryNoteEn.trim(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);
  if (error) throw error;
  return { ok: true };
}
