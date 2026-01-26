"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function FeaturedSection() {
  const locale = useLocale();

  const content = {
    ja: {
      title: "花夢 (ハナユメ)",
      subtitle: "着物撮影 - 日本人向け",
      description:
        "伝統的な着物姿で特別な一枚を。プロ仕様の撮影スタジオと着物で、あなたの大切な瞬間を美しく残します。",
      plans: [
        {
          name: "花夢プラン",
          price: "",
          features: ["打掛着物レンタル", "ドレスレンタル", "スタジオ（1時間）"],
        },
      ],
      cta: "予約する",
    },
    en: {
      title: "CAMU",
      subtitle: "Ceremonial Kimono Photo Shoot — Mt. Fuji & Tea Fields",
      description:
        "A professional ceremonial kimono photo experience that combines outdoor views of Mt. Fuji and tea fields with a studio session under elegant lighting. Photo data are delivered online. Advance reservation required.",
      plans: [
        {
          name: "Premium Plan",
          price: "¥100,000",
          features: [
            "Location or Studio session",
            "Studio rental (60 min)",
            "Ceremonial Kimono rental",
            "Dressing",
            "Professional photo shoot",
            "10 photo data files (online delivery)",
          ],
        },
        {
          name: "Light Plan",
          price: "¥40,000",
          features: ["Ceremonial Kimono rental", "Self-shoot allowed (use your own device)"],
        },
        {
          name: "Ceremonial Kimono Experience (1 hour)",
          price: "¥10,000",
          features: [
            "Ceremonial Kimono rental (1 hour)",
            "Additional kimonos: ¥5,000 each (group bookings)",
          ],
        },
      ],
      cta: "Book Now",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;
  const reservationUrl =
    locale === "ja"
      ? "https://dmcfuji0823.wixsite.com/reservation"
      : "https://dmcfuji0823.wixsite.com/reservation/en";

  return (
    <section className="bg-[#faf8f4] py-12 md:py-16">
      <div className="mx-auto max-w-[1120px] px-6 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:items-center md:gap-16">
          {/* 画像 */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <Image
              src="/images/camu.webp"
              alt={t.title}
              fill
              className="object-cover object-[50%_30%]"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          {/* コンテンツ */}
          <div className="space-y-10">
            <div>
              <h2 className="mb-2 font-['Noto_Sans_JP'] text-2xl font-semibold text-[#2C2C2C] md:text-3xl">
                {t.title}
              </h2>
              <p className="text-[15px] text-[#8B7355] md:text-base">
                {t.subtitle}
              </p>
            </div>

            <p className="text-[15px] leading-7 text-[#5A5A5A] md:text-base">
              {t.description}
            </p>

            {/* プラン */}
            <div className="space-y-6">
              {t.plans.map((plan, index) => (
                <div
                  key={index}
                  className="border-b border-[rgba(0,0,0,0.08)] pb-6 last:border-b-0 last:pb-0"
                >
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                    <h3 className="font-['Noto_Sans_JP'] text-lg font-semibold text-[#2C2C2C] md:text-xl">
                      {plan.name}
                    </h3>
                    {plan.price && (
                      <span className="text-2xl font-semibold text-[#2C2C2C] leading-tight sm:whitespace-nowrap">
                        {plan.price}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-start text-[15px] leading-7 text-[#5A5A5A]"
                      >
                        <span className="mr-2 mt-1 text-[#2C2C2C]">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="pt-2 flex flex-col gap-3 sm:flex-row">
              {locale !== "ja" && (
                <Link href={`/${locale}/service/camu`}>
                  <button className="w-full min-h-[44px] rounded-2xl border-2 border-[#8B7355] bg-transparent px-8 py-3 text-sm font-semibold uppercase tracking-wider text-[#8B7355] transition-all duration-150 hover:bg-[#8B7355] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7355] focus-visible:ring-offset-2 md:w-auto">
                    View Details
                  </button>
                </Link>
              )}
              <Link href={reservationUrl}>
                <button className="w-full min-h-[44px] rounded-2xl border-2 border-[#2C2C2C] bg-[#2C2C2C] px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all duration-150 hover:bg-[#1a1a1a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2C2C2C] focus-visible:ring-offset-2 md:w-auto">
                  {t.cta}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
