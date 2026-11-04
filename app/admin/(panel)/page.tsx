import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { listBookings, type BookingView } from "@/lib/db/admin";
import { formatSlot } from "@/lib/reserve/format";
import { formatYen } from "@/lib/reserve/pricing";
import { BOOKING_STATUS, Flash, PageTitle, type FlashParams } from "../ui";

const VIEWS: { key: BookingView; label: string }[] = [
  { key: "upcoming", label: "これからの予約" },
  { key: "past", label: "終わった予約" },
  { key: "cancelled", label: "取消" },
];

/** 予約の一覧（これからの予約を開始の早い順に） */
export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }> & FlashParams;
}) {
  await requireAdmin();
  const params = await searchParams;
  const view: BookingView = VIEWS.some((v) => v.key === params.view) ? (params.view as BookingView) : "upcoming";
  const bookings = await listBookings(view);

  return (
    <>
      <PageTitle
        action={
          <Link href="/admin/bookings/new" className="btn-primary min-h-0 px-5 py-2.5 text-xs">
            電話の予約を登録
          </Link>
        }
      >
        予約
      </PageTitle>
      <Flash done={params.done} error={params.error} />

      <div className="mb-6 flex gap-6 border-b border-border text-sm">
        {VIEWS.map((v) => (
          <Link
            key={v.key}
            href={`/admin?view=${v.key}`}
            aria-current={v.key === view ? "page" : undefined}
            className={`-mb-px border-b pb-3 ${v.key === view ? "border-text text-text" : "border-transparent text-text-muted hover:text-text"}`}
          >
            {v.label}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-text-muted">予約はありません。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs text-text-muted">
              <tr>
                <th className="py-2 pr-4 font-normal">日時</th>
                <th className="py-2 pr-4 font-normal">サービス</th>
                <th className="py-2 pr-4 font-normal">お名前</th>
                <th className="py-2 pr-4 font-normal">人数</th>
                <th className="py-2 pr-4 font-normal">料金</th>
                <th className="py-2 pr-4 font-normal">受付</th>
                <th className="py-2 font-normal">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-surface">
                  <td className="py-3 pr-4">
                    <Link href={`/admin/bookings/${b.id}`} className="underline decoration-border underline-offset-4 hover:decoration-text">
                      {formatSlot(new Date(b.starts_at), new Date(b.ends_at), "ja")}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">
                    {b.services?.name_ja} / {b.service_options?.name_ja}
                  </td>
                  <td className="py-3 pr-4">{b.customer_name}</td>
                  <td className="py-3 pr-4">{b.people}名</td>
                  <td className="py-3 pr-4 tabular-nums">{formatYen(b.amount)}</td>
                  <td className="py-3 pr-4 text-text-muted">{b.source === "web" ? "サイト（カード払い済み）" : "お店（当日払い）"}</td>
                  <td className="py-3">{BOOKING_STATUS[b.status]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
