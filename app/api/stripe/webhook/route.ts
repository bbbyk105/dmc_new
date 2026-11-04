import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { completeBookingSession, expireBookingSession } from "@/lib/checkout/booking";
import { completeOrderSession, expireOrderSession } from "@/lib/checkout/order";

/**
 * Stripe の Webhook。Stripe の管理画面で、この URL に次のイベントを送るように登録する:
 *   checkout.session.completed / checkout.session.expired
 * 署名（STRIPE_WEBHOOK_SECRET）を確かめてから処理する。失敗したら 500 を返し、Stripe に送り直してもらう
 * （確定の処理は何度呼ばれても一度だけ効く）
 */
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(payload, signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.metadata?.kind === "booking") await completeBookingSession(session);
        if (session.metadata?.kind === "order") await completeOrderSession(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;
        if (session.metadata?.kind === "booking") await expireBookingSession(session.id);
        if (session.metadata?.kind === "order") await expireOrderSession(session.id);
        break;
      }
    }
  } catch (error) {
    console.error(`[stripe] ${event.type} を処理できませんでした`, error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
