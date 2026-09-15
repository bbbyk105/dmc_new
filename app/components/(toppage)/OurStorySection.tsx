"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { BRAND_MEANING } from "@/lib/site-info";

/**
 * トップ用の Our Story 導入。
 * 紙の地に DMC = Dad · Mom · Child の三行だけを置き、About ページへ送る。
 * DAD / MOM / CHILD は色で区別しない（三つとも同じ墨）。
 */
export default function OurStorySection() {
  const locale = useLocale();
  const isJa = locale === "ja";

  const items = [
    { word: "DAD", en: "Building the future.", ja: "未来を築く。" },
    { word: "MOM", en: "Connecting hearts.", ja: "心と心をつなぐ。" },
    { word: "CHILD", en: "Nurturing products.", ja: "心に残る商品を育む。" },
  ];

  return (
    <section className="bg-background py-20 text-text md:py-28">
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-5 md:grid-cols-12 md:gap-8 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="md:col-span-6"
        >
          <p className="font-serif text-[11px] uppercase tracking-[0.34em] text-text-muted">
            Our Story
          </p>
          <p className="mt-5 font-serif text-sm tracking-[0.2em] text-text-muted">
            DMC = {BRAND_MEANING}
          </p>
          <h2 className="mt-4 font-mincho text-[clamp(1.4rem,3vw,2rem)] font-medium leading-[1.8] tracking-[0.06em]">
            {isJa ? (
              <>
                家族のような心で、
                <br />
                日本の文化とおもてなしを
                <br />
                世界へ。
              </>
            ) : (
              <>
                From the heart of family,
                <br />
                inspiring the world.
              </>
            )}
          </h2>
          <Link
            href={`/${locale}/about`}
            className="mt-8 inline-block border-b border-border pb-1.5 font-['Noto_Sans_JP'] text-[13px] tracking-[0.18em] text-text transition-colors hover:border-text"
          >
            {isJa ? "私たちについて" : "Read our story"}
          </Link>
        </motion.div>

        <ul className="md:col-span-6 md:pt-2">
          {items.map((item, i) => (
            <motion.li
              key={item.word}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: 0.1 + i * 0.12 }}
              className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 border-t border-border py-6 md:grid-cols-[6rem_1fr] md:gap-8"
            >
              <span className="font-serif text-lg tracking-[0.2em] text-text">
                {item.word}
              </span>
              <span>
                <span className="block font-serif text-xs uppercase tracking-[0.2em] text-text-muted">
                  {item.en}
                </span>
                <span className="mt-1.5 block font-mincho text-lg tracking-[0.08em] md:text-xl">
                  {item.ja}
                </span>
              </span>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
