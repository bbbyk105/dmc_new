"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

/**
 * ヒーロー直下のステートメント。
 * 生成りの余白に大きなセリフの一文と、段違いに置いた写真2枚。
 */
export default function StatementSection() {
  const locale = useLocale();

  const content = {
    ja: {
      eyebrow: "About DMC FUJI",
      statementTop: "一生に一度の装いを、",
      statementBottom: "富士のふもとで。",
      body: "DMC FUJIは静岡県富士市の着物撮影スタジオです。成人式の前撮りや七五三、ブライダルから旅の記念まで。富士山と茶畑を望むロケーションと、アンティークカフェを併設したスタジオで、その日だけの一枚を仕立てます。",
      captionA: "着物撮影「花夢」",
      captionB: "茶畑ロケーション",
    },
    en: {
      eyebrow: "About DMC FUJI",
      statementTop: "A once-in-a-lifetime portrait,",
      statementBottom: "at the foot of Mt. Fuji.",
      body: "DMC FUJI is a kimono photography studio in Fuji City, Shizuoka. From coming-of-age and Shichi-Go-San to bridal portraits and travel memories — we craft your photograph on location among tea fields with Mt. Fuji in view, and in our studio with an adjoining antique café.",
      captionA: "Kimono session “CAMU”",
      captionB: "Tea field location",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <section className="overflow-hidden bg-[#F5F1E8] py-24 md:py-36">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-16 px-5 md:grid-cols-12 md:gap-8 md:px-6">
        {/* テキスト */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="md:col-span-6 md:pt-8"
        >
          <p className="font-serif text-[11px] uppercase tracking-[0.34em] text-[#8B7355]">
            {t.eyebrow}
          </p>
          <h2 className="mt-7 font-mincho text-[clamp(1.6rem,3.6vw,2.4rem)] font-medium leading-[1.7] tracking-[0.06em] text-[#2C2418]">
            {t.statementTop}
            <br />
            <span className="text-[#8B7355]">{t.statementBottom}</span>
          </h2>
          <p className="mt-8 max-w-md font-['Noto_Sans_JP'] text-sm leading-8 tracking-[0.02em] text-[#5A5245]">
            {t.body}
          </p>
        </motion.div>

        {/* 段違いの写真2枚 */}
        <div className="relative md:col-span-6">
          <motion.figure
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9 }}
            className="relative ml-auto w-[78%] md:w-[72%]"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image
                src="/images/hero.jpg"
                alt={t.captionA}
                fill
                sizes="(min-width: 768px) 36vw, 78vw"
                quality={85}
                className="object-cover object-[50%_35%]"
              />
            </div>
            <figcaption className="mt-3 text-right font-['Noto_Sans_JP'] text-[11px] tracking-[0.2em] text-[#8B7355]">
              {t.captionA}
            </figcaption>
          </motion.figure>

          <motion.figure
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="relative -mt-24 w-[58%] md:-mt-32 md:w-[52%]"
          >
            <div className="relative aspect-[4/3] overflow-hidden shadow-[0_24px_60px_rgba(44,36,24,0.18)]">
              <Image
                src="/images/fuji.webp"
                alt={t.captionB}
                fill
                sizes="(min-width: 768px) 26vw, 58vw"
                quality={85}
                className="object-cover"
              />
            </div>
            <figcaption className="mt-3 font-['Noto_Sans_JP'] text-[11px] tracking-[0.2em] text-[#8B7355]">
              {t.captionB}
            </figcaption>
          </motion.figure>
        </div>
      </div>
    </section>
  );
}
