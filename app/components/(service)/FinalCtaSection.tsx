"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

export default function FinalCtaSection() {
  const locale = useLocale();

  const content = {
    ja: {
      primaryCta: "予約する",
      secondaryCta: "お問い合わせ",
    },
    en: {
      primaryCta: "Book Now",
      secondaryCta: "Contact Us",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;
  const contactUrl = `/${locale}/contact`;
  const reservationUrl =
    locale === "ja"
      ? "https://dmcfuji0823.wixsite.com/reservation"
      : "https://dmcfuji0823.wixsite.com/reservation/en";

  return (
    <section className="bg-background py-16 md:py-20">
      <div className="mx-auto max-w-[1120px] px-6 md:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
          <Link href={reservationUrl}>
            <button className="btn-primary w-full md:w-auto">
              {t.primaryCta}
            </button>
          </Link>
          <Link href={contactUrl}>
            <button className="btn-secondary w-full md:w-auto">
              {t.secondaryCta}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
