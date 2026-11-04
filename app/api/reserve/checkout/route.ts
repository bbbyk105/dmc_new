import { NextRequest, NextResponse } from "next/server";
import { startBookingCheckout } from "@/lib/checkout/booking";

/** 予約の支払いを始める。枠を仮押さえして、Stripe Checkout の URL を返す */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const result = await startBookingCheckout(body, { origin: request.nextUrl.origin, headers: request.headers });
    if (!result.ok) {
      return NextResponse.json({ error: result.error, fields: result.fields }, { status: result.status });
    }
    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error("[reserve] 支払いを始められませんでした", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
