import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listOrders, type OrderView } from "@/lib/db/admin";
import { formatYen } from "@/lib/reserve/pricing";
import { formatDate } from "@/lib/reserve/format";
import { Flash, ORDER_STATUS, PageTitle, type FlashParams } from "../../ui";

const VIEWS: { key: OrderView; label: string }[] = [
  { key: "open", label: "未発送" },
  { key: "shipped", label: "発送済み" },
  { key: "cancelled", label: "取消" },
];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ view?: string }> & FlashParams }) {
  await requireAdmin();
  const params = await searchParams;
  const view: OrderView = VIEWS.some((v) => v.key === params.view) ? (params.view as OrderView) : "open";
  const orders = await listOrders(view);

  return (
    <>
      <PageTitle>注文</PageTitle>
      <Flash done={params.done} error={params.error} />
      <div className="mb-6 flex gap-6 border-b border-border text-sm">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/admin/orders?view=${v.key}`}
            aria-current={v.key === view ? "page" : undefined}
            className={`-mb-px border-b pb-3 ${v.key === view ? "border-text text-text" : "border-transparent text-text-muted hover:text-text"}`}
          >
            {v.label}
          </Link>
        ))}
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-text-muted">注文はありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs text-text-muted">
              <tr>
                <th className="py-2 pr-4 font-normal">注文番号</th>
                <th className="py-2 pr-4 font-normal">注文日</th>
                <th className="py-2 pr-4 font-normal">お届け先</th>
                <th className="py-2 pr-4 font-normal">商品</th>
                <th className="py-2 pr-4 font-normal">合計</th>
                <th className="py-2 font-normal">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-surface">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/orders/${o.id}`} className="underline decoration-border underline-offset-4 hover:decoration-text">
                      {o.code}
                    </Link>
                    {o.overseas && <span className="ml-2 border border-text px-1.5 py-0.5 text-[10px] text-text">オーストラリア</span>}
                    {o.needs_attention && <span className="ml-2 bg-text px-1.5 py-0.5 text-[10px] text-background">要確認</span>}
                  </td>
                  <td className="py-3 pr-4">{o.paid_at ? formatDate(new Date(o.paid_at), "ja") : "—"}</td>
                  <td className="py-3 pr-4">{o.shipping_name}</td>
                  <td className="py-3 pr-4 text-text-muted">
                    {o.order_items.map((i) => `${i.name_ja} × ${i.quantity}`).join("、")}
                  </td>
                  <td className="py-3 pr-4 tabular-nums">{formatYen(o.total)}</td>
                  <td className="py-3">{ORDER_STATUS[o.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
