import "server-only";
import Stripe from "stripe";

let client: Stripe | null = null;

/** Stripe（DMC のアカウント）。手元とプレビューはテスト用の鍵（sk_test_）を入れる */
export function stripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY を設定してください");
  client = new Stripe(key);
  return client;
}

/** Stripe の Checkout の有効期限（分）。Stripe の最短は 30 分で、時計のずれで下回ると断られるので 1 分足す */
export const CHECKOUT_MINUTES = 31;
/** 枠・在庫の仮押さえ（分）。Stripe の期限より少し長くして、期限ぎりぎりに払った人の枠を先に外さない */
export const HOLD_MINUTES = CHECKOUT_MINUTES + 1;

/** Checkout のセッションの PaymentIntent の ID（文字列のときと、展開されたオブジェクトのときがある） */
export function paymentIntentId(session: Stripe.Checkout.Session): string | null {
  const pi = session.payment_intent;
  return typeof pi === "string" ? pi : (pi?.id ?? null);
}
