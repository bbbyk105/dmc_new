"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

/**
 * サービス3本柱の写真カード。
 * ホバーで写真がゆっくり寄り、金の罫線が伸びる。
 */
export default function ServicesShowcase() {
  const locale = useLocale();
  const isJa = locale === "ja";

  const services = [
    {
      href: `/${locale}/service/camu`,
      image: "/images/camu.webp",
      en: "Kimono Session",
      title: isJa ? "着物撮影「花夢」" : "CAMU — Ceremonial Kimono",
      body: isJa
        ? "婚礼衣装や振袖をまとい、スタジオとロケーションで撮影する当店の看板プラン。"
        : "Our signature plan: ceremonial kimono portraits in the studio and on location.",
    },
    {
      href: `/${locale}/service`,
      image: "/images/chloe.webp",
      en: "Studio Rental",
      title: isJa ? "レンタルスタジオ「Chloe」" : "Studio Rental — Chloe",
      body: isJa
        ? "自然光とアンティークの空気感。持ち込み撮影や商品撮影にも使える貸切スタジオ。"
        : "Natural light and antique interiors. A private studio for your own shoots.",
    },
    {
      href: `/${locale}/service`,
      image: "/images/cafe.webp",
      en: "Matcha Experience",
      title: isJa ? "抹茶・カフェ体験" : "Matcha & Café",
      body: isJa
        ? "撮影と合わせて楽しめる抹茶体験。併設のアンティークカフェでひと息を。"
        : "A matcha experience to pair with your session, in our adjoining antique café.",
    },
  ];

  return (
    <section className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="font-serif text-[11px] uppercase tracking-[0.34em] text-[#8B7355]">
              Service
            </p>
            <h2 className="mt-5 font-mincho text-[1.6rem] font-medium tracking-[0.08em] text-[#2C2418] md:text-3xl">
              {isJa ? <>三つの愉しみ</> : <>Three ways to enjoy</>}
            </h2>
          </div>
          <Link
            href={`/${locale}/service`}
            className="border-b border-[#8B7355]/40 pb-1 font-['Noto_Sans_JP'] text-[13px] tracking-[0.18em] text-[#8B7355] transition-colors hover:border-[#2C2418] hover:text-[#2C2418]"
          >
            {isJa ? "サービス一覧" : "All services"}
          </Link>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3 md:mt-16">
          {services.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
            >
              <Link href={service.href} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-[#F5F1E8]">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                    quality={85}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-[#1D1812]/0 transition-colors duration-500 group-hover:bg-[#1D1812]/10"
                  />
                </div>
                <p className="mt-5 font-serif text-[10px] uppercase tracking-[0.3em] text-[#8B7355]">
                  {service.en}
                </p>
                <h3 className="mt-2.5 font-mincho text-lg font-medium tracking-[0.04em] text-[#2C2418]">
                  {service.title}
                </h3>
                <p className="mt-2 font-['Noto_Sans_JP'] text-sm leading-7 text-[#5A5245]">
                  {service.body}
                </p>
                <span
                  aria-hidden="true"
                  className="mt-4 block h-px w-8 bg-[#C9A97C] transition-all duration-500 group-hover:w-16"
                />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
