"use client";

import { Minus, Plus } from "lucide-react";

/** 細い線の数量（− 1 ＋）。商品ページとカートで使う */
export default function QuantityStepper({
  value,
  max,
  onChange,
  locale,
  size = "md",
  label,
}: {
  value: number;
  max: number;
  onChange: (value: number) => void;
  locale: "ja" | "en";
  size?: "md" | "sm";
  /** まとまりの名前（読み上げ用）。既定は「数量」 */
  label?: string;
}) {
  const en = locale === "en";
  const disabled = max <= 0;
  const step = `flex h-full items-center justify-center text-text-muted transition-colors hover:text-text disabled:cursor-not-allowed disabled:opacity-30 ${
    size === "sm" ? "w-9" : "w-12"
  }`;
  return (
    <div
      className={`flex items-center border border-border ${size === "sm" ? "h-10" : "h-14"}`}
      role="group"
      aria-label={label ?? (en ? "Quantity" : "数量")}
    >
      <button
        type="button"
        className={step}
        onClick={() => onChange(value - 1)}
        disabled={disabled || value <= 1}
        aria-label={en ? "Decrease quantity" : "数を減らす"}
      >
        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      <output aria-live="polite" className={`text-center text-sm tabular-nums text-text ${size === "sm" ? "w-7" : "w-8"}`}>
        {disabled ? 0 : value}
      </output>
      <button
        type="button"
        className={step}
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label={en ? "Increase quantity" : "数を増やす"}
      >
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
