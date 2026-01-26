"use client";

import Link from "next/link";
import { useLocale } from "next-intl";

export default function FinalCtaSection() {
  const locale = useLocale();

  const content = {
    ja: {
      primaryCta: "予約する",
      secondaryCta: "お問い合わせ",
      contactUrl: "/contact",
    },
    en: {
      primaryCta: "Book Now",
      secondaryCta: "Contact Us",
      contactUrl: "/en/contact",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;
  const reservationUrl =
    locale === "ja"
      ? "https://dmcfuji0823.wixsite.com/reservation"
      : "https://dmcfuji0823.wixsite.com/reservation/en";

  return (
    <section className="bg-[#2C2C2C] py-16 md:py-20">
      <div className="mx-auto max-w-[1120px] px-6 md:px-8">
        <div className="flex flex-col items-center gap-6 md:flex-row md:justify-center">
          <Link href={reservationUrl}>
            <button className="w-full min-h-[44px] rounded-2xl border-2 border-white bg-white px-8 py-3 text-sm font-semibold uppercase tracking-wider text-[#2C2C2C] transition-all duration-150 hover:bg-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2C2C2C] md:w-auto">
              {t.primaryCta}
            </button>
          </Link>
          <Link href={t.contactUrl}>
            <button className="w-full min-h-[44px] rounded-2xl border-2 border-white bg-transparent px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-150 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#2C2C2C] md:w-auto">
              {t.secondaryCta}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
