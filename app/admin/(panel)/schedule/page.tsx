import { requireAdmin } from "@/lib/admin/auth";
import { getAllServices } from "@/lib/db/reserve";
import { listClosedDates } from "@/lib/db/admin";
import { formatDateString } from "@/lib/reserve/format";
import { jstDateString } from "@/lib/reserve/schedule";
import {
  addClosedDateAction,
  removeClosedDateAction,
  updateServiceAction,
  updateServiceOptionAction,
} from "../../actions";
import { Flash, PageTitle, RESOURCE_LABEL, Section, inputClass, labelClass, type FlashParams } from "../../ui";

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export default async function AdminSchedulePage({ searchParams }: { searchParams: FlashParams }) {
  await requireAdmin();
  const flash = await searchParams;
  const [services, closed] = await Promise.all([getAllServices(), listClosedDates(jstDateString(new Date()))]);
  const resources = [...new Set(services.map((s) => s.resource))];

  return (
    <>
      <PageTitle>受付の設定</PageTitle>
      <Flash done={flash.done} error={flash.error} />

      <Section title="休みの日">
        <form action={addClosedDateAction} className="mb-6 flex flex-wrap items-end gap-4">
          <div>
            <label htmlFor="closed-date" className={labelClass}>
              日付
            </label>
            <input id="closed-date" name="date" type="date" required className={inputClass} />
          </div>
          <div>
            <label htmlFor="closed-resource" className={labelClass}>
              止める予約
            </label>
            <select id="closed-resource" name="resource" className={inputClass}>
              <option value="all">すべて</option>
              {resources.map((r) => (
                <option key={r} value={r}>
                  {RESOURCE_LABEL[r] ?? r}
                </option>
              ))}
            </select>
          </div>
          <div className="min-w-48 flex-1">
            <label htmlFor="closed-note" className={labelClass}>
              メモ（任意）
            </label>
            <input id="closed-note" name="note" className={inputClass} />
          </div>
          <button type="submit" className="btn-primary min-h-0 px-5 py-2.5 text-xs">
            休みに登録
          </button>
        </form>
        {closed.length === 0 ? (
          <p className="text-sm text-text-muted">これからの休みの日はありません。</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {closed.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-4 py-2">
                <span className="w-44">{formatDateString(c.date, "ja")}</span>
                <span className="w-48 text-text-muted">{c.resource ? (RESOURCE_LABEL[c.resource] ?? c.resource) : "すべて"}</span>
                <span className="flex-1 text-text-muted">{c.note}</span>
                <form action={removeClosedDateAction}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="text-xs underline underline-offset-4 hover:text-text-muted">
                    解除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {services.map((s) => (
        <Section key={s.id} title={`${s.name_ja}（${RESOURCE_LABEL[s.resource] ?? s.resource}）`}>
          <form action={updateServiceAction} className="grid gap-5 md:grid-cols-2">
            <input type="hidden" name="id" value={s.id} />
            <div className="md:col-span-2">
              <label htmlFor={`${s.id}-times`} className={labelClass}>
                開始できる時刻（カンマ区切り）
              </label>
              <input id={`${s.id}-times`} name="startTimes" defaultValue={s.start_times.join(", ")} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`${s.id}-closes`} className={labelClass}>
                この時刻までに終わる枠だけを出す
              </label>
              <input id={`${s.id}-closes`} name="closesAt" defaultValue={s.closes_at} className={inputClass} />
            </div>
            <fieldset>
              <legend className={labelClass}>予約を受ける曜日</legend>
              <div className="flex flex-wrap gap-3 pt-1">
                {WEEKDAYS.map((w, i) => (
                  <label key={w} className="flex items-center gap-1 text-sm">
                    <input type="checkbox" name="weekdays" value={i} defaultChecked={s.weekdays.includes(i)} className="accent-[var(--color-text)]" />
                    {w}
                  </label>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor={`${s.id}-lead`} className={labelClass}>
                締切（開始の何時間前まで受けるか）
              </label>
              <input id={`${s.id}-lead`} name="leadHours" type="number" min={0} defaultValue={s.lead_hours} className={inputClass} />
            </div>
            <div>
              <label htmlFor={`${s.id}-advance`} className={labelClass}>
                何日先まで受けるか
              </label>
              <input id={`${s.id}-advance`} name="maxAdvanceDays" type="number" min={1} defaultValue={s.max_advance_days} className={inputClass} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={s.active} className="accent-[var(--color-text)]" />
              サイトで予約を受け付ける
            </label>
            <div className="md:col-span-2">
              <button type="submit" className="btn-secondary min-h-0 px-5 py-2.5 text-xs">
                受付の設定を保存
              </button>
            </div>
          </form>

          <h3 className="mb-3 mt-8 text-xs text-text-muted">プラン</h3>
          <div className="space-y-4">
            {s.service_options.map((o) => (
              <form key={o.id} action={updateServiceOptionAction} className="grid gap-3 border-t border-border pt-4 md:grid-cols-8">
                <input type="hidden" name="id" value={o.id} />
                <div className="md:col-span-2">
                  <label className={labelClass}>名前</label>
                  <input name="nameJa" defaultValue={o.name_ja} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className={labelClass}>名前（英語）</label>
                  <input name="nameEn" defaultValue={o.name_en} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>時間（分）</label>
                  <input name="durationMinutes" type="number" min={15} defaultValue={o.duration_minutes} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>料金（円）</label>
                  <input name="price" type="number" min={50} defaultValue={o.price} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>2人目から（円）</label>
                  <input name="extraPersonPrice" type="number" min={0} defaultValue={o.extra_person_price} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>人数の上限</label>
                  <input name="maxPeople" type="number" min={1} max={50} defaultValue={o.max_people} className={inputClass} />
                </div>
                <label className="flex items-center gap-2 text-sm md:col-span-6">
                  <input type="checkbox" name="active" defaultChecked={o.active} className="accent-[var(--color-text)]" />
                  サイトに出す
                </label>
                <div className="md:col-span-2 md:text-right">
                  <button type="submit" className="btn-secondary min-h-0 px-5 py-2 text-xs">
                    プランを保存
                  </button>
                </div>
              </form>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}
