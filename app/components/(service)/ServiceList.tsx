"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { MapPin, Clock, Coffee, Camera } from "lucide-react";

export default function ServiceList() {
  const locale = useLocale();

  // 早めに発火する共通 viewport（見た目は変えず遅延体感だけ解消）
  const vp = { once: true, amount: 0.15, margin: "0px 0px -10% 0px" } as const;

  const content = {
    ja: {
      camu: {
        title: "花夢 (CAMU)",
        subtitle: "着物撮影 - 日本人向け",
        description:
          "富士山と茶畑を背景に、伝統的な着物姿で特別な一枚を。プロのライティングとスタイリングで、あなたの大切な瞬間を美しく残します。",
        plans: [
          {
            name: "DMCクラブメンバー",
            price: "¥5,000",
            features: [
              "着物レンタル",
              "着付け・ヘアスタイリング",
              "プロ撮影",
              "データ納品",
            ],
          },
          {
            name: "非メンバー",
            price: "¥10,000",
            features: [
              "着物レンタル",
              "着付け・ヘアスタイリング",
              "プロ撮影",
              "データ納品",
            ],
          },
        ],
        membership: "メンバー費：¥3,000/月",
        locations: [
          "富士山 & 茶畑ロケーション撮影",
          "スタジオ撮影（プロライティング）",
        ],
      },
      chloe: {
        title: "Chloe (クロエ)",
        subtitle: "レンタルスタジオ - 2階",
        description:
          "七五三、成人式、ドレス、着物撮影に対応したレンタルスタジオ。プロ仕様の機材とスペースをリーズナブルな価格でご利用いただけます。",
        pricing: [
          { duration: "1時間", price: "¥2,000" },
          { duration: "4時間", price: "¥5,000" },
        ],
        features: [
          "七五三撮影",
          "成人式撮影",
          "ドレス撮影",
          "着物撮影",
          "衣装レンタル可能",
          "照明機材完備",
          "背景セット各種",
        ],
        note: "※カメラマン・メイクは含まれません",
      },
      cafe: {
        title: "アンティークカフェ",
        subtitle: "1階カフェスペース",
        description:
          "アンティーク家具に囲まれた落ち着いた空間で、こだわりのコーヒーをお楽しみいただけます。撮影の合間のひとときに。",
        menu: [{ item: "コーヒー", price: "¥200" }],
      },
    },
    en: {
      camu: {
        title: "CAMU",
        subtitle: "Kimono Photo Shoot — Mt. Fuji & Tea Fields",
        description:
          "A professional kimono photo experience that combines outdoor views of Mt. Fuji and tea fields with a studio session under elegant lighting. Photo data are delivered online. Advance reservation required.",
        plans: [
          {
            name: "Premium Plan",
            price: "¥100,000 / person (tax included)",
            features: [
              "Location + Studio session",
              "Studio rental (60 min)",
              "Kimono rental",
              "Dressing & hairstyling",
              "Professional photo shoot",
              "10 photo data files (online delivery)",
            ],
          },
          {
            name: "Light Plan",
            price: "¥40,000 / person (tax included)",
            features: [
              "Kimono rental",
              "Self-shoot allowed (use your own device)",
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
          "Professional rental studio for Shichi-Go-San, coming-of-age ceremonies, dress and kimono photography. Professional equipment and space at reasonable rates.",
        pricing: [
          { duration: "1 hour", price: "¥2,000" },
          { duration: "4 hours", price: "¥5,000" },
        ],
        features: [
          "Shichi-Go-San photography",
          "Coming-of-age ceremony",
          "Dress photography",
          "Kimono photography",
          "Costume rental available",
          "Lighting equipment",
          "Various backgrounds",
        ],
        note: "※Photographer and makeup not included",
      },
      cafe: {
        title: "Antique Cafe",
        subtitle: "1st Floor Cafe Space",
        description:
          "Enjoy specialty coffee in a calm space surrounded by antique furniture. Perfect for a relaxing break between photo sessions.",
        menu: [{ item: "Coffee", price: "¥200" }],
      },
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <div className="container mx-auto px-6 py-20 lg:px-12">
      {/* CAMU */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.8 }}
        className="mb-32"
      >
        <div className="grid items-stretch gap-12 xl:grid-cols-2 xl:gap-16">
          {/* 画像 */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={vp}
            transition={{ duration: 0.8 }}
            // 極小画面で高さを抑える（iPhone 5/SE 対策）
            className="
    group relative overflow-hidden rounded-2xl shadow-2xl
    h-80                         /* 基本 */
    max-[360px]:h-[260px]             /* iPhone 5/SE 等 */
    max-[390px]:h-[300px]             /* iPhone 12 mini 等 */
    sm:h-[420px]                      /* 640px〜 */
    md:h-[500px]
    lg:h-[600px]
  "
          >
            <div className="absolute inset-0 z-10 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <div className="absolute inset-0 z-10 bg-linear-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-30" />
            <Image
              src="/images/camu.webp"
              alt="CAMU Kimono Photo"
              fill
              // 富士山を見せるため、上寄せ気味のオブジェクト位置
              className="object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:brightness-110 object-[50%_30%]"
              // レイアウト最適化（小さい端末で無理に大画像を読まない）
              sizes="(max-width: 390px) 100vw, (max-width: 768px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 z-20 border-4 border-white/0 transition-all duration-700 group-hover:border-white/30" />
          </motion.div>

          {/* コンテンツ */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={vp}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center space-y-6"
          >
            <div>
              <h2 className="mb-2 font-['Crimson_Text'] text-5xl font-black text-[#2C2C2C]">
                {t.camu.title}
              </h2>
              <p className="text-lg text-[#8B7355]">{t.camu.subtitle}</p>
            </div>

            <p className="text-[#5A5A5A]">{t.camu.description}</p>

            {/* プラン */}
            <div className="space-y-4">
              {t.camu.plans.map((plan, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.5 }}
                  whileHover={{ scale: 1.02, x: 10 }}
                  className="rounded-xl border-2 border-[#2C2C2C]/10 bg-white p-6 shadow-lg transition-all hover:border-[#8B7355] hover:shadow-xl"
                >
                  {/* ←ここを修正（スマホは縦積み / sm以上で横並び） */}
                  <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <h3 className="text-xl font-bold text-[#2C2C2C]">
                      {plan.name}
                    </h3>
                    <span className="text-2xl font-black text-[#8B7355] leading-tight sm:whitespace-nowrap">
                      {plan.price}
                    </span>
                  </div>

                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li
                        key={i}
                        className="flex items-center text-sm text-[#5A5A5A]"
                      >
                        <span className="mr-2 text-[#8B7355]">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            {/* メンバーシップ情報 */}
            {t.camu.membership && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: 0.5 }}
                className="text-sm font-bold text-[#8B7355]"
              >
                {t.camu.membership}
              </motion.p>
            )}

            {/* ロケーション */}
            <div className="space-y-2">
              {t.camu.locations.map((location, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.5 }}
                  className="flex items-center text-sm text-[#5A5A5A]"
                >
                  <MapPin className="mr-2 h-4 w-4 text-[#8B7355]" />
                  {location}
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={vp}
              transition={{ duration: 0.5 }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <Link href={`/${locale}/service/camu`}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full border-2 border-[#8B7355] bg-transparent px-8 py-4 font-bold uppercase tracking-wider text-[#8B7355] transition-all hover:bg-[#8B7355] hover:text-white sm:w-auto"
                >
                  {locale === "ja" ? "詳細を見る" : "View Details"}
                </motion.button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full border-2 border-[#2C2C2C] bg-[#2C2C2C] px-8 py-4 font-bold uppercase tracking-wider text-white transition-all hover:bg-transparent hover:text-[#2C2C2C] sm:w-auto"
                >
                  {locale === "ja" ? "予約する" : "Book Now"}
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Chloe（レンタルスタジオ） & カフェ（2カラム） */}
      <div className="grid items-stretch gap-12 lg:grid-cols-2">
        {/* Chloe レンタルスタジオ */}
        <motion.section
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col"
          >
            {/* 画像 */}
            <div className="group relative h-64 overflow-hidden md:h-80 lg:h-96">
              <div className="absolute inset-0 z-10 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute inset-0 z-10 bg-linear-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-30" />
              <Image
                src="/images/chloe.webp"
                alt="Chloe Rental Studio"
                fill
                className="object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:brightness-110"
              />
              <div className="absolute inset-0 z-20 border-4 border-white/0 transition-all duration-700 group-hover:border-white/30" />
            </div>

            {/* コンテンツ */}
            <div className="p-8 flex-1 flex flex-col">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={vp}
                transition={{ duration: 0.5 }}
                className="mb-4 inline-block rounded-full bg-[#8B7355]/10 px-4 py-2"
              >
                <Camera className="inline h-5 w-5 text-[#8B7355]" />
                <span className="ml-2 text-sm font-bold uppercase tracking-wider text-[#8B7355]">
                  Studio
                </span>
              </motion.div>

              <h3 className="mb-2 font-['Crimson_Text'] text-3xl font-black text-[#2C2C2C]">
                {t.chloe.title}
              </h3>
              <p className="mb-4 text-sm text-[#8B7355]">{t.chloe.subtitle}</p>

              <p className="mb-6 text-sm text-[#5A5A5A]">
                {t.chloe.description}
              </p>

              {/* 料金 */}
              <div className="mb-6 space-y-3">
                {t.chloe.pricing.map((price, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={vp}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between rounded-lg bg-[#F5F3F0] p-4"
                  >
                    <span className="font-medium text-[#2C2C2C]">
                      <Clock className="mr-2 inline h-4 w-4 text-[#8B7355]" />
                      {price.duration}
                    </span>
                    <span className="text-xl font-bold text-[#8B7355]">
                      {price.price}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* 機能リスト */}
              <div className="mb-4 space-y-2">
                {t.chloe.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-[#5A5A5A]"
                  >
                    <span className="mr-2 text-[#8B7355]">✓</span>
                    {feature}
                  </div>
                ))}
              </div>

              <p className="mb-6 text-sm italic text-[#999]">{t.chloe.note}</p>

              {/* CTA */}
              <div className="mt-auto flex flex-col gap-3">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/${locale}/service/chloe`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full border-2 border-[#8B7355] bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-wider text-[#8B7355] transition-all hover:bg-[#8B7355] hover:text-white"
                    >
                      {locale === "ja" ? "詳細を見る" : "View Details"}
                    </motion.button>
                  </Link>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={vp}
                  transition={{ duration: 0.5 }}
                >
                  <Link href={`/${locale}/contact`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full border-2 border-[#2C2C2C] bg-[#2C2C2C] px-6 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-transparent hover:text-[#2C2C2C]"
                    >
                      {locale === "ja" ? "予約する" : "Book Now"}
                    </motion.button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* アンティークカフェ */}
        <motion.section
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            whileHover={{ y: -10 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-hidden rounded-2xl bg-white shadow-xl flex flex-col"
          >
            {/* 画像 */}
            <div className="group relative h-64 overflow-hidden md:h-80 lg:h-96">
              <div className="absolute inset-0 z-10 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
              <div className="absolute inset-0 z-10 bg-linear-to-br from-white/20 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-30" />
              <Image
                src="/images/cafe.webp"
                alt="Antique Cafe"
                fill
                className="object-cover transition-all duration-1000 ease-out group-hover:scale-110 group-hover:brightness-110"
              />
              <div className="absolute inset-0 z-20 border-4 border-white/0 transition-all duration-700 group-hover:border-white/30" />
            </div>

            {/* コンテンツ */}
            <div className="p-8 flex-1 flex flex-col">
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={vp}
                transition={{ duration: 0.5 }}
                className="mb-4 inline-block rounded-full bg-[#8B7355]/10 px-4 py-2"
              >
                <Coffee className="inline h-5 w-5 text-[#8B7355]" />
                <span className="ml-2 text-sm font-bold uppercase tracking-wider text-[#8B7355]">
                  Cafe
                </span>
              </motion.div>

              <h3 className="mb-2 font-['Crimson_Text'] text-3xl font-black text-[#2C2C2C]">
                {t.cafe.title}
              </h3>
              <p className="mb-4 text-sm text-[#8B7355]">{t.cafe.subtitle}</p>

              <p className="mb-6 text-sm text-[#5A5A5A]">
                {t.cafe.description}
              </p>

              {/* メニュー */}
              <div className="mb-6 space-y-3">
                {t.cafe.menu.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={vp}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between rounded-lg bg-[#F5F3F0] p-4"
                  >
                    <span className="font-medium text-[#2C2C2C]">
                      <Coffee className="mr-2 inline h-4 w-4 text-[#8B7355]" />
                      {item.item}
                    </span>
                    <span className="text-xl font-bold text-[#8B7355]">
                      {item.price}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* 下寄せボックス（下の余白を消す） */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={vp}
                transition={{ duration: 0.5 }}
                className="mt-auto rounded-lg bg-[#8B7355]/10 p-4 text-center"
              >
                <p className="text-sm text-[#5A5A5A]">
                  {locale === "ja"
                    ? "撮影の合間に、ゆっくりとおくつろぎください"
                    : "Relax and enjoy during your photo session"}
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.section>
      </div>

      {/* CTA セクション */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={vp}
        transition={{ duration: 0.8 }}
        className="mt-32 rounded-3xl bg-linear-to-r from-[#2C2C2C] to-[#5A4A3A] p-12 text-center text-white md:p-20"
      >
        <motion.h2
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={vp}
          transition={{ duration: 0.5 }}
          className="mb-6 font-['Crimson_Text'] text-4xl font-black md:text-5xl"
        >
          {locale === "ja"
            ? "特別な瞬間を残しませんか？"
            : "Ready to Capture Your Special Moment?"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={vp}
          transition={{ duration: 0.5 }}
          className="mb-8 text-lg text-white/80"
        >
          {locale === "ja"
            ? "ご予約・お問い合わせはこちらから"
            : "Contact us for booking and inquiries"}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={vp}
          transition={{ duration: 0.5 }}
        >
          <Link href={`/${locale}/contact`}>
            <motion.button
              whileHover={{ scale: 1.1, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-white bg-white px-12 py-4 text-lg font-bold uppercase tracking-wider text-[#2C2C2C] transition-all hover:bg-transparent hover:text-white"
            >
              {locale === "ja" ? "お問い合わせ" : "Contact Us"}
            </motion.button>
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}
