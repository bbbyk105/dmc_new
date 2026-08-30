"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { TELEPHONE_DISPLAY, TELEPHONE_E164 } from "@/lib/site-info";

/**
 * 最後のひと押し。生成りの余白に一文と予約ボタンだけを置く。
 */
export default function CtaSection() {
  const locale = useLocale();
  const isJa = locale === "ja";

  return (
    <section className="bg-[#F5F1E8] py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8 }}
        className="mx-auto max-w-[720px] px-5 text-center md:px-6"
      >
        <p className="font-serif text-[11px] uppercase tracking-[0.34em] text-[#8B7355]">
          Reservation
        </p>
        <h2 className="mt-7 font-mincho text-[clamp(1.4rem,3.2vw,2rem)] font-medium leading-[1.8] tracking-[0.08em] text-[#2C2418]">
          {isJa
            ? "撮影日が決まったら、まずはご相談ください。"
            : "Have a date in mind? Let's start there."}
        </h2>
        <p className="mt-5 font-['Noto_Sans_JP'] text-sm leading-8 tracking-[0.02em] text-[#5A5245]">
          {isJa
            ? "撮影のご予約・ご相談はお気軽にどうぞ。日程やロケーションのご希望に合わせてご提案します。"
            : "Booking and consultation are always welcome — we will plan around your dates and preferred locations."}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-5 sm:flex-row sm:gap-8">
          <a
            href="https://dmcfuji0823.wixsite.com/reservation/en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#2C2418] px-11 py-4 font-['Noto_Sans_JP'] text-[13px] font-medium tracking-[0.22em] text-[#F5F1E8] transition-colors duration-300 hover:bg-[#8B7355]"
          >
            {isJa ? "ご予約はこちら" : "Reserve a Session"}
          </a>
          <Link
            href={`/${locale}/contact`}
            className="inline-block border-b border-[#8B7355]/40 pb-1.5 font-['Noto_Sans_JP'] text-[13px] tracking-[0.22em] text-[#8B7355] transition-colors duration-300 hover:border-[#2C2418] hover:text-[#2C2418]"
          >
            {isJa ? "お問い合わせ" : "Contact Us"}
          </Link>
        </div>
        <p className="mt-8 font-['Noto_Sans_JP'] text-xs tracking-wider text-[#8B7355]">
          <a
            href={`tel:${TELEPHONE_E164}`}
            className="transition-colors hover:text-[#2C2418]"
          >
            {TELEPHONE_DISPLAY}
          </a>
          <span className="mx-3 text-[#C9A97C]" aria-hidden="true">
            /
          </span>
          11:00–17:00{isJa ? "（水曜定休）" : " (Closed Wed.)"}
        </p>
      </motion.div>
    </section>
  );
}
