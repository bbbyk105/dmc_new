"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MapPin, Clock, Coffee } from "lucide-react";

export default function ServiceList() {
  const locale = useLocale();

  const content = {
    ja: {
      camu: {
        title: "花夢 (ハナユメ)",
        subtitle: "着物撮影 - 日本人向け",
        description:
          "伝統的な着物姿で特別な一枚を。プロ仕様の撮影スタジオと着物で、あなたの大切な瞬間を美しく残します。",
        plans: [
          {
            name: "花夢プラン",
            price: "¥5,000",
            features: [
              "打掛着物レンタル",
              "ドレスレンタル",
              "スタジオ（1時間）",
            ],
          },
        ],
        locations: ["スタジオ撮影"],
      },
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
          {
            item: "抹茶ラテ Ice（抹茶はお客様自身点てて仕上げる体験型）",
            price: "¥700",
          },
        ],
      },
    },
    en: {
      camu: {
        title: "CAMU",
        subtitle: "Ceremonial Kimono Photo Shoot — Mt. Fuji & Tea Fields",
        description:
          "A professional ceremonial kimono photo experience that combines outdoor views of Mt. Fuji and tea fields with a studio session under elegant lighting. Photo data are delivered online. Advance reservation required.",
        plans: [
          {
            name: "Premium Plan",
            price: "¥100,000 / person (tax included)",
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
            price: "¥20,000 / person (tax included)",
            features: [
              "Ceremonial Kimono rental",
              "Self-shoot allowed (use your own device)",
            ],
          },
          {
            name: "Ceremonial Kimono Experience (1 hour)",
            price: "¥10,000 (first kimono, tax included)",
            features: [
              "Ceremonial Kimono rental (1 hour)",
              "Additional kimonos: ¥5,000 each (group bookings)",
            ],
          },
        ],
        membership: "",
        locations: [
          "Location shoot — Mt. Fuji & Tea Fields (weather dependent)",
          "Studio shoot — Professional lighting",
        ],
      },
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
          {
            item: "Matcha Latte Ice (Experience: You whisk the matcha yourself to finish)",
            price: "¥700",
          },
        ],
      },
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <div className="container mx-auto px-6 py-20 lg:px-12">
      {/* CAMU */}
      <section className="mb-32">
        <div className="grid items-stretch gap-12 xl:grid-cols-2 xl:gap-16">
          {/* 画像 */}
          <div
            className="
              relative overflow-hidden rounded-lg
              h-80
              max-[360px]:h-[260px]
              max-[390px]:h-[300px]
              sm:h-[420px]
              md:h-[500px]
              lg:h-[600px]
            "
          >
            <Image
              src="/images/camu.webp"
              alt="CAMU Ceremonial Kimono Photo"
              fill
              className="object-cover object-[50%_30%]"
              sizes="(max-width: 390px) 100vw, (max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {/* コンテンツ */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h2 className="mb-2 font-mincho text-5xl font-black text-text">
                {t.camu.title}
              </h2>
              <p className="text-lg text-text-muted">{t.camu.subtitle}</p>
            </div>

            <p className="text-text-muted leading-relaxed">
              {t.camu.description}
            </p>

            {/* プラン */}
            <div className="space-y-4">
              {t.camu.plans.map((plan, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-surface p-6 hover:border-text transition-colors"
                >
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xl font-bold text-text">
                      {plan.name}
                    </h3>
                    {plan.price && (
                      <span className="text-2xl font-black text-text leading-tight sm:whitespace-nowrap">
                        {plan.price}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center text-sm text-text-muted"
                      >
                        <span className="mr-2 text-text">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* ロケーション */}
            <div className="space-y-2">
              {t.camu.locations.map((location, index) => (
                <div
                  key={index}
                  className="flex items-center text-sm text-text-muted"
                >
                  <MapPin className="mr-2 h-4 w-4 text-text-muted" />
                  {location}
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-col gap-3 sm:flex-row pt-4">
              {locale !== "ja" && (
                <Link href={`/${locale}/service/camu`}>
                  <button className="btn-secondary w-full sm:w-auto">
                    View Details
                  </button>
                </Link>
              )}
              <Link
                href={
                  locale === "ja"
                    ? "https://dmcfuji0823.wixsite.com/reservation"
                    : "https://dmcfuji0823.wixsite.com/reservation/en"
                }
              >
                <button className="btn-primary w-full sm:w-auto">
                  {locale === "ja" ? "予約する" : "Book Now"}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Chloe & カフェ */}
      <div className="grid items-stretch gap-12 lg:grid-cols-2">
        {/* Chloe レンタルスタジオ */}
        <section>
          <div className="h-full overflow-hidden rounded-lg bg-surface border border-border flex flex-col">
            {/* 画像 */}
            <div className="relative h-64 overflow-hidden md:h-80 lg:h-96">
              <Image
                src="/images/chloe.webp"
                alt="Chloe Rental Studio"
                fill
                className="object-cover"
              />
            </div>

            {/* コンテンツ */}
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="mb-2 font-mincho text-3xl font-black text-text">
                {t.chloe.title}
              </h3>
              <p className="mb-4 text-sm text-text-muted">{t.chloe.subtitle}</p>

              <p className="mb-6 text-sm text-text-muted leading-relaxed">
                {t.chloe.description}
              </p>

              {/* 料金 */}
              <div className="mb-6 space-y-3">
                {t.chloe.pricing.map((price, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-surface p-4"
                  >
                    <span className="font-medium text-text">
                      <Clock className="mr-2 inline h-4 w-4 text-text-muted" />
                      {price.duration}
                    </span>
                    <span className="text-xl font-bold text-text">
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
                    className="flex items-center text-sm text-text-muted"
                  >
                    <span className="mr-2 text-text">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <p className="mb-6 text-sm italic text-text-muted">{t.chloe.note}</p>

              {/* CTA */}
              <div className="mt-auto">
                <Link href="https://dmcfuji0823.wixsite.com/reservation">
                  <button className="btn-primary w-full">
                    {locale === "ja" ? "予約する" : "Book Now"}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* アンティークカフェ */}
        <section>
          <div className="h-full overflow-hidden rounded-lg bg-surface border border-border flex flex-col">
            {/* 画像 */}
            <div className="relative h-64 overflow-hidden md:h-80 lg:h-96">
              <Image
                src="/images/cafe.webp"
                alt="Antique Cafe"
                fill
                className="object-cover"
              />
            </div>

            {/* コンテンツ */}
            <div className="p-8 flex-1 flex flex-col">
              <h3 className="mb-2 font-mincho text-3xl font-black text-text">
                {t.cafe.title}
              </h3>
              <p className="mb-4 text-sm text-text-muted">{t.cafe.subtitle}</p>

              <p className="mb-6 text-sm text-text-muted leading-relaxed">
                {t.cafe.description}
              </p>

              {/* メニュー */}
              <div className="mb-6 space-y-3">
                {t.cafe.menu.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg bg-surface p-4"
                  >
                    <span className="font-medium text-text">
                      <Coffee className="mr-2 inline h-4 w-4 text-text-muted" />
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
                    <span className="text-xl font-bold text-text">
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* 下寄せボックス */}
              <div className="mt-auto rounded-lg border border-border bg-background p-4 text-center">
                <p className="text-sm text-text-muted">
                  {locale === "ja"
                    ? "撮影の合間に、ゆっくりとおくつろぎください"
                    : "Relax and enjoy during your photo session"}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
      <div className="mt-24" />
    </div>
  );
}
