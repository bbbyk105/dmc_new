// app/components/Hero.tsx

"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Hero() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = [
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

  return (
    <section className="relative flex min-h-screen md:h-screen w-full items-center overflow-hidden ">
      {/* 左側 */}
      <div className="relative z-20 w-full px-6 py-20 md:w-2/5 md:px-12 lg:px-16 xl:px-20">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-px w-24 bg-white/60"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="font-['Crimson_Text'] text-xl font-medium tracking-widest text-white/90 md:text-2xl"
          >
            DMC
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="font-['Crimson_Text'] text-5xl font-bold leading-tight tracking-wide text-white drop-shadow-2xl md:text-6xl lg:text-7xl"
          >
            Dressman
            <span className="mt-2 block text-3xl md:text-4xl lg:text-5xl">
              Premium Studio
            </span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="h-px w-12 bg-white/60" />
            <span className="font-['Noto_Sans_JP'] text-xs font-medium uppercase tracking-[0.3em] text-white">
              Photo Studio
            </span>
            <div className="h-px w-12 bg-white/60" />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="font-['Noto_Sans_JP'] text-base font-light leading-relaxed tracking-wide text-white/90 drop-shadow-lg md:text-lg"
          >
            洗練されたライティングと上質なスタイリングで、
            <br />
            あなたの最良の一枚を。
          </motion.p>

          {/* Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="space-y-3 pt-4 font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-[0.15em]"
          >
            <Link
              href="/gallery"
              className="flex items-center gap-2 text-white transition-colors hover:text-[#8B7355]"
            >
              <span>Gallery</span>
              <span className="text-[#8B7355]">▶</span>
            </Link>
            <Link
              href="/service"
              className="flex items-center gap-2 text-white transition-colors hover:text-[#8B7355]"
            >
              <span>Service</span>
              <span className="text-[#8B7355]">▶</span>
            </Link>
            <Link
              href="/contact"
              className="flex items-center gap-2 text-white transition-colors hover:text-[#8B7355]"
            >
              <span>Contact</span>
              <span className="text-[#8B7355]">▶</span>
            </Link>
          </motion.div>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="flex flex-col items-start gap-4 pt-4"
          >
            <Link href="/gallery">
              <button className="group relative overflow-hidden border-2 border-white bg-white/10 px-8 py-3 font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-[0.2em] text-white backdrop-blur-sm transition-all duration-500 hover:bg-white hover:text-[#5A4A3A]">
                <span className="relative z-10">コレクション</span>
              </button>
            </Link>

            <Link href="/contact">
              <button className="group relative overflow-hidden border-2 border-white bg-white px-8 py-3 font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-[0.2em] text-[#5A4A3A] transition-all duration-500 hover:border-[#8B7355] hover:bg-[#8B7355] hover:text-white">
                <span className="relative z-10">ご予約</span>
              </button>
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* 右側：スライドショー */}
      <div className="absolute right-0 top-0 h-full w-full md:relative md:w-3/5 md:h-screen">
        <AnimatePresence mode="wait">
          {images.map((image, index) =>
            currentImageIndex === index ? (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Image
                  src={image}
                  alt={`DMC Dressman ヒーロー画像 ${index + 1}`}
                  fill
                  priority={index === 0}
                  quality={90}
                  sizes="(max-width: 768px) 100vw, 60vw"
                  style={{ objectFit: "cover", objectPosition: "center" }}
                />
              </motion.div>
            ) : null
          )}
        </AnimatePresence>

        {/* モバイル用オーバーレイ */}
        <div className="absolute inset-0 bg-linear-to-r from-black/50 via-black/30 to-transparent md:hidden" />
      </div>

      {/* インジケーター */}
      <div className="absolute bottom-8 right-8 z-30 flex gap-2 md:right-12">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImageIndex(index)}
            className="transition-all duration-300"
            style={{
              width: currentImageIndex === index ? "32px" : "8px",
              height: "8px",
              backgroundColor:
                currentImageIndex === index
                  ? "rgba(255, 255, 255, 0.9)"
                  : "rgba(255, 255, 255, 0.4)",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
            }}
            aria-label={`画像 ${index + 1} に切り替え`}
          />
        ))}
      </div>
    </section>
  );
}
