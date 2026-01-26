"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

export default function IntroHeader() {
  const locale = useLocale();

  const content = {
    ja: {
      title: "Service",
      subtitle: "プロフェッショナルな撮影スタジオで、特別な瞬間を記録できます",
    },
    en: {
      title: "Services",
      subtitle:
        "Capture special moments in our professional photography studio",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;
  const reservationUrl =
    locale === "ja"
      ? "https://dmcfuji0823.wixsite.com/reservation"
      : "https://dmcfuji0823.wixsite.com/reservation/en";

  return (
    <section className="bg-[#faf8f4] py-16 md:py-20">
      <div className="mx-auto max-w-[1120px] px-6 md:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <h1 className="font-['Noto_Sans_JP'] text-3xl font-semibold tracking-tight text-[#2C2C2C] md:text-5xl">
              {t.title}
            </h1>
            <p className="text-[15px] leading-7 text-[#5A5A5A] md:text-base">
              {t.subtitle}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
