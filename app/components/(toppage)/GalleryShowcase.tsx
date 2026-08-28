"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

export interface ShowcaseImage {
  src: string;
  alt: string;
}

/**
 * 墨色の帯にのせた横スクロールの作品ストリップ。
 * 暗い地に写真を並べて光らせる（ヒーローと呼応するダークセクション）。
 */
export default function GalleryShowcase({
  images,
}: {
  images: ShowcaseImage[];
}) {
  const locale = useLocale();
  const isJa = locale === "ja";

  return (
    <section className="bg-[#1D1812] py-24 md:py-32">
      <div className="mx-auto max-w-[1200px] px-5 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="flex flex-wrap items-end justify-between gap-6"
        >
          <div>
            <p className="font-serif text-[11px] uppercase tracking-[0.34em] text-[#C9A97C]">
              Gallery
            </p>
            <h2 className="mt-5 font-mincho text-[1.6rem] font-medium tracking-[0.08em] text-[#F5F1E8] md:text-3xl">
              {isJa ? <>光の中の、一枚</> : <>Portraits in light</>}
            </h2>
          </div>
          <Link
            href={`/${locale}/gallery`}
            className="border-b border-[#C9A97C]/50 pb-1 font-['Noto_Sans_JP'] text-[13px] tracking-[0.18em] text-[#C9A97C] transition-colors hover:border-[#F5F1E8] hover:text-[#F5F1E8]"
          >
            {isJa ? "ギャラリーを見る" : "View the gallery"}
          </Link>
        </motion.div>
      </div>

      {/* フィルムストリップ（横スクロール・スナップ）
          注意: x 方向の initial オフセットはページ全体に横スクロールを
          生んでしまうため、フェード＋縦方向のみにする */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.9 }}
        className="mt-12 overflow-x-auto pb-6 [scrollbar-width:thin] [scrollbar-color:#C9A97C40_transparent] md:mt-16"
      >
        <div className="flex w-max snap-x snap-mandatory gap-5 px-5 md:gap-7 md:px-[max(1.5rem,calc((100vw-1200px)/2))]">
          {images.map((image, i) => (
            <Link
              key={`${image.src}-${i}`}
              href={`/${locale}/gallery`}
              className={`group relative shrink-0 snap-start overflow-hidden ${
                i % 3 === 1
                  ? "aspect-[4/5] w-[240px] self-end md:w-[300px]"
                  : i % 3 === 2
                    ? "aspect-square w-[250px] self-center md:w-[320px]"
                    : "aspect-[3/4] w-[260px] md:w-[340px]"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 768px) 340px, 260px"
                quality={85}
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#1D1812]/45 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-20"
              />
            </Link>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
