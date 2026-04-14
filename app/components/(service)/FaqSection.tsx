"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import { faqContent } from "@/lib/faq-data";

export default function FaqSection() {
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const t = faqContent[locale as keyof typeof faqContent] || faqContent.ja;

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1120px] px-6 md:px-8">
        <h2 className="mb-16 text-center font-['Noto_Sans_JP'] text-2xl font-semibold text-[#2C2C2C] md:text-3xl">
          {t.title}
        </h2>
        <div className="mx-auto max-w-3xl space-y-1">
          {t.items.map((item, index) => (
            <div
              key={index}
              className="border-b border-[rgba(0,0,0,0.08)] last:border-b-0"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between py-5 md:py-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2C2C] focus-visible:ring-offset-2 transition-opacity duration-150 hover:opacity-70"
                aria-expanded={openIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                <span className="font-['Noto_Sans_JP'] text-lg font-semibold text-[#2C2C2C] pr-4">
                  {item.question}
                </span>
                <span
                  className={`text-[#2C2C2C] text-xl transition-transform duration-150 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                >
                  +
                </span>
              </button>
              {openIndex === index && (
                <div id={`faq-answer-${index}`} className="pb-5 md:pb-6">
                  <p className="text-[15px] leading-7 text-[#5A5A5A]">
                    {item.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
