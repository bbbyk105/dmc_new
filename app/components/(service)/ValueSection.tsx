"use client";

import { useLocale } from "next-intl";

export default function ValueSection() {
  const locale = useLocale();

  const content = {
    ja: {
      items: [
        {
          title: "衣装",
          description: "伝統的な着物からモダンなスタイルまで、豊富な衣装をご用意しています",
        },
        {
          title: "撮影",
          description: "プロフェッショナルな照明とスタジオで、最高の一枚を撮影できます",
        },
        {
          title: "空間",
          description: "落ち着いたスタジオ空間で、リラックスして撮影をお楽しみください",
        },
      ],
    },
    en: {
      items: [
        {
          title: "Costumes",
          description: "From traditional ceremonial kimonos to modern styles, we offer a wide selection of costumes",
        },
        {
          title: "Photography",
          description: "Professional lighting and studio to capture your perfect moment",
        },
        {
          title: "Space",
          description: "Relax and enjoy your session in our calm studio space",
        },
      ],
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1120px] px-6 md:px-8">
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {t.items.map((item, index) => (
            <div
              key={index}
              className={`space-y-3 ${
                index > 0 && index < t.items.length
                  ? "md:border-l md:border-[rgba(0,0,0,0.08)] md:pl-8"
                  : ""
              }`}
            >
              <h3 className="font-['Noto_Sans_JP'] text-xl font-semibold text-[#2C2C2C] md:text-2xl">
                {item.title}
              </h3>
              <p className="text-[15px] leading-7 text-[#5A5A5A]">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
