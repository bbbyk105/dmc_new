/**
 * お届け先はページの言語で決める（カートでは選ばせない）。
 * 日本語のページは日本国内（国内の送料）、英語のページはオーストラリアだけ（海外の一律の送料）
 */
export type ShopDestination = { overseas: boolean; country: "JP" | "AU" };

export function destinationFor(locale: string | undefined): ShopDestination {
  return locale === "en" ? { overseas: true, country: "AU" } : { overseas: false, country: "JP" };
}
