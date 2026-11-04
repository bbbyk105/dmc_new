"use client";

import { useSearchParams } from "next/navigation";
import { serviceIdForLocale } from "@/lib/reserve/catalog";
import ReserveFlow from "./ReserveFlow";
import type { ReserveService } from "./types";

/**
 * URL の ?service=（サービスのページから来たとき）と ?release=（Stripe の画面から戻ったとき）を読んで予約の流れに渡す。
 * 日本語のページで ?service=camu なら花夢、英語のページで ?service=hanayume なら CAMU に読み替える。
 * ページを静的に生成するため、URL はブラウザ側で読む（page.tsx が Suspense で包む）
 */
export default function ReserveFlowFromUrl(props: { locale: "ja" | "en"; services: ReserveService[] }) {
  const params = useSearchParams();
  const service = serviceIdForLocale(params.get("service") ?? undefined, props.locale);
  return <ReserveFlow key={service ?? ""} {...props} initialServiceId={service} releaseToken={params.get("release") ?? undefined} />;
}
