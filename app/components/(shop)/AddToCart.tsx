"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { addToCart, MAX_QUANTITY } from "@/lib/shop/cart";
import { useCart, writeCart } from "./cart-store";
import QuantityStepper from "./QuantityStepper";

/** 「カートに入れました」をボタンに出しておく時間 */
const ADDED_MS = 2200;

/**
 * 商品ページの「カートに入れる」。細い線の数量（− 1 ＋）とボタンを 1 行に並べる。
 * 入れたときはボタンの文字が静かに「カートに入れました」へ替わり、下に「カートを見る」が浮かぶ
 * （場所は先に空けておき、ほかの部分を動かさない）。在庫より多くは入れられない
 */
export default function AddToCart({ productId, stock, locale }: { productId: string; stock: number; locale: "ja" | "en" }) {
  const isJa = locale === "ja";
  const lines = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const inCart = lines.find((l) => l.productId === productId)?.quantity ?? 0;
  const max = Math.min(MAX_QUANTITY, stock - inCart);
  const count = Math.max(1, Math.min(quantity, max));

  if (stock <= 0) {
    return (
      <p className="flex h-14 items-center justify-center border border-border text-[13px] tracking-[0.22em] text-text-muted">
        {isJa ? "売り切れ" : "Sold out"}
      </p>
    );
  }

  const add = () => {
    writeCart(addToCart(lines, productId, count));
    setQuantity(1);
    setAdded(true);
    setJustAdded(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setJustAdded(false), ADDED_MS);
  };

  const swap = "transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none";
  const label = max <= 0 ? (isJa ? "在庫の分はカートに入っています" : "All stock is in your cart") : isJa ? "カートに入れる" : "Add to cart";

  return (
    <div className="space-y-4">
      <div className="flex h-14 gap-3">
        <QuantityStepper value={count} max={max} onChange={setQuantity} locale={locale} />
        <button type="button" className="btn-primary relative h-full min-h-0 flex-1 overflow-hidden px-6" disabled={max <= 0} onClick={add}>
          <span className={`${swap} ${justAdded ? "-translate-y-3 opacity-0" : "translate-y-0 opacity-100"}`}>{label}</span>
          <span
            aria-hidden="true"
            className={`absolute inset-0 flex items-center justify-center gap-2 ${swap} ${justAdded ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}
          >
            <Check className="h-3.5 w-3.5" strokeWidth={1.5} />
            {isJa ? "カートに入れました" : "Added to cart"}
          </span>
        </button>
      </div>

      <p role="status" className="sr-only">
        {justAdded ? (isJa ? "カートに入れました" : "Added to cart") : ""}
      </p>

      {/* 入れたあとに浮かぶ案内。場所は先に空けておく */}
      <div
        aria-hidden={!added}
        className={`flex min-h-5 items-center justify-between text-xs text-text-muted transition-[opacity,transform] duration-700 ease-out motion-reduce:transition-none ${
          added ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        }`}
      >
        <span>{isJa ? `カートに ${inCart}点` : `${inCart} in your cart`}</span>
        <Link
          href={`/${locale}/cart`}
          tabIndex={added ? undefined : -1}
          className="group inline-flex items-center gap-2 tracking-[0.18em] text-text"
        >
          {isJa ? "カートを見る" : "View cart"}
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} />
        </Link>
      </div>

      {stock <= 3 && <p className="text-xs text-text-muted">{isJa ? `残り${stock}点` : `Only ${stock} left`}</p>}
    </div>
  );
}
