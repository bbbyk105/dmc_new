"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { authClient, requireAdmin } from "@/lib/admin/auth";
import { isAdminEmail } from "@/lib/admin/allowlist";
import * as ops from "@/lib/admin/operations";

/**
 * 管理画面の Server Action。どれも最初に requireAdmin() で管理者かを確かめる。
 * 結果は ?done= / ?error= を付けて元の画面に戻し、画面の上に出す
 */

function text(form: FormData, key: string): string {
  const v = form.get(key);
  return typeof v === "string" ? v : "";
}

function int(form: FormData, key: string): number {
  const v = text(form, key).trim();
  return v === "" ? NaN : Number(v);
}

function back(path: string, result: ops.OpResult, done: string): never {
  const params = new URLSearchParams(result.ok ? { done } : { error: result.message });
  redirect(`${path}?${params}`);
}

// ---------------------------------------------------------------------------
// ログイン
// ---------------------------------------------------------------------------

export async function signIn(form: FormData) {
  const email = text(form, "email").trim();
  const password = text(form, "password");
  const supabase = await authClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !isAdminEmail(data.user?.email, process.env.ADMIN_EMAILS)) {
    if (!error) await supabase.auth.signOut();
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await authClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------------------------------------------------------------------------
// 予約
// ---------------------------------------------------------------------------

export async function cancelBookingAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const result = await ops.cancelBooking(id, { waiveFee: form.get("waiveFee") === "on" });
  revalidatePath("/admin", "layout");
  back(`/admin/bookings/${id}`, result, "予約を取り消しました");
}

export async function rescheduleBookingAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const result = await ops.rescheduleBooking(id, text(form, "date"), text(form, "time"));
  revalidatePath("/admin", "layout");
  back(`/admin/bookings/${id}`, result, "日時を変更し、お客さまにメールでお知らせしました");
}

export async function updateBookingNoteAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const result = await ops.updateBookingNote(id, text(form, "note"));
  back(`/admin/bookings/${id}`, result, "メモを保存しました");
}

export async function createBookingAction(form: FormData) {
  await requireAdmin();
  const [serviceId, optionId] = text(form, "plan").split(":");
  const result = await ops.createAdminBooking({
    serviceId: serviceId ?? "",
    optionId: optionId ?? "",
    date: text(form, "date"),
    time: text(form, "time"),
    people: int(form, "people"),
    name: text(form, "name"),
    phone: text(form, "phone"),
    email: text(form, "email"),
    note: text(form, "note"),
    locale: text(form, "locale") === "en" ? "en" : "ja",
  });
  revalidatePath("/admin", "layout");
  if (result.ok && result.id) redirect(`/admin/bookings/${result.id}?done=${encodeURIComponent("予約を登録しました")}`);
  back("/admin/bookings/new", result, "");
}

// ---------------------------------------------------------------------------
// 受付の設定
// ---------------------------------------------------------------------------

export async function addClosedDateAction(form: FormData) {
  await requireAdmin();
  const resource = text(form, "resource");
  const result = await ops.addClosedDate(text(form, "date"), resource === "all" ? null : resource, text(form, "note"));
  back("/admin/schedule", result, "休みの日を登録しました");
}

export async function removeClosedDateAction(form: FormData) {
  await requireAdmin();
  const result = await ops.removeClosedDate(int(form, "id"));
  back("/admin/schedule", result, "休みの日を解除しました");
}

export async function updateServiceAction(form: FormData) {
  await requireAdmin();
  const result = await ops.updateService(text(form, "id"), {
    startTimes: text(form, "startTimes")
      .split(/[,、\s]+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (/^\d:\d\d$/.test(t) ? `0${t}` : t)),
    closesAt: text(form, "closesAt").trim(),
    weekdays: form.getAll("weekdays").map(Number),
    leadHours: int(form, "leadHours"),
    maxAdvanceDays: int(form, "maxAdvanceDays"),
    active: form.get("active") === "on",
  });
  revalidatePath("/", "layout");
  back("/admin/schedule", result, "受付の設定を保存しました");
}

export async function updateServiceOptionAction(form: FormData) {
  await requireAdmin();
  const result = await ops.updateServiceOption(text(form, "id"), {
    nameJa: text(form, "nameJa"),
    nameEn: text(form, "nameEn"),
    durationMinutes: int(form, "durationMinutes"),
    price: int(form, "price"),
    extraPersonPrice: int(form, "extraPersonPrice"),
    maxPeople: int(form, "maxPeople"),
    active: form.get("active") === "on",
  });
  revalidatePath("/", "layout");
  back("/admin/schedule", result, "プランを保存しました");
}

// ---------------------------------------------------------------------------
// 注文
// ---------------------------------------------------------------------------

export async function markOrderShippedAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const result = await ops.markOrderShipped(id, text(form, "trackingNumber"));
  revalidatePath("/admin", "layout");
  back(`/admin/orders/${id}`, result, "発送済みにして、お客さまにメールでお知らせしました");
}

export async function cancelOrderAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const result = await ops.cancelOrder(id);
  revalidatePath("/", "layout");
  back(`/admin/orders/${id}`, result, "注文を取り消し、全額を返金しました");
}

export async function updateOrderNoteAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const result = await ops.updateOrderNote(id, text(form, "note"), form.get("needsAttention") === "on");
  back(`/admin/orders/${id}`, result, "メモを保存しました");
}

// ---------------------------------------------------------------------------
// 商品・ショップの設定
// ---------------------------------------------------------------------------

function productInput(form: FormData): ops.ProductInput {
  return {
    slug: text(form, "slug").trim(),
    nameJa: text(form, "nameJa"),
    nameEn: text(form, "nameEn"),
    descriptionJa: text(form, "descriptionJa"),
    descriptionEn: text(form, "descriptionEn"),
    price: int(form, "price"),
    stock: int(form, "stock"),
    sort: Number.isFinite(int(form, "sort")) ? int(form, "sort") : 0,
    active: form.get("active") === "on",
  };
}

export async function createProductAction(form: FormData) {
  await requireAdmin();
  const result = await ops.createProduct(productInput(form));
  revalidatePath("/", "layout");
  if (result.ok && result.id) {
    redirect(`/admin/products/${result.id}?done=${encodeURIComponent("商品を登録しました。写真を追加してください")}`);
  }
  back("/admin/products/new", result, "");
}

export async function updateProductAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const result = await ops.updateProduct(id, productInput(form));
  revalidatePath("/", "layout");
  back(`/admin/products/${id}`, result, "商品を保存しました");
}

/** 写真を上げる URL を発行する（ImageUploader から呼ぶ。写真そのものはブラウザから Storage へ直接上げる） */
export async function createProductImageUploadAction(id: string, contentType: string, size: number) {
  await requireAdmin();
  return ops.createProductImageUpload(id, contentType, size);
}

/** 上がった写真を商品に付ける */
export async function attachProductImageAction(id: string, path: string): Promise<ops.OpResult> {
  await requireAdmin();
  const result = await ops.attachProductImage(id, path);
  revalidatePath("/", "layout");
  return result;
}

export async function removeProductImageAction(form: FormData) {
  await requireAdmin();
  const id = text(form, "id");
  const result = await ops.removeProductImage(id, text(form, "path"));
  revalidatePath("/", "layout");
  back(`/admin/products/${id}`, result, "写真を削除しました");
}

export async function updateShopSettingsAction(form: FormData) {
  await requireAdmin();
  const threshold = text(form, "freeShippingThreshold").trim();
  const result = await ops.updateShopSettings({
    shippingFee: int(form, "shippingFee"),
    freeShippingThreshold: threshold === "" ? null : Number(threshold),
    overseasShippingFee: int(form, "overseasShippingFee"),
    deliveryNoteJa: text(form, "deliveryNoteJa"),
    deliveryNoteEn: text(form, "deliveryNoteEn"),
  });
  revalidatePath("/", "layout");
  back("/admin/settings", result, "ショップの設定を保存しました");
}
