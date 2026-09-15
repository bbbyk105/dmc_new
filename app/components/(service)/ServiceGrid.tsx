"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

export default function ServiceGrid() {
  const locale = useLocale();

  const content = {
    ja: {
      chloe: {
        title: "Chloe (クロエ)",
        subtitle: "レンタルスタジオ - 2階",
        description:
          "撮影に対応したレンタルスタジオ。プロ仕様のスペースをリーズナブルな価格でご利用いただけます。",
        pricing: [
          { duration: "1時間", price: "¥2,000" },
          { duration: "4時間", price: "¥5,000" },
        ],
        features: ["背景セット各種"],
        note: "※カメラマン・メイクは含まれません",
        cta: "予約する",
      },
      cafe: {
        title: "アンティークカフェ",
        subtitle: "1階カフェスペース",
        description:
          "アンティーク家具に囲まれた落ち着いた空間で、こだわりのコーヒーや日本茶をお楽しみいただけます。撮影の合間のひとときに。",
        menu: [
          { item: "珈琲 Hot/Ice", price: "¥400" },
          { item: "紅茶 Hot/Ice", price: "¥400" },
          { item: "和紅茶 Hot/Ice", price: "¥400" },
          { item: "玉露抹茶 Hot/Ice", price: "¥400" },
          { item: "ほうじ茶ラテ Ice", price: "¥700" },
          { item: "抹茶ラテ Ice（抹茶はお客様自身点てて仕上げる体験型）", price: "¥700" },
        ],
        cta: "予約する",
      },
    },
    en: {
      chloe: {
        title: "Chloe",
        subtitle: "Rental Studio - 2nd Floor",
        description:
          "Professional rental studio for photography. Professional space at reasonable rates.",
        pricing: [
          { duration: "1 hour", price: "¥2,000" },
          { duration: "4 hours", price: "¥5,000" },
        ],
        features: ["Various backgrounds"],
        note: "※Photographer and makeup not included",
        cta: "Book Now",
      },
      cafe: {
        title: "Antique Cafe",
        subtitle: "1st Floor Cafe Space",
        description:
          "A calm, antique-inspired space offering specialty coffee and Japanese tea selections. Perfect for a relaxing break between photo sessions.",
        menu: [
          { item: "Coffee Hot/Ice", price: "¥400" },
          { item: "Black Tea Hot/Ice", price: "¥400" },
          { item: "Japanese Black Tea Hot/Ice", price: "¥400" },
          { item: "Gyokuro Matcha Hot/Ice", price: "¥400" },
          { item: "Hojicha Latte Ice", price: "¥700" },
          { item: "Matcha Latte Ice (Experience: You whisk the matcha yourself to finish)", price: "¥700" },
        ],
        cta: "Book Now",
      },
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;
  const reservationUrl =
    locale === "ja"
      ? "https://dmcfuji0823.wixsite.com/reservation"
      : "https://dmcfuji0823.wixsite.com/reservation/en";

  return (
    <section className="bg-background py-12 md:py-16">
      <div className="mx-auto max-w-[1120px] px-6 md:px-8">
        <div className="grid gap-12 md:grid-cols-2">
          {/* Chloe レンタルスタジオ */}
          <div className="flex h-full flex-col">
            <div className="relative aspect-[16/10] overflow-hidden mb-6">
              <Image
                src="/images/chloe.webp"
                alt={t.chloe.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="flex flex-1 flex-col">
              <h3 className="mb-2 font-mincho text-xl font-semibold text-text md:text-2xl">
                {t.chloe.title}
              </h3>
              <p className="mb-4 text-sm text-brand">{t.chloe.subtitle}</p>

              <p className="mb-8 text-[15px] leading-7 text-text-muted">
                {t.chloe.description}
              </p>

              {/* 料金 */}
              <div className="mb-6 space-y-4">
                {t.chloe.pricing.map((price, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-[15px] text-text">
                      {price.duration}
                    </span>
                    <span className="text-lg font-semibold text-text">
                      {price.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* 機能リスト */}
              <div className="mb-4 space-y-2">
                {t.chloe.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start text-[15px] text-text-muted"
                  >
                    <span className="mr-2 mt-1 text-brand">•</span>
                    {feature}
                  </div>
                ))}
              </div>

              <p className="mb-8 text-xs text-text-muted">{t.chloe.note}</p>

              {/* CTA */}
              <div className="mt-auto">
                <Link href={reservationUrl}>
                  <button className="btn-primary w-full">
                    {t.chloe.cta}
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* アンティークカフェ */}
          <div className="flex h-full flex-col">
            <div className="relative aspect-[16/10] overflow-hidden mb-6">
              <Image
                src="/images/cafe.webp"
                alt={t.cafe.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            <div className="flex flex-1 flex-col">
              <h3 className="mb-2 font-mincho text-xl font-semibold text-text md:text-2xl">
                {t.cafe.title}
              </h3>
              <p className="mb-4 text-sm text-brand">{t.cafe.subtitle}</p>

              <p className="mb-8 text-[15px] leading-7 text-text-muted">
                {t.cafe.description}
              </p>

              {/* メニュー */}
              <div className="space-y-4">
                {t.cafe.menu.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0"
                  >
                    <span className="text-[15px] text-text">
                      {item.item.includes("（") ? (
                        <>
                          {item.item.split("（")[0]}
                          <span className="text-xs font-normal text-text-muted">
                            （{item.item.split("（")[1]}
                          </span>
                        </>
                      ) : (
                        item.item
                      )}
                    </span>
                    <span className="text-lg font-semibold text-text">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
