import type { ReactNode } from "react";
import type { BookingStatus, OrderStatus } from "@/lib/db/types";

/** 管理画面の共通の部品 */

export const inputClass =
  "w-full border border-border bg-surface px-3 py-2 text-sm text-text focus:border-text focus:outline-none";
export const labelClass = "mb-1 block text-xs text-text-muted";

export const BOOKING_STATUS: Record<BookingStatus, string> = {
  pending: "支払い中",
  confirmed: "確定",
  cancelled: "取消",
  expired: "期限切れ",
};

export const ORDER_STATUS: Record<OrderStatus, string> = {
  pending: "支払い中",
  paid: "未発送",
  shipped: "発送済み",
  cancelled: "取消",
  expired: "期限切れ",
};

export const RESOURCE_LABEL: Record<string, string> = {
  kimono: "着物（CAMU・花夢）",
  chloe: "Chloe（2階スタジオ）",
};

export function PageTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
      <h1 className="font-serif text-2xl text-text">{children}</h1>
      {action}
    </div>
  );
}

/** Server Action の結果（?done= / ?error=） */
export function Flash({ done, error }: { done?: string; error?: string }) {
  if (!done && !error) return null;
  return (
    <p
      role="status"
      className={`mb-6 border-l p-4 text-sm ${error ? "border-text bg-text text-background" : "border-text bg-surface text-text"}`}
    >
      {error ?? done}
    </p>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10 border border-border bg-surface p-6">
      <h2 className="mb-4 text-sm font-medium text-text">{title}</h2>
      {children}
    </section>
  );
}

export function Rows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="divide-y divide-border text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="grid grid-cols-3 gap-4 py-2">
          <dt className="text-text-muted">{label}</dt>
          <dd className="col-span-2 whitespace-pre-wrap text-text">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

export type FlashParams = Promise<{ done?: string; error?: string }>;
