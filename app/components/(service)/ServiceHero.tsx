"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLocale } from "next-intl";

export default function ServiceHero() {
  const locale = useLocale();

  const content = {
    ja: {
      title: "SERVICE",
      subtitle: "サービス案内",
      description: "富士山を背景に、特別な瞬間を美しく残すサービス",
    },
    en: {
      title: "SERVICE",
      subtitle: "Our Services",
      description:
        "Capture your special moments with Mt. Fuji as your backdrop",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <section className="relative flex h-[60vh] items-center justify-center overflow-hidden bg-[#2C2C2C]">
      {/* 背景画像 */}
      <motion.div
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.4 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <Image
          src="/images/hero1.jpg"
          alt="Service Background"
          fill
          className="object-cover"
          priority
        />
      </motion.div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-4"
        >
          <motion.h1
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="font-['Crimson_Text'] text-7xl font-black uppercase tracking-tighter text-white md:text-8xl lg:text-9xl"
          >
            {t.title}
          </motion.h1>

          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mx-auto h-0.5 w-24 bg-[#8B7355]"
          />

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="text-lg font-light tracking-wide text-white/90 md:text-xl"
          >
            {t.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-sm text-white/70"
          >
            {t.description}
          </motion.p>
        </motion.div>
      </div>

      {/* スクロールインジケーター */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 1,
          delay: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="flex h-12 w-6 items-start justify-center rounded-full border-2 border-white/50 p-2">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-2 w-1 rounded-full bg-white/70"
          />
        </div>
      </motion.div>
    </section>
  );
}
