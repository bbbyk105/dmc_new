"use client";

import { useEffect } from "react";
import { writeCart } from "./cart-store";

/** 注文が済んだら、カートを空にする（完了ページに置く） */
export default function ClearCart() {
  useEffect(() => {
    writeCart([]);
  }, []);
  return null;
}
