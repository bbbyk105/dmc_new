import type { Metadata } from "next";
import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import Breadcrumb from "@/app/components/Breadcrumb";
import JsonLd from "@/app/components/JsonLd";
import ReserveFlow from "@/app/components/(reserve)/ReserveFlow";
import ReserveFlowFromUrl from "@/app/components/(reserve)/ReserveFlowFromUrl";
import type { ReserveService } from "@/app/components/(reserve)/types";
import { getActiveServices } from "@/lib/db/reserve";
import { servicesForLocale } from "@/lib/reserve/catalog";
import { isBuildPhase } from "@/lib/build-phase";
import { buildBreadcrumbSchema, buildPageMeta, getSiteUrl } from "@/lib/seo";
import { TELEPHONE_DISPLAY } from "@/lib/site-info";

// 静的に生成し、5 分ごとに作り直す（管理画面で料金・受付を変えたときは、その場で作り直す）。
// 空き状況は画面から API で読むので、ここには載せない
export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa ? "ご予約 | DMC FUJI 着物撮影・レンタルスタジオ" : "Reservation | DMC FUJI Kimono Photo Experience",
    description: isJa
      ? "静岡県富士市のDMC FUJIのオンライン予約。着物撮影「花夢」とレンタルスタジオChloeの空き状況を見て、そのままカードでお支払いいただけます。"
      : "Book DMC FUJI online. Check availability for the CAMU kimono photo experience and the Chloe rental studio, and pay by card.",
    locale,
    canonicalPath: `/${locale}/reserve`,
  });
}

export default async function ReservePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = locale === "en" ? "en" : "ja";
  const isJa = lang === "ja";
  const siteUrl = getSiteUrl();

  let services: ReserveService[] = [];
  let failed = false;
  try {
    // 着物の撮影は、日本語は花夢、英語は CAMU だけを出す
    services = servicesForLocale(await getActiveServices(), lang).map((s) => ({
      id: s.id,
      name: isJa ? s.name_ja : s.name_en,
      summary: isJa ? s.summary_ja : s.summary_en,
      leadHours: s.lead_hours,
      maxAdvanceDays: s.max_advance_days,
      options: s.service_options.map((o) => ({
        id: o.id,
        name: isJa ? o.name_ja : o.name_en,
        summary: isJa ? o.summary_ja : o.summary_en,
        durationMinutes: o.duration_minutes,
        price: o.price,
        extraPersonPrice: o.extra_person_price,
        maxPeople: o.max_people,
      })),
    }));
  } catch (error) {
    // 作り直しのときは投げて、前の正常なページを残す。ビルドのときだけ電話の案内で通す
    if (!isBuildPhase()) throw error;
    console.error("[reserve] サービスを読めませんでした", error);
    failed = true;
  }

  const breadcrumb = buildBreadcrumbSchema([
    { name: isJa ? "ホーム" : "Home", url: `${siteUrl}/${locale}` },
    { name: isJa ? "ご予約" : "Reservation", url: `${siteUrl}/${locale}/reserve` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      <Breadcrumb
        items={[
          { name: isJa ? "ホーム" : "Home", href: `/${locale}` },
          { name: isJa ? "ご予約" : "Reservation" },
        ]}
      />
      <section className="border-b border-border py-16 md:py-20">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <h1 className="mb-6 font-serif text-4xl font-light tracking-wide text-text md:text-5xl">
            {isJa ? "ご予約" : "Reservation"}
          </h1>
          <div className="mx-auto mb-6 h-px w-16 bg-text" />
          <p className="text-base text-text-muted">
            {isJa
              ? "空き状況を見てプランと日時を選び、そのままカードでお支払いいただけます"
              : "Check availability, choose your plan and time, and pay by card"}
          </p>
        </div>
      </section>
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-6 lg:px-12">
          {failed || services.length === 0 ? (
            <p className="mx-auto max-w-xl text-center text-sm leading-7 text-text-muted">
              {isJa
                ? `ただいまオンラインのご予約を受け付けられません。お手数ですが、お電話（${TELEPHONE_DISPLAY}、11:00〜17:00、水曜定休）でご予約ください。`
                : `Online booking is not available right now. Please call us at ${TELEPHONE_DISPLAY} (11:00–17:00 JST, closed Wednesdays).`}
            </p>
          ) : (
            <Suspense fallback={<ReserveFlow locale={lang} services={services} />}>
              <ReserveFlowFromUrl locale={lang} services={services} />
            </Suspense>
          )}
        </div>
      </section>
    </>
  );
}
