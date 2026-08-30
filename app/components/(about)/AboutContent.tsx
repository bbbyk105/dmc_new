"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { Instagram, Phone, MapPin, Clock, Car, ExternalLink } from "lucide-react";
import {
  ADDRESS_JA,
  ADDRESS_EN,
  TELEPHONE_DISPLAY,
  TELEPHONE_E164,
  HOURS_JA,
  HOURS_EN,
  CLOSED_JA,
  CLOSED_EN,
  PARKING_JA,
  PARKING_EN,
  BRAND_MEANING,
  SAME_AS_INSTAGRAM,
} from "@/lib/site-info";

/**
 * Our Story ページ本体。
 * 店頭フライヤー（深緑のヘッダー＋生成りの本文）に合わせ、
 * DMC = Dad · Mom · Child の三つの想いと Our Vision、アクセスを載せる。
 */

const GREEN = "#2E5A3E";
const CREAM = "#F5F1E8";
const INK = "#2C2418";
const GOLD = "#C9A97C";
const BROWN = "#8B7355";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

export default function AboutContent() {
  const locale = useLocale();
  const isJa = locale === "ja";

  const story = [
    {
      letter: "D",
      word: "DAD",
      en: "Building the future.",
      ja: "未来を築く力。",
      body: isJa
        ? "会社は、家族を支える父のように。"
        : "The company stands like a father who supports the family, building what comes next.",
    },
    {
      letter: "M",
      word: "MOM",
      en: "Connecting hearts.",
      ja: "心をつなぐ優しさ。",
      body: isJa
        ? "スタッフは、母のような優しさでお客様をお迎えします。"
        : "Our staff welcome every guest with the warmth of a mother.",
    },
    {
      letter: "C",
      word: "CHILD",
      en: "Nurturing products & experiences.",
      ja: "大切に育てる商品と感動。",
      body: isJa
        ? "一つひとつの商品とサービスを、子どものように大切に育てます。"
        : "We raise each product and experience with the care given to a child.",
    },
  ];

  const pillars = [
    { en: "Kimono", ja: "着物" },
    { en: "Matcha", ja: "抹茶" },
    { en: "Photography", ja: "写真" },
    { en: "Memories", ja: "思い出" },
  ];

  const mapsUrl =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("DMC FUJI 静岡県富士市荒田島町1-13 ラシェット1");

  return (
    <>
      {/* ───────── ブランドヒーロー（深緑） ───────── */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: GREEN, color: CREAM }}
      >
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 px-5 py-20 md:px-6 md:py-28 lg:grid-cols-12 lg:gap-10">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7"
          >
            <p
              className="font-serif text-[11px] uppercase tracking-[0.34em]"
              style={{ color: GOLD }}
            >
              Our Story
            </p>
            <div className="mt-7 flex items-end gap-5">
              <Image
                src="/logo/logo.png"
                alt="DMC"
                width={220}
                height={156}
                className="h-auto w-[150px] brightness-0 invert md:w-[200px]"
                style={{ clipPath: "inset(2px)" }}
                priority
              />
              <p className="pb-1 font-serif text-sm tracking-[0.2em] text-[#F5F1E8]/80 md:text-base">
                {BRAND_MEANING}
              </p>
            </div>
            <h1 className="mt-10 font-mincho text-[clamp(1.5rem,3.4vw,2.4rem)] font-medium leading-[1.75] tracking-[0.06em]">
              {isJa ? (
                <>
                  家族のような心で、
                  <br />
                  日本の文化とおもてなしを
                  <br />
                  世界へ届ける。
                </>
              ) : (
                <>
                  From the heart of family,
                  <br />
                  inspiring the world.
                </>
              )}
            </h1>
            <p className="mt-6 max-w-lg font-['Noto_Sans_JP'] text-sm leading-8 tracking-[0.02em] text-[#F5F1E8]/85">
              {isJa
                ? "DMC という名前には、父・母・子、三つの想いを込めています。富士市のこの小さなスタジオから、着物と抹茶と写真で、心に残る時間をお届けします。"
                : "Our name holds three wishes: those of a father, a mother, and a child. From our small studio in Fuji City, we share kimono, matcha, and photography to create moments worth keeping."}
            </p>
          </motion.div>

          {/* フライヤーの写真カードを模した一枚 */}
          <motion.figure
            initial={{ opacity: 0, y: 30, rotate: -1.5 }}
            whileInView={{ opacity: 1, y: 0, rotate: -1.5 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="mx-auto w-full max-w-[420px] lg:col-span-5"
          >
            <div
              className="p-2.5 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
              style={{ backgroundColor: CREAM }}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src="/images/camu.webp"
                  alt={
                    isJa
                      ? "富士山と茶畑を背景に、赤い色打掛と和傘で微笑む女性"
                      : "A woman in a red iro-uchikake kimono with a paper umbrella, Mt. Fuji and tea fields behind her"
                  }
                  fill
                  sizes="(min-width: 1024px) 420px, 90vw"
                  quality={85}
                  className="object-cover"
                  style={{ objectPosition: "30% 50%" }}
                />
              </div>
            </div>
            <figcaption
              className="mt-4 whitespace-nowrap text-center font-serif text-[10px] uppercase tracking-[0.22em] md:text-[11px]"
              style={{ color: GOLD }}
            >
              Kimono · Matcha · Photography · Memories
            </figcaption>
          </motion.figure>
        </div>
      </section>

      {/* ───────── Our Story：D / M / C ───────── */}
      <section className="py-24 md:py-32" style={{ backgroundColor: CREAM }}>
        <div className="mx-auto max-w-[1200px] px-5 md:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.7 }}>
            <p
              className="font-serif text-[11px] uppercase tracking-[0.34em]"
              style={{ color: BROWN }}
            >
              D · M · C
            </p>
            <h2
              className="mt-5 font-mincho text-[1.6rem] font-medium tracking-[0.08em] md:text-3xl"
              style={{ color: INK }}
            >
              {isJa ? "名前に込めた、三つの想い" : "Three wishes in our name"}
            </h2>
          </motion.div>

          <div className="mt-14 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8">
            {story.map((s, i) => (
              <motion.article
                key={s.word}
                {...fadeUp}
                transition={{ duration: 0.8, delay: i * 0.12 }}
                className="relative border-t pt-8"
                style={{ borderColor: `${GOLD}80` }}
              >
                <span
                  className="pointer-events-none absolute -top-6 right-0 select-none font-serif text-[6.5rem] leading-none"
                  style={{ color: `${GOLD}33` }}
                  aria-hidden="true"
                >
                  {s.letter}
                </span>
                <p
                  className="font-serif text-xs uppercase tracking-[0.3em]"
                  style={{ color: BROWN }}
                >
                  {s.letter} = {s.word}
                </p>
                <p
                  className="mt-4 font-serif text-sm uppercase tracking-[0.12em]"
                  style={{ color: GREEN }}
                >
                  {s.en}
                </p>
                <h3
                  className="mt-3 font-mincho text-xl font-medium tracking-[0.06em] md:text-2xl"
                  style={{ color: INK }}
                >
                  {s.ja}
                </h3>
                <p className="mt-4 font-['Noto_Sans_JP'] text-sm leading-8 tracking-[0.02em] text-[#5A5245]">
                  {s.body}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── We are family（深緑の帯） ───────── */}
      <section className="py-20 md:py-28" style={{ backgroundColor: GREEN, color: CREAM }}>
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.8 }}
          className="mx-auto max-w-[960px] px-5 text-center md:px-6"
        >
          <p
            className="font-serif text-[11px] uppercase tracking-[0.34em]"
            style={{ color: GOLD }}
          >
            Our Vision
          </p>
          <h2 className="mt-6 font-serif text-[clamp(2rem,5vw,3.4rem)] leading-[1.15] tracking-[0.06em]">
            We are family.
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-mincho text-[15px] leading-9 tracking-[0.06em] text-[#F5F1E8]/90 md:text-base">
            {isJa ? (
              <>
                ひとつの家族として、日本の文化とおもてなしを世界と分かち合う。
                <br className="hidden md:block" />
                それが私たちの願いです。
              </>
            ) : (
              "To share Japan's culture and hospitality with the world, as one family."
            )}
          </p>

          <ul className="mx-auto mt-12 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4">
            {pillars.map((p) => (
              <li key={p.en} className="flex flex-col items-center gap-2">
                <span
                  className="font-serif text-xs uppercase tracking-[0.3em]"
                  style={{ color: GOLD }}
                >
                  {p.en}
                </span>
                <span className="font-mincho text-lg tracking-[0.2em]">
                  {p.ja}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>

      {/* ───────── アクセス ───────── */}
      <section className="bg-white py-24 md:py-32">
        <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-12 px-5 md:grid-cols-12 md:px-6">
          <motion.div {...fadeUp} transition={{ duration: 0.7 }} className="md:col-span-5">
            <p
              className="font-serif text-[11px] uppercase tracking-[0.34em]"
              style={{ color: BROWN }}
            >
              Access
            </p>
            <h2
              className="mt-5 font-mincho text-[1.6rem] font-medium tracking-[0.08em] md:text-3xl"
              style={{ color: INK }}
            >
              {isJa ? "スタジオへのアクセス" : "Visit the studio"}
            </h2>
            <p className="mt-6 max-w-md font-['Noto_Sans_JP'] text-sm leading-8 tracking-[0.02em] text-[#5A5245]">
              {isJa
                ? "1階はアンティークカフェ、2階は撮影スタジオ。お車でお越しの方は、無料の駐車場をご利用ください。"
                : "An antique café on the first floor and the photo studio on the second. Free parking is available if you come by car."}
            </p>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 border-b pb-1.5 font-['Noto_Sans_JP'] text-[13px] tracking-[0.18em] transition-colors hover:text-[#2C2418]"
              style={{ color: BROWN, borderColor: `${BROWN}66` }}
            >
              {isJa ? "Google マップで開く" : "Open in Google Maps"}
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </motion.div>

          <motion.dl
            {...fadeUp}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="grid grid-cols-1 gap-6 border-t pt-8 font-['Noto_Sans_JP'] text-sm md:col-span-7 md:grid-cols-2"
            style={{ borderColor: `${GOLD}80`, color: INK }}
          >
            <div className="flex items-start gap-3 md:col-span-2">
              <MapPin className="mt-1 h-4 w-4 shrink-0" style={{ color: BROWN }} aria-hidden="true" />
              <div>
                <dt className="text-xs tracking-[0.2em]" style={{ color: BROWN }}>
                  {isJa ? "所在地" : "Address"}
                </dt>
                <dd className="mt-1 leading-7">{isJa ? ADDRESS_JA : ADDRESS_EN}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Car className="mt-1 h-4 w-4 shrink-0" style={{ color: BROWN }} aria-hidden="true" />
              <div>
                <dt className="text-xs tracking-[0.2em]" style={{ color: BROWN }}>
                  {isJa ? "駐車場" : "Parking"}
                </dt>
                <dd className="mt-1 leading-7">{isJa ? PARKING_JA : PARKING_EN}</dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="mt-1 h-4 w-4 shrink-0" style={{ color: BROWN }} aria-hidden="true" />
              <div>
                <dt className="text-xs tracking-[0.2em]" style={{ color: BROWN }}>
                  {isJa ? "電話" : "Phone"}
                </dt>
                <dd className="mt-1 leading-7">
                  <a href={`tel:${TELEPHONE_E164}`} className="transition-colors hover:text-[#8B7355]">
                    {TELEPHONE_DISPLAY}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-1 h-4 w-4 shrink-0" style={{ color: BROWN }} aria-hidden="true" />
              <div>
                <dt className="text-xs tracking-[0.2em]" style={{ color: BROWN }}>
                  {isJa ? "営業時間" : "Hours"}
                </dt>
                <dd className="mt-1 leading-7">
                  {isJa ? HOURS_JA : HOURS_EN}
                  <span className="block text-xs text-[#5A5245]">
                    {isJa ? CLOSED_JA : CLOSED_EN}
                  </span>
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3 md:col-span-2">
              <Instagram className="mt-1 h-4 w-4 shrink-0" style={{ color: BROWN }} aria-hidden="true" />
              <div>
                <dt className="text-xs tracking-[0.2em]" style={{ color: BROWN }}>
                  Instagram
                </dt>
                <dd className="mt-1 leading-7">
                  <a
                    href={SAME_AS_INSTAGRAM}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-[#8B7355]"
                  >
                    @dmcfuji123
                  </a>
                </dd>
              </div>
            </div>
          </motion.dl>
        </div>
      </section>
    </>
  );
}
