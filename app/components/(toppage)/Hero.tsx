"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale } from "next-intl";

export default function Hero() {
  const locale = useLocale();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
    "/images/hero.jpg",
    "/images/hero1.jpg",
    "/images/hero2.jpg",
    "/images/hero3.jpg",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [images.length]);

  // 多言語コンテンツ
  const content = {
    ja: {
      subtitle: "DMC - Dressman Code",
      description: "富士山と茶畑を背景に、伝統的な着物姿で特別な一枚を。",
      descriptionLong:
        "富士山と茶畑を背景に、伝統的な着物姿で特別な一枚を。プロのライティングとスタイリングで、あなたの大切な瞬間を美しく残します。",
      address: "静岡県富士市荒田島町1-13 ラシェット1",
      phone: "TEL: 0545-55-4550",
      hours: "営業時間: 11:00-17:00 / 定休日: 水曜日",
      buttonGallery: "View Gallery",
      buttonReserve: "Reserve",
    },
    en: {
      subtitle: "DMC - Dressman Code",
      description:
        "Capture your special moments in traditional kimono with Mt. Fuji and tea fields.",
      descriptionLong:
        "Capture your special moments in traditional kimono with Mt. Fuji and tea fields as your backdrop. Professional lighting and styling to beautifully preserve your precious memories.",
      address: "1-13 Aratajimacho, Fuji-shi, Shizuoka",
      phone: "TEL: +81-545-55-4550",
      hours: "Hours: 11:00-17:00 / Closed: Wednesday",
      buttonGallery: "View Gallery",
      buttonReserve: "Reserve",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <section className="relative flex min-h-screen w-full overflow-hidden bg-[#F5F3F0]">
      {/* モバイル: 縦並びレイアウト */}
      <div className="flex w-full flex-col md:hidden">
        {/* 画像エリア（モバイル） */}
        <div className="relative h-[50vh] w-full">
          <AnimatePresence mode="wait">
            {images.map((image, index) =>
              currentImageIndex === index ? (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={image}
                    alt={`DMC 花夢 ${index + 1}`}
                    fill
                    priority={index === 0}
                    quality={90}
                    className="object-cover"
                  />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>

        {/* コンテンツエリア（モバイル） */}
        <div className="flex min-h-[50vh] flex-col justify-between bg-[#F5F3F0] px-6 py-12">
          {/* タイトル */}
          <div className="space-y-0">
            <h1 className="font-['Crimson_Text'] text-[3.5rem] font-black uppercase leading-[0.85] tracking-tighter text-[#2C2C2C]">
              KIMONO
            </h1>
            <h1 className="font-['Crimson_Text'] text-[3.5rem] font-black uppercase leading-[0.85] tracking-tighter text-[#2C2C2C]">
              PHOTO
            </h1>
            <h1 className="font-['Crimson_Text'] text-[3.5rem] font-black uppercase leading-[0.85] tracking-tighter text-[#2C2C2C]">
              STUDIO
            </h1>
          </div>

          {/* サブコンテンツ */}
          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B7355]">
                {t.subtitle}
              </div>
              <div className="h-px w-16 bg-[#8B7355]" />
            </div>

            <nav className="space-y-2 text-sm font-medium uppercase tracking-wider">
              <Link
                href={`/${locale}/gallery`}
                className="flex items-center gap-2 text-[#2C2C2C]"
              >
                <span className="text-[#8B7355]">▸</span>
                <span>Gallery</span>
              </Link>
              <Link
                href={`/${locale}/service`}
                className="flex items-center gap-2 text-[#2C2C2C]"
              >
                <span className="text-[#8B7355]">▸</span>
                <span>Service</span>
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="flex items-center gap-2 text-[#2C2C2C]"
              >
                <span className="text-[#8B7355]">▸</span>
                <span>Contact</span>
              </Link>
            </nav>

            <p className="text-sm leading-relaxed text-[#5A5A5A]">
              {t.description}
            </p>

            <div className="flex flex-col gap-3">
              <Link href={`/${locale}/gallery`}>
                <button className="w-full border-2 border-[#2C2C2C] bg-[#2C2C2C] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white">
                  {t.buttonGallery}
                </button>
              </Link>
              <Link href={`/${locale}/contact`}>
                <button className="w-full border-2 border-[#8B7355] bg-transparent px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#8B7355]">
                  {t.buttonReserve}
                </button>
              </Link>
            </div>
          </div>

          {/* インジケーター（モバイル） */}
          <div className="mt-8 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-0.5 transition-all duration-300 ${
                  currentImageIndex === index
                    ? "w-8 bg-[#2C2C2C]"
                    : "w-2 bg-[#2C2C2C]/40"
                }`}
                aria-label={`画像 ${index + 1} に切り替え`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* タブレット・PC: 左右分割レイアウト */}
      <div className="hidden min-h-screen w-full md:flex">
        {/* 左側コンテンツ */}
        <div className="relative z-10 flex min-h-screen w-1/2 flex-col justify-between px-16 py-32 lg:w-2/5 lg:px-24">
          {/* メインタイトル */}
          <div className="space-y-0">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="font-['Crimson_Text'] text-[clamp(4rem,12vw,8rem)] font-black uppercase leading-[0.85] tracking-tighter text-[#2C2C2C]"
            >
              KIMONO
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="font-['Crimson_Text'] text-[clamp(4rem,12vw,8rem)] font-black uppercase leading-[0.85] tracking-tighter text-[#2C2C2C]"
            >
              PHOTO
            </motion.h1>
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="font-['Crimson_Text'] text-[clamp(4rem,12vw,8rem)] font-black uppercase leading-[0.85] tracking-tighter text-[#2C2C2C]"
            >
              STUDIO
            </motion.h1>
          </div>

          {/* サブコンテンツ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-8"
          >
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-[0.3em] text-[#8B7355]">
                {t.subtitle}
              </div>
              <div className="h-px w-16 bg-[#8B7355]" />
            </div>

            <nav className="space-y-3 text-sm font-medium uppercase tracking-wider">
              <Link
                href={`/${locale}/gallery`}
                className="flex items-center gap-2 text-[#2C2C2C] transition-colors hover:text-[#8B7355]"
              >
                <span className="text-[#8B7355]">▸</span>
                <span>Gallery</span>
              </Link>
              <Link
                href={`/${locale}/service`}
                className="flex items-center gap-2 text-[#2C2C2C] transition-colors hover:text-[#8B7355]"
              >
                <span className="text-[#8B7355]">▸</span>
                <span>Service</span>
              </Link>
              <Link
                href={`/${locale}/contact`}
                className="flex items-center gap-2 text-[#2C2C2C] transition-colors hover:text-[#8B7355]"
              >
                <span className="text-[#8B7355]">▸</span>
                <span>Contact</span>
              </Link>
            </nav>

            <p className="max-w-md text-sm leading-relaxed text-[#5A5A5A]">
              {t.descriptionLong}
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={`/${locale}/gallery`}>
                <button className="w-full whitespace-nowrap border-2 border-[#2C2C2C] bg-[#2C2C2C] px-8 py-3 text-xs font-bold uppercase tracking-wider text-white transition-all duration-300 hover:bg-transparent hover:text-[#2C2C2C] sm:w-auto">
                  {t.buttonGallery}
                </button>
              </Link>
              <Link href="https://dmcfuji0823.wixsite.com/reservation/en">
                <button className="w-full whitespace-nowrap border-2 border-[#8B7355] bg-transparent px-8 py-3 text-xs font-bold uppercase tracking-wider text-[#8B7355] transition-all duration-300 hover:bg-[#8B7355] hover:text-white sm:w-auto">
                  {t.buttonReserve}
                </button>
              </Link>
            </div>
          </motion.div>

          {/* フッター情報 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="space-y-1 text-xs text-[#999]"
          >
            <div>{t.address}</div>
            <div>{t.phone}</div>
            <div>{t.hours}</div>
          </motion.div>
        </div>

        {/* 右側：画像 */}
        <div className="relative h-screen w-1/2 lg:w-3/5">
          <AnimatePresence mode="wait">
            {images.map((image, index) =>
              currentImageIndex === index ? (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={image}
                    alt={`DMC 花夢 ${index + 1}`}
                    fill
                    priority={index === 0}
                    quality={90}
                    sizes="(max-width: 768px) 100vw, 60vw"
                    className="object-cover"
                  />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>

          {/* インジケーター */}
          <div className="absolute bottom-12 right-12 z-30 flex flex-col gap-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-12 w-0.5 transition-all duration-300 ${
                  currentImageIndex === index
                    ? "bg-white"
                    : "bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`画像 ${index + 1} に切り替え`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
