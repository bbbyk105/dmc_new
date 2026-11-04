import Stripe from "stripe";

/** Webhook の署名を作る・確かめるための、テストだけの鍵（e2e.config.ts がアプリに渡す） */
export const E2E_WEBHOOK_SECRET = "whsec_e2e_only_not_a_real_secret";

/** Stripe から届くのと同じ形の、署名つきの Webhook を作る（Stripe には繋がない） */
export function signedEvent(type: string, object: Record<string, unknown>, secret = E2E_WEBHOOK_SECRET) {
  const payload = JSON.stringify({
    id: `evt_e2e_${Date.now()}`,
    object: "event",
    type,
    api_version: "2026-10-28.endive",
    created: Math.floor(Date.now() / 1000),
    data: { object },
  });
  const signature = new Stripe("sk_test_e2e_dummy").webhooks.generateTestHeaderString({ payload, secret });
  return { payload, signature };
}
