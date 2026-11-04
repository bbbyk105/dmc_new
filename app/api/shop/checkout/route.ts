import { NextRequest, NextResponse } from "next/server";
import { startOrderCheckout } from "@/lib/checkout/order";

/** 注文の支払いを始める。在庫を仮押さえして、Stripe Checkout の URL を返す */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const result = await startOrderCheckout(body, { origin: request.nextUrl.origin, headers: request.headers });
    if (!result.ok) {
      return NextResponse.json({ error: result.error, productId: result.productId }, { status: result.status });
    }
    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("[shop] 支払いを始められませんでした", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
