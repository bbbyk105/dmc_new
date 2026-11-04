"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "./cart-store";

/** ショップのページに出すカートへのリンク（入っている数つき） */
export default function CartLink({ locale }: { locale: "ja" | "en" }) {
  const count = useCart().reduce((sum, l) => sum + l.quantity, 0);
  const label = locale === "ja" ? "カート" : "Cart";
  return (
    <Link
      href={`/${locale}/cart`}
      className="inline-flex items-center gap-2 text-sm text-text transition-colors hover:text-ink-soft"
      aria-label={`${label} (${count})`}
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
      {label}
      <span className="tabular-nums text-text-muted">({count})</span>
    </Link>
  );
}
