/** Stripe の住所（Stripe.Address と同じ形） */
export type ShippingAddress = {
  country?: string | null;
  postal_code?: string | null;
  state?: string | null;
  city?: string | null;
  line1?: string | null;
  line2?: string | null;
};

/**
 * お届け先の住所を 1 行にする。日本は「都道府県 市区町村 番地」（郵便番号は別に持つ）。
 * 海外は向こうの宛名の書き方（番地, 市 州 郵便番号, 国名）にして、そのまま送り状に書けるようにする
 */
export function formatShippingAddress(address: ShippingAddress | null | undefined): string {
  if (!address) return "";
  if (!address.country || address.country === "JP") {
    return [address.state, address.city, address.line1, address.line2].filter(Boolean).join(" ");
  }
  const country = new Intl.DisplayNames(["en"], { type: "region" }).of(address.country) ?? address.country;
  return [
    address.line1,
    address.line2,
    [address.city, address.state, address.postal_code].filter(Boolean).join(" "),
    country,
  ]
    .filter(Boolean)
    .join(", ");
}

/** メール・管理画面に出すお届け先。海外の住所には郵便番号も入っているので、〒を付けない */
export function shippingAddressLabel(order: { shipping_postal_code: string; shipping_address: string; overseas: boolean }): string {
  return order.overseas ? order.shipping_address : `〒${order.shipping_postal_code} ${order.shipping_address}`;
}
