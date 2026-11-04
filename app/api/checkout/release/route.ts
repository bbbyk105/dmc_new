import { NextRequest, NextResponse } from "next/server";
import { releaseBookingHold } from "@/lib/checkout/booking";
import { releaseOrderHold } from "@/lib/checkout/order";

/**
 * Stripe の画面から戻ってきた人の仮押さえを外す（予約の枠・注文の在庫）。
 * 戻り先の URL（cancel_url）に載せた鍵だけで外せる。鍵は推測できない長さにしてある
 */
export async function POST(request: NextRequest) {
  let body: { kind?: unknown; token?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }
  const token = typeof body.token === "string" ? body.token : "";
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(token) || (body.kind !== "booking" && body.kind !== "order")) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const released = body.kind === "booking" ? await releaseBookingHold(token) : await releaseOrderHold(token);
    return NextResponse.json({ released });
  } catch (error) {
    console.error("[checkout] 仮押さえを外せませんでした", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
