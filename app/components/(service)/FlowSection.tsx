"use client";

import { useLocale } from "next-intl";

export default function FlowSection() {
  const locale = useLocale();

  const content = {
    ja: {
      title: "予約の流れ",
      steps: [
        {
          number: "01",
          title: "予約",
          description: "オンラインまたはお電話でご予約ください",
        },
        {
          number: "02",
          title: "来店",
          description: "ご予約日時にスタジオへお越しください",
        },
        {
          number: "03",
          title: "撮影",
          description: "撮影をお楽しみください",
        },
        {
          number: "04",
          title: "納品",
          description: "撮影データをオンラインでお届けします",
        },
      ],
    },
    en: {
      title: "Reservation Flow",
      steps: [
        {
          number: "01",
          title: "Reserve",
          description: "Book online or by phone",
        },
        {
          number: "02",
          title: "Visit",
          description: "Come to the studio on your reserved date and time",
        },
        {
          number: "03",
          title: "Shoot",
          description: "Enjoy your session",
        },
        {
          number: "04",
          title: "Delivery",
          description: "Photo data will be delivered online",
        },
      ],
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <section className="bg-[#faf8f4] py-12 md:py-16">
      <div className="mx-auto max-w-[1120px] px-6 md:px-8">
        <h2 className="mb-16 text-center font-['Noto_Sans_JP'] text-2xl font-semibold text-[#2C2C2C] md:text-3xl">
          {t.title}
        </h2>
        <div className="grid gap-12 md:grid-cols-4 md:gap-8">
          {t.steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="mb-6 text-4xl font-semibold text-[#2C2C2C] opacity-20">
                {step.number}
              </div>
              <h3 className="mb-3 font-['Noto_Sans_JP'] text-lg font-semibold text-[#2C2C2C]">
                {step.title}
              </h3>
              <p className="text-[15px] leading-7 text-[#5A5A5A]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
