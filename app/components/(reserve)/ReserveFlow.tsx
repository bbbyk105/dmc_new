"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addMonths, bookableMonths } from "@/lib/reserve/schedule";
import { bookingAmount, formatYen } from "@/lib/reserve/pricing";
import { formatDateString } from "@/lib/reserve/format";
import { parseBookingRequest, type BookingField } from "@/lib/reserve/validate";
import { reserveCopy } from "./copy";
import ReserveCalendar from "./ReserveCalendar";
import type { DayStatus, ReserveService } from "./types";

type Props = {
  locale: "ja" | "en";
  services: ReserveService[];
  /** サービスのページから ?service=camu 付きで来たとき */
  initialServiceId?: string;
  /** Stripe の画面から戻ってきたとき（?release=）。仮押さえを外す */
  releaseToken?: string;
};

type Step = 0 | 1 | 2 | 3;
type Customer = { name: string; email: string; phone: string; note: string };

const fieldClass =
  "w-full border border-border bg-surface px-4 py-3 text-text transition-colors focus:border-text focus:outline-none";

function StepIndicator({ labels, current, onJump }: { labels: readonly string[]; current: Step; onJump: (s: Step) => void }) {
  return (
    <ol className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 sm:gap-x-4" aria-label="steps">
      {labels.map((label, i) => {
        const reached = current >= i;
        return (
          <li key={label} className="flex items-center">
            <button
              type="button"
              onClick={() => onJump(i as Step)}
              disabled={i >= current}
              aria-current={current === i ? "step" : undefined}
              className="flex items-center gap-2 disabled:cursor-default"
            >
              <span
                className={`flex h-8 w-8 items-center justify-center text-sm tabular-nums ${
                  reached ? "bg-text text-background" : "border border-border bg-surface text-text-muted"
                }`}
              >
                {i + 1}
              </span>
              <span className={`hidden text-xs sm:inline ${reached ? "text-text" : "text-text-muted"}`}>{label}</span>
            </button>
            {i < labels.length - 1 && (
              <span className={`mx-2 h-px w-6 sm:mx-3 sm:w-10 ${current > i ? "bg-text" : "bg-border"}`} aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepHeading({ title, lead }: { title: string; lead: string }) {
  return (
    <div className="mb-10 text-center">
      <h2 className="mb-2 font-serif text-2xl tracking-wide text-text">{title}</h2>
      <p className="text-sm text-text-muted">{lead}</p>
    </div>
  );
}

/**
 * 予約の流れ（1 プラン → 2 日時 → 3 お客さま情報 → 4 確認 → Stripe でお支払い）。
 * 空き状況は月ごとに /api/reserve/availability から読み、埋まった時間は選べない。
 * 料金は画面では目安として出し、支払う金額はサーバーがデータベースのプランから決める
 */
export default function ReserveFlow({ locale, services, initialServiceId, releaseToken }: Props) {
  const copy = reserveCopy[locale];
  const initialService = services.find((s) => s.id === initialServiceId);

  const [step, setStep] = useState<Step>(
    initialService && initialService.options.length === 1 ? 1 : 0,
  );
  const [serviceId, setServiceId] = useState(initialService?.id ?? "");
  const [optionId, setOptionId] = useState(
    initialService && initialService.options.length === 1 ? initialService.options[0].id : "",
  );
  const [people, setPeople] = useState(1);
  const [months] = useState(() => bookableMonths(Math.max(...services.map((s) => s.maxAdvanceDays), 1), new Date()));
  const [month, setMonth] = useState(months.first);
  // 読み終えた空き状況と、それがどの条件（サービス・プラン・月）のものか
  const [availability, setAvailability] = useState<{ key: string; days: Record<string, DayStatus>; error: boolean }>({
    key: "",
    days: {},
    error: false,
  });
  const [date, setDate] = useState<string | null>(null);
  const [pickedTime, setPickedTime] = useState<string | null>(null);
  const [customer, setCustomer] = useState<Customer>({ name: "", email: "", phone: "", note: "" });
  const [fieldErrors, setFieldErrors] = useState<BookingField[]>([]);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const autoAdvanced = useRef(false);
  const topRef = useRef<HTMLDivElement>(null);

  const service = services.find((s) => s.id === serviceId);
  const option = service?.options.find((o) => o.id === optionId);
  const amount = option ? bookingAmount(option.price, option.extraPersonPrice, people) : 0;

  const availabilityKey = service && option ? `${service.id}|${option.id}|${month}|${reloadKey}` : "";
  const loading = availabilityKey !== "" && availability.key !== availabilityKey;
  const days = loading ? {} : availability.days;
  // 空き状況が変わって、選んでいた時間が取れなくなったら外れる（ほかの人が先に押さえたときなど）
  const time =
    date && pickedTime && days[date]?.slots.some((s) => s.time === pickedTime && s.status === "available")
      ? pickedTime
      : null;
  const setTime = setPickedTime;

  // Stripe の画面から戻ってきたら、お取りしていた時間を外して URL から鍵を消す
  useEffect(() => {
    if (!releaseToken) return;
    fetch("/api/checkout/release", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "booking", token: releaseToken }),
    })
      .then((res) => res.json())
      .then((data: { released?: boolean }) => {
        if (data.released) setNotice(copy.released);
      })
      .catch(() => {})
      .finally(() => {
        const url = new URL(window.location.href);
        url.searchParams.delete("release");
        window.history.replaceState(null, "", url);
      });
  }, [releaseToken, copy.released]);

  // 空き状況（プランの時間で変わるので、プランと月ごとに読む）
  useEffect(() => {
    if (!availabilityKey) return;
    const [serviceKey, optionKey, monthKey] = availabilityKey.split("|");
    const controller = new AbortController();
    const params = new URLSearchParams({ service: serviceKey, option: optionKey, month: monthKey });
    fetch(`/api/reserve/availability?${params}`, { signal: controller.signal, cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<{ days: Record<string, DayStatus> }>;
      })
      .then((data) => {
        setAvailability({ key: availabilityKey, days: data.days, error: false });
        // 今月にもう空きが無ければ（月末など）、一度だけ次の月を開く
        const hasOpen = Object.values(data.days).some((d) => d.status === "open");
        if (!hasOpen && !autoAdvanced.current && monthKey < months.last) {
          autoAdvanced.current = true;
          setMonth(addMonths(monthKey, 1));
        }
      })
      .catch((e: unknown) => {
        if (e instanceof DOMException && e.name === "AbortError") return;
        setAvailability({ key: availabilityKey, days: {}, error: true });
      });
    return () => controller.abort();
  }, [availabilityKey, months.last]);

  const go = useCallback((next: Step) => {
    setStep(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const selectService = (id: string) => {
    if (id === serviceId) return;
    const next = services.find((s) => s.id === id);
    setServiceId(id);
    setOptionId(next && next.options.length === 1 ? next.options[0].id : "");
    setPeople(1);
    setDate(null);
    setTime(null);
  };

  const selectOption = (id: string) => {
    setOptionId(id);
    const next = service?.options.find((o) => o.id === id);
    if (next && people > next.maxPeople) setPeople(next.maxPeople);
    // 時間の長さが変わると空きも変わるので、選び直してもらう
    setTime(null);
    autoAdvanced.current = false;
  };

  const request = useMemo(
    () => ({ serviceId, optionId, date: date ?? "", time: time ?? "", people, ...customer, locale }),
    [serviceId, optionId, date, time, people, customer, locale],
  );

  const checkCustomer = () => {
    const result = parseBookingRequest(request);
    const errors = result.ok ? [] : result.errors.filter((f) => f === "name" || f === "email" || f === "phone" || f === "note");
    setFieldErrors(errors);
    if (errors.length === 0) go(3);
  };

  const submit = async () => {
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/reserve/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });
      const data = (await res.json()) as { url?: string; error?: string; fields?: BookingField[] };
      if (res.ok && data.url) {
        window.location.assign(data.url);
        return;
      }
      if (data.error === "unavailable") {
        setNotice(copy.errors.unavailable);
        setTime(null);
        setReloadKey((k) => k + 1);
        go(1);
      } else if (data.error === "too_many_holds") {
        setNotice(copy.errors.tooMany);
      } else if (data.error === "invalid") {
        setNotice(copy.errors.invalid);
        setFieldErrors(data.fields ?? []);
        go(data.fields?.some((f) => ["date", "time", "optionId", "people"].includes(f)) ? 1 : 2);
      } else {
        setNotice(copy.errors.server);
      }
    } catch {
      setNotice(copy.errors.server);
    }
    setSubmitting(false);
  };

  const errorText = (field: "name" | "email" | "phone" | "note") =>
    fieldErrors.includes(field) ? (
      <p id={`${field}-error`} className="mt-2 text-xs text-text">
        {copy.customer.errors[field]}
      </p>
    ) : null;

  const peopleLabel = (n: number) => (locale === "ja" ? `${n}${copy.plan.peopleUnit}` : String(n));

  return (
    <div ref={topRef} className="scroll-mt-28">
      <StepIndicator labels={copy.steps} current={step} onJump={go} />

      {notice && (
        <p role="status" className="mx-auto mt-8 max-w-2xl border-l border-text bg-surface p-4 text-sm text-text">
          {notice}
        </p>
      )}

      <div className="mt-12">
        {/* 1. プラン */}
        {step === 0 && (
          <div className="mx-auto max-w-4xl">
            <StepHeading title={copy.plan.heading} lead={copy.plan.lead} />
            {/* サービスの数（言語によって 2 つ）に合わせて列を決め、中央にそろえる */}
            <div className={`mx-auto grid grid-cols-1 gap-4 ${services.length >= 3 ? "md:grid-cols-3" : "max-w-2xl md:grid-cols-2"}`}>
              {services.map((s) => {
                const selected = s.id === serviceId;
                const from = Math.min(...s.options.map((o) => o.price));
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => selectService(s.id)}
                    aria-pressed={selected}
                    className={`flex flex-col items-start border p-6 text-left transition-colors ${
                      selected ? "border-text bg-text text-background" : "border-border bg-surface text-text hover:border-text"
                    }`}
                  >
                    <span className="mb-2 block font-serif text-lg">{s.name}</span>
                    <span className={`block text-xs leading-6 ${selected ? "text-background/75" : "text-text-muted"}`}>
                      {s.summary}
                    </span>
                    <span className="mt-4 block text-sm tabular-nums">
                      {formatYen(from)}
                      {s.options.length > 1 ? (locale === "ja" ? "〜" : "+") : ""}
                    </span>
                  </button>
                );
              })}
            </div>

            {service && (
              <div className="mt-10 border border-border bg-surface p-6 md:p-8">
                <fieldset>
                  <legend className="mb-4 font-serif text-lg text-text">{service.name}</legend>
                  <div className="space-y-3">
                    {service.options.map((o) => (
                      <label
                        key={o.id}
                        className={`flex cursor-pointer items-start gap-4 border p-4 transition-colors ${
                          o.id === optionId ? "border-text" : "border-border hover:border-text-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          name="option"
                          value={o.id}
                          checked={o.id === optionId}
                          onChange={() => selectOption(o.id)}
                          className="mt-1 accent-[var(--color-text)]"
                        />
                        <span className="flex-1">
                          <span className="flex flex-wrap items-baseline justify-between gap-2">
                            <span className="text-sm font-medium text-text">{o.name}</span>
                            <span className="text-sm tabular-nums text-text">{formatYen(o.price)}</span>
                          </span>
                          <span className="mt-1 block text-xs leading-6 text-text-muted">
                            {copy.plan.duration(o.durationMinutes)}
                            {o.summary ? ` ・ ${o.summary}` : ""}
                            {o.extraPersonPrice > 0 ? ` ・ ${copy.plan.extra(formatYen(o.extraPersonPrice))}` : ""}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {option && option.maxPeople > 1 && (
                  <div className="mt-6">
                    <label htmlFor="people" className="mb-2 block text-sm text-text-muted">
                      {copy.plan.people}
                    </label>
                    <select
                      id="people"
                      value={people}
                      onChange={(e) => setPeople(Number(e.target.value))}
                      className={`${fieldClass} max-w-40`}
                    >
                      {Array.from({ length: option.maxPeople }, (_, i) => i + 1).map((n) => (
                        <option key={n} value={n}>
                          {peopleLabel(n)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {option && (
                  <p className="mt-6 flex items-baseline justify-between border-t border-border pt-4 text-sm text-text">
                    <span className="text-text-muted">{copy.plan.amount}</span>
                    <span className="font-serif text-2xl tabular-nums">{formatYen(amount)}</span>
                  </p>
                )}
              </div>
            )}

            <div className="mt-10 flex justify-center">
              <button type="button" className="btn-primary" disabled={!option} onClick={() => go(1)}>
                {copy.next}
              </button>
            </div>
          </div>
        )}

        {/* 2. 日時 */}
        {step === 1 && service && option && (
          <div className="mx-auto max-w-5xl">
            <StepHeading title={copy.calendar.heading} lead={copy.calendar.lead(service.leadHours)} />
            <ReserveCalendar
              copy={copy.calendar}
              locale={locale}
              month={month}
              canGoPrev={month > months.first}
              canGoNext={month < months.last}
              onPrev={() => setMonth(addMonths(month, -1))}
              onNext={() => setMonth(addMonths(month, 1))}
              days={days}
              loading={loading}
              error={availability.error && !loading}
              selectedDate={date}
              selectedTime={time}
              onSelectDate={(d) => {
                setDate(d);
                setTime(null);
              }}
              onSelectTime={setTime}
            />
            <div className="mt-10 flex flex-col-reverse justify-center gap-4 sm:flex-row">
              <button type="button" className="btn-secondary" onClick={() => go(0)}>
                {copy.back}
              </button>
              <button type="button" className="btn-primary" disabled={!date || !time} onClick={() => go(2)}>
                {copy.next}
              </button>
            </div>
          </div>
        )}

        {/* 3. お客さま情報 */}
        {step === 2 && (
          <div className="mx-auto max-w-2xl">
            <StepHeading title={copy.customer.heading} lead={copy.customer.lead} />
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                checkCustomer();
              }}
              className="space-y-6 border border-border bg-surface p-6 md:p-10"
            >
              {(["name", "email", "phone"] as const).map((field) => (
                <div key={field}>
                  <label htmlFor={field} className="mb-2 block text-sm tracking-wide text-text-muted">
                    {copy.customer[field]}
                    <span className="ml-2 text-xs">{copy.customer.required}</span>
                  </label>
                  <input
                    id={field}
                    name={field}
                    type={field === "email" ? "email" : field === "phone" ? "tel" : "text"}
                    autoComplete={field === "phone" ? "tel" : field}
                    value={customer[field]}
                    onChange={(e) => setCustomer({ ...customer, [field]: e.target.value })}
                    aria-invalid={fieldErrors.includes(field)}
                    aria-describedby={fieldErrors.includes(field) ? `${field}-error` : undefined}
                    className={fieldClass}
                  />
                  {errorText(field)}
                </div>
              ))}
              <div>
                <label htmlFor="note" className="mb-2 block text-sm tracking-wide text-text-muted">
                  {copy.customer.note}
                </label>
                <textarea
                  id="note"
                  name="note"
                  rows={4}
                  value={customer.note}
                  placeholder={copy.customer.notePlaceholder}
                  onChange={(e) => setCustomer({ ...customer, note: e.target.value })}
                  aria-invalid={fieldErrors.includes("note")}
                  className={`${fieldClass} resize-none`}
                />
                {errorText("note")}
              </div>
              <div className="flex flex-col-reverse justify-center gap-4 pt-4 sm:flex-row">
                <button type="button" className="btn-secondary" onClick={() => go(1)}>
                  {copy.back}
                </button>
                <button type="submit" className="btn-primary">
                  {copy.next}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* 4. 確認（最終確認の画面。料金・支払いの時期・キャンセルの条件をここで見せる） */}
        {step === 3 && service && option && date && time && (
          <div className="mx-auto max-w-2xl">
            <StepHeading title={copy.confirm.heading} lead={copy.confirm.lead} />
            <dl className="border-t border-border">
              {[
                [copy.confirm.service, service.name],
                [copy.confirm.plan, `${option.name}（${copy.plan.duration(option.durationMinutes)}）`],
                [copy.confirm.datetime, `${formatDateString(date, locale)} ${time}〜`],
                [copy.confirm.people, peopleLabel(people)],
                [copy.confirm.amount, formatYen(amount)],
                [copy.confirm.payment, copy.confirm.paymentValue],
                [copy.confirm.name, customer.name],
                [copy.confirm.email, customer.email],
                [copy.confirm.phone, customer.phone],
                ...(customer.note ? [[copy.confirm.note, customer.note]] : []),
              ].map(([label, value]) => (
                <div key={label} className="grid grid-cols-3 gap-4 border-b border-border py-4">
                  <dt className="text-sm text-text-muted">{label}</dt>
                  <dd className="col-span-2 whitespace-pre-wrap text-sm text-text">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 bg-surface p-6">
              <h3 className="mb-3 text-sm font-medium text-text">{copy.confirm.policyTitle}</h3>
              <ul className="space-y-2 text-xs leading-6 text-text-muted">
                {copy.confirm.policy.map((p) => (
                  <li key={p}>・{p}</li>
                ))}
              </ul>
              <Link
                href={`/${locale}/legal/tokushoho`}
                className="mt-3 inline-block text-xs text-text underline decoration-border underline-offset-4 hover:decoration-text"
              >
                {copy.confirm.legalLink}
              </Link>
              <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm text-text">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 accent-[var(--color-text)]"
                />
                {copy.confirm.agree}
              </label>
            </div>

            <div className="mt-10 flex flex-col-reverse justify-center gap-4 sm:flex-row">
              <button type="button" className="btn-secondary" onClick={() => go(2)} disabled={submitting}>
                {copy.back}
              </button>
              <button type="button" className="btn-primary" onClick={submit} disabled={!agreed || submitting}>
                {submitting ? copy.confirm.submitting : copy.confirm.submit}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
