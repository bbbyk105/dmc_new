import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getOrder } from "@/lib/db/shop";
import { isUuid } from "@/lib/reserve/validate";
import { formatYen } from "@/lib/reserve/pricing";
import { formatDate } from "@/lib/reserve/format";
import { shippingAddressLabel } from "@/lib/shop/address";
import { cancelOrderAction, markOrderShippedAction, updateOrderNoteAction } from "../../../actions";
import { Flash, ORDER_STATUS, PageTitle, Rows, Section, inputClass, labelClass, type FlashParams } from "../../../ui";

export default async function AdminOrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: FlashParams }) {
  await requireAdmin();
  const { id } = await params;
  const flash = await searchParams;
  if (!isUuid(id)) notFound();
  const order = await getOrder(id);
  if (!order) notFound();

  return (
    <>
      <PageTitle>注文 {order.code}</PageTitle>
      <Flash done={flash.done} error={flash.error} />
      {order.overseas && order.status === "paid" && (
        <p className="mb-6 border-l border-text bg-surface p-4 text-sm leading-7 text-text">
          オーストラリアへのご注文です（英語のページから）。送料は一律の {formatYen(order.shipping_fee)} をいただいています。実際の送料と大きく違うときは、発送の前にお客さまへメールで相談してください。
        </p>
      )}
      {order.needs_attention && (
        <p className="mb-6 bg-text p-4 text-sm text-background">
          要確認：支払いの途中で在庫が足りなくなった注文です。取り寄せて発送するか、注文を取り消して返金してください。
        </p>
      )}

      <Section title="注文の内容">
        <Rows
          rows={[
            ["状態", ORDER_STATUS[order.status]],
            ["注文日", order.paid_at ? formatDate(new Date(order.paid_at), "ja") : "—"],
            ["商品", order.order_items.map((i) => `${i.name_ja} × ${i.quantity}（${formatYen(i.unit_price * i.quantity)}）`).join("\n")],
            ["小計", formatYen(order.subtotal)],
            ["送料", order.overseas ? `${formatYen(order.shipping_fee)}（オーストラリア・一律）` : formatYen(order.shipping_fee)],
            ["合計（税込）", formatYen(order.total)],
            ["返金額", formatYen(order.refunded_amount)],
            ["お届け先", `${order.shipping_name}\n${shippingAddressLabel(order)}`],
            ["電話", order.customer_phone || "—"],
            ["メール", order.customer_email || "—"],
            ["お問い合わせ番号", order.tracking_number || "—"],
          ]}
        />
      </Section>

      {order.status === "paid" && (
        <Section title="発送済みにする">
          <p className="mb-4 text-xs text-text-muted">発送済みにすると、お客さまにメールが届きます。</p>
          <form action={markOrderShippedAction} className="flex flex-wrap items-end gap-4">
            <input type="hidden" name="id" value={order.id} />
            <div className="min-w-64">
              <label htmlFor="tracking" className={labelClass}>
                お問い合わせ番号（任意）
              </label>
              <input id="tracking" name="trackingNumber" className={inputClass} />
            </div>
            <button type="submit" className="btn-primary min-h-0 px-5 py-2.5 text-xs">
              発送済みにする
            </button>
          </form>
        </Section>
      )}

      {(order.status === "paid" || order.status === "shipped") && (
        <Section title="注文を取り消す">
          <p className="mb-4 text-xs leading-6 text-text-muted">
            {formatYen(Math.max(0, order.total - order.refunded_amount))} を Stripe でカードに返金し、お客さまにメールが届きます。
            {order.status === "paid" ? "発送前なので在庫を戻します。" : "発送済みなので在庫は戻しません（返品を受けたら、商品の画面で在庫を直してください）。"}
          </p>
          <form action={cancelOrderAction}>
            <input type="hidden" name="id" value={order.id} />
            <button type="submit" className="btn-secondary min-h-0 px-5 py-2.5 text-xs">
              注文を取り消して返金する
            </button>
          </form>
        </Section>
      )}

      <Section title="お店のメモ">
        <form action={updateOrderNoteAction} className="space-y-3">
          <input type="hidden" name="id" value={order.id} />
          <textarea name="note" rows={3} defaultValue={order.admin_note} className={inputClass} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="needsAttention" defaultChecked={order.needs_attention} className="accent-[var(--color-text)]" />
            要確認の印を付ける
          </label>
          <button type="submit" className="btn-secondary min-h-0 px-5 py-2.5 text-xs">
            メモを保存
          </button>
        </form>
      </Section>
    </>
  );
}
