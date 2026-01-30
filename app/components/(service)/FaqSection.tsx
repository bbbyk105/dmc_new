"use client";

import { useLocale } from "next-intl";
import { useState } from "react";

export default function FaqSection() {
  const locale = useLocale();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const content = {
    ja: {
      title: "よくある質問",
      items: [
        {
          question: "キャンセルはできますか？",
          answer:
            "はい、キャンセルは可能です。キャンセルをご希望の場合は、撮影日の2日前までにご連絡ください。",
        },
        {
          question: "持ち物はありますか？",
          answer:
            "着物用肌着をご用意ください（DMCで ¥3,000で購入できます）。着物や小物はすべてスタジオでご用意しております。",
        },
        {
          question: "撮影時間はどのくらいですか？",
          answer:
            "プランによって異なりますが、通常は1時間から4時間程度です。詳細は各プランのページをご確認ください。",
        },
        {
          question: "写真の納品方法を教えてください",
          answer:
            "撮影データはオンラインでお届けします。ダウンロードリンクをメールでお送りいたします。",
        },
        {
          question: "雨天の場合はどうなりますか？",
          answer:
            "屋外撮影の場合、雨天時はスタジオ撮影に変更となります。天候による変更は前日までにご連絡いたします。",
        },
      ],
    },
    en: {
      title: "FAQ",
      items: [
        {
          question: "Can I cancel my reservation?",
          answer:
            "Yes, cancellations are possible. Please contact us at least 2 days before your scheduled session.",
        },
        {
          question: "What should I bring?",
          answer:
            "Please bring kimono underwear (available for purchase at DMC for ¥3,000). All ceremonial kimonos and accessories are provided at the studio.",
        },
        {
          question: "How long does a session take?",
          answer:
            "It varies by plan, but typically ranges from 1 to 4 hours. Please check each plan page for details.",
        },
        {
          question: "How are photos delivered?",
          answer:
            "Photo data is delivered online. We will send you a download link via email.",
        },
        {
          question: "What happens if it rains?",
          answer:
            "For outdoor shoots, we will switch to studio photography in case of rain. We will notify you of any weather-related changes by the day before.",
        },
      ],
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

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
