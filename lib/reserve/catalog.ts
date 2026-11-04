/**
 * 予約の画面に出すサービスは、ページの言語で決める。
 * 着物の撮影は、日本のお客さまには「花夢」、海外のお客さまには「CAMU」（英語のプラン）として受けているので、
 * 日本語のページは花夢、英語のページは CAMU だけを出す。Chloe はどちらにも出す
 */
const KIMONO: Record<"ja" | "en", { shown: string; hidden: string }> = {
  ja: { shown: "hanayume", hidden: "camu" },
  en: { shown: "camu", hidden: "hanayume" },
};

function kimonoFor(locale: string) {
  return KIMONO[locale === "en" ? "en" : "ja"];
}

export function servicesForLocale<S extends { id: string }>(services: S[], locale: string): S[] {
  const { hidden } = kimonoFor(locale);
  return services.filter((s) => s.id !== hidden);
}

/** ほかの言語の着物のサービスを指す ?service=（日本語の CAMU のページの「予約する」など）を、この言語のものに読み替える */
export function serviceIdForLocale(id: string | undefined, locale: string): string | undefined {
  const { shown, hidden } = kimonoFor(locale);
  return id === hidden ? shown : id;
}
