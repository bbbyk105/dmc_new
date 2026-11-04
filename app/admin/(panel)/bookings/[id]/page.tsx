import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getBooking, getService } from "@/lib/db/reserve";
import { isUuid } from "@/lib/reserve/validate";
import { formatSlot } from "@/lib/reserve/format";
import { cancellationFee, formatYen } from "@/lib/reserve/pricing";
import { jstDateString, jstTimeString } from "@/lib/reserve/schedule";
import { cancelBookingAction, rescheduleBookingAction, updateBookingNoteAction } from "../../../actions";
import { BOOKING_STATUS, Flash, PageTitle, Rows, Section, inputClass, labelClass, type FlashParams } from "../../../ui";

export default async function AdminBookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: FlashParams;
}) {
  await requireAdmin();
  const { id } = await params;
  const flash = await searchParams;
  if (!isUuid(id)) notFound();
  const booking = await getBooking(id);
  if (!booking) notFound();
  const service = await getService(booking.service_id, { includeInactive: true });

  const startsAt = new Date(booking.starts_at);
  const fee = cancellationFee(booking.amount, startsAt, new Date());
  const paidOnline = !!booking.stripe_payment_intent_id;
  const refundable = Math.max(0, booking.amount - booking.refunded_amount);

  return (
    <>
      <PageTitle>予約 {booking.code}</PageTitle>
      <Flash done={flash.done} error={flash.error} />

      <Section title="予約の内容">
        <Rows
          rows={[
            ["状態", BOOKING_STATUS[booking.status]],
            ["日時", formatSlot(startsAt, new Date(booking.ends_at), "ja")],
            ["サービス", `${booking.services?.name_ja ?? ""} / ${booking.service_options?.name_ja ?? ""}`],
            ["人数", `${booking.people}名`],
            ["料金（税込）", formatYen(booking.amount)],
            ["支払い", paidOnline ? "サイトでカード払い済み（Stripe）" : "お店で登録（当日払い）"],
            ["お名前", booking.customer_name],
            ["メール", booking.customer_email || "—"],
            ["電話", booking.customer_phone || "—"],
            ["ご要望", booking.customer_note || "—"],
            ["言語", booking.locale === "en" ? "英語" : "日本語"],
            ["日時の変更", `${booking.change_count} 回`],
            ...(booking.status === "cancelled"
              ? ([
                  ["キャンセル料", formatYen(booking.cancellation_fee ?? 0)],
                  ["返金額", formatYen(booking.refunded_amount)],
                ] as [string, string][])
              : []),
          ]}
        />
      </Section>

      {booking.status === "confirmed" && service && (
        <Section title="日時を変更する">
          <p className="mb-4 text-xs leading-6 text-text-muted">
            ほかの予約と重なる時間・休みの日には変えられません（締切は見ません）。変更するとお客さまにメールが届きます。
            {booking.change_count >= 1 && " この予約はもう1回変更しています。キャンセルポリシーでは変更は1回までです。"}
          </p>
          <form action={rescheduleBookingAction} className="flex flex-wrap items-end gap-4">
            <input type="hidden" name="id" value={booking.id} />
            <div>
              <label htmlFor="date" className={labelClass}>
                日付
              </label>
              <input id="date" name="date" type="date" required defaultValue={jstDateString(startsAt)} className={inputClass} />
            </div>
            <div>
              <label htmlFor="time" className={labelClass}>
                開始
              </label>
              <select id="time" name="time" defaultValue={jstTimeString(startsAt)} className={inputClass}>
                {service.start_times.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-secondary min-h-0 px-5 py-2.5 text-xs">
              変更する
            </button>
          </form>
        </Section>
      )}

      {booking.status === "confirmed" && (
        <Section title="予約を取り消す">
          <p className="mb-4 text-xs leading-6 text-text-muted">
            {paidOnline
              ? `今取り消すと、キャンセルポリシーによりキャンセル料は ${formatYen(fee)}、返金は ${formatYen(Math.max(0, refundable - fee))} です（Stripe でカードに返金し、お客さまにメールが届きます）。お店の都合で取り消すときは「キャンセル料をいただかない」に印を付けてください。`
              : "お店で登録した予約（当日払い）なので、返金はありません。取り消すと枠が空きます。"}
          </p>
          <form action={cancelBookingAction} className="flex flex-wrap items-center gap-6">
            <input type="hidden" name="id" value={booking.id} />
            {paidOnline && (
              <label className="flex items-center gap-2 text-sm text-text">
                <input type="checkbox" name="waiveFee" className="accent-[var(--color-text)]" />
                キャンセル料をいただかない（全額返金）
              </label>
            )}
            <button type="submit" className="btn-primary min-h-0 px-5 py-2.5 text-xs">
              予約を取り消す
            </button>
          </form>
        </Section>
      )}

      <Section title="お店のメモ">
        <form action={updateBookingNoteAction} className="space-y-3">
          <input type="hidden" name="id" value={booking.id} />
          <textarea name="note" rows={3} defaultValue={booking.admin_note} className={inputClass} />
          <button type="submit" className="btn-secondary min-h-0 px-5 py-2.5 text-xs">
            メモを保存
          </button>
        </form>
      </Section>
    </>
  );
}
