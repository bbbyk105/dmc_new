"use client";

import { useSyncExternalStore } from "react";
import { parseCart, type CartLine } from "@/lib/shop/cart";

/** カートの中身（商品 ID と数だけ）を localStorage に持つ。ほかのタブで変えても追いつく */
const KEY = "dmc-cart";
const EMPTY: CartLine[] = [];
const listeners = new Set<() => void>();
let cache: { raw: string | null; lines: CartLine[] } = { raw: null, lines: EMPTY };

function read(): CartLine[] {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(KEY);
  } catch {
    return EMPTY;
  }
  if (raw !== cache.raw) {
    let parsed: unknown = [];
    try {
      parsed = raw ? JSON.parse(raw) : [];
    } catch {
      parsed = [];
    }
    cache = { raw, lines: parseCart(parsed) };
  }
  return cache.lines;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function writeCart(lines: CartLine[]) {
  try {
    if (lines.length === 0) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    // プライベートブラウズなどで保存できないときは、何もしない
  }
  listeners.forEach((l) => l());
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}
