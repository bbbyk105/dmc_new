import { NextRequest, NextResponse } from "next/server";
import { getMonthAvailability, getService } from "@/lib/db/reserve";
import { isMonthString } from "@/lib/reserve/schedule";
import { isUuid } from "@/lib/reserve/validate";

/**
 * 月の、日ごとの状態（空きあり・満席・休み）と時間の枠（予約可・満席）。
 * GET /api/reserve/availability?service=camu&option=<uuid>&month=2026-11
 * → { days: { "2026-11-02": { status: "open", slots: [{ time: "11:00", status: "available" }, ...] }, ... } }
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const serviceId = params.get("service") ?? "";
  const optionId = params.get("option") ?? "";
  const month = params.get("month") ?? "";
  if (!/^[a-z0-9-]{1,40}$/.test(serviceId) || !isUuid(optionId) || !isMonthString(month)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const service = await getService(serviceId);
  const option = service?.service_options.find((o) => o.id === optionId);
  if (!service || !option) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const days = await getMonthAvailability(service, option, month);
  return NextResponse.json({ days }, { headers: { "Cache-Control": "no-store" } });
}
