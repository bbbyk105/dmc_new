import { requireAdmin } from "@/lib/admin/auth";
import { getAllServices } from "@/lib/db/reserve";
import { formatYen } from "@/lib/reserve/pricing";
import { createBookingAction } from "../../../actions";
import { Flash, PageTitle, Section, inputClass, labelClass, type FlashParams } from "../../../ui";

/** お店が電話などで受けた予約を登録する（サイトの予約と同じ枠を使うので、二重予約にならない） */
export default async function AdminNewBookingPage({ searchParams }: { searchParams: FlashParams }) {
  await requireAdmin();
  const flash = await searchParams;
  const services = await getAllServices();
  const times = [...new Set(services.flatMap((s) => s.start_times))].sort();

  return (
    <>
      <PageTitle>電話の予約を登録</PageTitle>
      <Flash done={flash.done} error={flash.error} />
      <Section title="予約の内容">
        <p className="mb-6 text-xs leading-6 text-text-muted">
          サイトの予約と同じ枠に入ります。ほかの予約と重なる時間・休みの日には登録できません（締切は見ません）。料金はプランと人数から計算し、当日払いとして登録します。
        </p>
        <form action={createBookingAction} className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="plan" className={labelClass}>
              サービス・プラン
            </label>
            <select id="plan" name="plan" required className={inputClass}>
              {services.flatMap((s) =>
                s.service_options.map((o) => (
                  <option key={o.id} value={`${s.id}:${o.id}`}>
                    {s.name_ja} / {o.name_ja}（{o.duration_minutes}分・{formatYen(o.price)}）
                  </option>
                )),
              )}
            </select>
          </div>
          <div>
            <label htmlFor="date" className={labelClass}>
              日付
            </label>
            <input id="date" name="date" type="date" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="time" className={labelClass}>
              開始
            </label>
            <select id="time" name="time" required className={inputClass}>
              {times.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="people" className={labelClass}>
              人数
            </label>
            <input id="people" name="people" type="number" min={1} max={50} defaultValue={1} required className={inputClass} />
          </div>
          <div>
            <label htmlFor="name" className={labelClass}>
              お名前
            </label>
            <input id="name" name="name" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              電話番号
            </label>
            <input id="phone" name="phone" type="tel" className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              メール（任意。入れると、変更・取消のときにメールが届きます）
            </label>
            <input id="email" name="email" type="email" className={inputClass} />
          </div>
          <div>
            <label htmlFor="locale" className={labelClass}>
              メールの言語（変更・取消のときに送るメール）
            </label>
            <select id="locale" name="locale" defaultValue="ja" className={inputClass}>
              <option value="ja">日本語</option>
              <option value="en">英語</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="note" className={labelClass}>
              ご要望
            </label>
            <textarea id="note" name="note" rows={3} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary min-h-0 px-6 py-3 text-xs">
              予約を登録
            </button>
          </div>
        </form>
      </Section>
    </>
  );
}
