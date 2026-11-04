/**
 * カート。中身はブラウザ（localStorage）に商品 ID と数だけを持ち、値段と在庫は毎回データベースの値で出し直す。
 * 支払いの金額はデータベースの hold_order が決める（ここは画面の表示用で、同じ計算をする）。
 *
 * Next に依存しない（cart.test.mjs が node --test で直接読む）。
 */

export type CartLine = { productId: string; quantity: number };

export type CartProduct = {
  id: string;
  price: number;
  stock: number;
  active: boolean;
};

export type ShippingRule = {
  shippingFee: number;
  /** この金額以上で送料無料（null なら無料にしない。海外には当てない） */
  freeShippingThreshold: number | null;
  /** 海外への一律の送料 */
  overseasShippingFee: number;
};

export const MAX_QUANTITY = 99;
const MAX_LINES = 50;

/** localStorage から読んだ値を、正しいカートの中身にする。同じ商品はまとめ、数は 1〜99 に収める */
export function parseCart(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  const merged = new Map<string, number>();
  for (const line of raw) {
    if (!line || typeof line !== "object") continue;
    const { productId, quantity } = line as Record<string, unknown>;
    if (typeof productId !== "string" || productId.length === 0 || productId.length > 64) continue;
    if (typeof quantity !== "number" || !Number.isInteger(quantity) || quantity < 1) continue;
    merged.set(productId, Math.min(MAX_QUANTITY, (merged.get(productId) ?? 0) + quantity));
  }
  return [...merged].slice(0, MAX_LINES).map(([productId, quantity]) => ({ productId, quantity }));
}

/** 商品を足す（もう入っていれば数を足す） */
export function addToCart(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  return parseCart([...lines, { productId, quantity }]);
}

/** 数を変える（0 以下なら外す） */
export function setQuantity(lines: CartLine[], productId: string, quantity: number): CartLine[] {
  if (quantity < 1) return lines.filter((l) => l.productId !== productId);
  return lines.map((l) =>
    l.productId === productId ? { ...l, quantity: Math.min(MAX_QUANTITY, Math.floor(quantity)) } : l,
  );
}

/** 送料（データベースの hold_order と同じ計算）。海外は一律の海外送料 */
export function shippingFeeFor(subtotal: number, rule: ShippingRule, overseas = false): number {
  if (overseas) return rule.overseasShippingFee;
  if (rule.freeShippingThreshold !== null && subtotal >= rule.freeShippingThreshold) return 0;
  return rule.shippingFee;
}

/**
 * カートの金額。売っていない商品・在庫が足りない商品は problem を付けて、合計には入れない
 * （そのまま支払いに進むと hold_order が在庫切れで断るので、先に画面で直してもらう）
 */
export function cartSummary<P extends CartProduct>(lines: CartLine[], products: P[], rule: ShippingRule, overseas = false) {
  const byId = new Map(products.map((p) => [p.id, p]));
  const items = lines.map((line) => {
    const product = byId.get(line.productId);
    const problem: "unavailable" | "short" | null =
      !product || !product.active || product.stock === 0
        ? "unavailable"
        : product.stock < line.quantity
          ? "short"
          : null;
    return {
      line,
      product: product ?? null,
      problem,
      lineTotal: product && problem === null ? product.price * line.quantity : 0,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const purchasable = items.some((item) => item.problem === null);
  const shipping = purchasable ? shippingFeeFor(subtotal, rule, overseas) : 0;
  return {
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    canCheckout: purchasable && items.every((item) => item.problem === null),
  };
}
