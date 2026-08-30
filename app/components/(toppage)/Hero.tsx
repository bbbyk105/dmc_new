"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

/**
 * 写真ウォール・ヒーロー。
 * 着物写真の3カラムがゆっくり縦に流れ、その上にセリフ見出しと縦書きの和文タグラインを重ねる。
 * ドリフトは CSS keyframes（globals.css の .hero-drift-*）で駆動。
 *
 * 写真を沈める全面の墨オーバーレイは使わず、見出しの背後にだけ薄い陰を落とす。
 * ホバーするとそのカラムの流れが止まり、写真が少し拡大して完全な明るさになり、キャプションが出る。
 */

type Lang = "ja" | "en";

type Tile = {
  src: string;
  /** 3:4 にトリミングされても被写体が残るよう object-position を個別指定 */
  pos: string;
  label: Record<Lang, string>;
};

const TILES = {
  camu: {
    src: "/images/camu.webp",
    pos: "26% 50%",
    label: { ja: "茶畑と富士山", en: "Tea fields & Mt. Fuji" },
  },
  cha: {
    src: "/images/cha.webp",
    pos: "18% 50%",
    label: { ja: "富士を望む", en: "Facing Mt. Fuji" },
  },
  studio: {
    src: "/images/studio.webp",
    pos: "50% 45%",
    label: { ja: "スタジオ撮影", en: "Studio session" },
  },
  standing: {
    src: "/images/hero.jpg",
    pos: "50% 40%",
    label: { ja: "色打掛", en: "Iro-uchikake" },
  },
  fuji: {
    src: "/images/fuji.webp",
    pos: "50% 50%",
    label: { ja: "富士市の茶畑", en: "Tea fields of Fuji City" },
  },
  uchikake: {
    src: "/images/IMG_8273.jpeg",
    pos: "50% 50%",
    label: { ja: "打掛", en: "Uchikake" },
  },
  cafe: {
    src: "/images/hero2.jpg",
    pos: "50% 50%",
    label: { ja: "アンティークカフェ", en: "Antique café" },
  },
  counter: {
    src: "/images/cafe.webp",
    pos: "50% 50%",
    label: { ja: "カフェカウンター", en: "Café counter" },
  },
  dresses: {
    src: "/images/hero1.jpg",
    pos: "40% 50%",
    label: { ja: "ドレス", en: "Dresses" },
  },
  chloe: {
    src: "/images/chloe.webp",
    pos: "50% 50%",
    label: { ja: "レンタルスタジオ Chloe", en: "Studio rental “Chloe”" },
  },
  rack: {
    src: "/images/IMG_8268.jpeg",
    pos: "55% 50%",
    label: { ja: "ドレスルーム", en: "Dress room" },
  },
  entrance: {
    src: "/images/hero3.jpg",
    pos: "50% 50%",
    label: { ja: "エントランス", en: "Entrance" },
  },
  // ギャラリー（Supabase: Shoots）から取り込んだ4枚
  shiromuku: {
    src: "/images/shiromuku.webp",
    pos: "30% 50%",
    label: { ja: "白無垢と番傘", en: "Shiromuku & umbrella" },
  },
  shrine: {
    src: "/images/shrine-couple.webp",
    pos: "50% 55%",
    label: { ja: "神社での前撮り", en: "Shrine pre-wedding" },
  },
  fujiCouple: {
    src: "/images/fuji-couple.webp",
    pos: "47% 50%",
    label: { ja: "富士山とふたり", en: "Together with Mt. Fuji" },
  },
  fujiDuo: {
    src: "/images/fuji-duo.webp",
    pos: "48% 50%",
    label: { ja: "富士を背に", en: "Mt. Fuji behind" },
  },
} satisfies Record<string, Tile>;

/**
 * 各列の先頭2枚が初期表示に入るので、富士山×着物・白無垢・神社の強い写真をそこに集める。
 * 3列目はモバイルでは非表示。列の長さはドリフト時間（globals.css）と釣り合わせてある。
 */
const WALL_COLUMNS: Tile[][] = [
  [TILES.camu, TILES.shiromuku, TILES.standing, TILES.cafe, TILES.fujiDuo, TILES.dresses],
  [TILES.cha, TILES.shrine, TILES.uchikake, TILES.fuji, TILES.rack],
  [TILES.studio, TILES.fujiCouple, TILES.counter, TILES.chloe, TILES.entrance],
];

function WallColumn({
  tiles,
  drift,
  lang,
  className = "",
}: {
  tiles: Tile[];
  drift: "slow" | "mid" | "fast";
  lang: Lang;
  className?: string;
}) {
  // シームレスにループさせるため同じ列を2回重ねる
  const doubled = [...tiles, ...tiles];
  return (
    <div className={`flex-1 overflow-hidden ${className}`}>
      <div className={`flex flex-col gap-4 md:gap-6 hero-drift hero-drift-${drift}`}>
        {doubled.map((tile, i) => (
          <div
            key={`${tile.src}-${i}`}
            className="group relative aspect-[3/4] w-full shrink-0 overflow-hidden"
          >
            <Image
              src={tile.src}
              alt=""
              fill
              sizes="(min-width: 768px) 32vw, 48vw"
              quality={85}
              priority={i < 2}
              className="object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
              style={{ objectPosition: tile.pos }}
            />
            {/* ほんのり墨（10%）。ホバーで消えて写真本来の明るさに */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-[#1D1812]/10 transition-opacity duration-700 group-hover:opacity-0"
            />
            {/* ホバー時のキャプション */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-4 left-4 translate-y-2 bg-[#F5F1E8]/92 px-3 py-1.5 font-['Noto_Sans_JP'] text-[11px] tracking-[0.2em] text-[#1D1812] opacity-0 backdrop-blur-sm transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 md:bottom-5 md:left-5"
            >
              {tile.label[lang]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  const locale = useLocale();
  const lang: Lang = locale === "en" ? "en" : "ja";

  const h1Keyword =
    lang === "ja"
      ? "富士市の着物撮影・着物体験スタジオ DMC FUJI"
      : "Ceremonial Kimono Experience & Photography in Fuji, Shizuoka";

  const content: Record<
    Lang,
    {
      eyebrow: string;
      lead: string;
      tagline: string;
      reserve: string;
      gallery: string;
      scroll: string;
    }
  > = {
    ja: {
      eyebrow: "DMC FUJI — 静岡県富士市",
      lead: "富士山と茶畑を望むまちで、伝統の着物に袖を通す。プロのライティングとスタイリングで、一生に一度の瞬間を残します。",
      tagline: "富士山と、茶畑と、着物と。",
      reserve: "ご予約はこちら",
      gallery: "作品を見る",
      scroll: "スクロール",
    },
    en: {
      eyebrow: "DMC FUJI — Fuji City, Shizuoka",
      lead: "Slip into a ceremonial kimono in a town framed by Mt. Fuji and tea fields. Professional lighting and styling for a once-in-a-lifetime portrait.",
      tagline: "富士山と、茶畑と、着物と。",
      reserve: "Reserve a Session",
      gallery: "View Gallery",
      scroll: "Scroll",
    },
  };

  const t = content[lang];

  const inkShadow = "0 1px 3px rgba(29,24,18,0.6)";
  // 文字の行の裏にだけ敷く墨の帯（行ごとに分割される）
  const band =
    "inline box-decoration-clone bg-[#1D1812]/85 px-[0.35em] py-[0.12em]";

  return (
    <section className="relative min-h-svh overflow-hidden bg-[#1D1812]">
      {/* 写真ウォール（背景・ホバー可能） */}
      <div
        className="absolute inset-0 select-none"
        aria-hidden="true"
        style={{ transform: "rotate(-4deg) scale(1.22)" }}
      >
        <div className="flex h-full gap-4 md:gap-6">
          <WallColumn tiles={WALL_COLUMNS[0]} drift="slow" lang={lang} />
          <WallColumn tiles={WALL_COLUMNS[1]} drift="mid" lang={lang} className="-mt-24" />
          <WallColumn
            tiles={WALL_COLUMNS[2]}
            drift="fast"
            lang={lang}
            className="hidden md:block"
          />
        </div>
      </div>

      {/* 上端（透明ヘッダー用）と下端（次セクションへの繋ぎ）だけ薄く、中央は写真の明るさを残す */}
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(29,24,18,0.42) 0%, rgba(29,24,18,0.04) 24%, rgba(29,24,18,0.04) 74%, rgba(29,24,18,0.5) 100%)",
        }}
      />
      {/* 縦書きタグライン（右端） */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.0 }}
        aria-hidden="true"
        className="pointer-events-none absolute right-5 top-1/2 z-10 hidden -translate-y-1/2 select-none font-mincho text-sm tracking-[0.5em] text-[#F5F1E8]/85 md:right-10 md:block"
        style={{ writingMode: "vertical-rl", textShadow: inkShadow }}
      >
        {t.tagline}
      </motion.p>

      {/* コンテンツ（ラッパーはクリックを透過し、写真のホバーを邪魔しない） */}
      <div className="pointer-events-none relative z-10 flex min-h-svh flex-col items-center justify-center px-6 py-28 text-center">
        {/*
          日本語ページ: 見える H1 は日本語のキーワード行（英字の大見出しは装飾）。
          英語ページ: 英字の大見出しがそのまま H1。
          同じ見た目のまま、ja/en で H1 の中身を言語ごとに分ける（重複コンテンツ対策）。
        */}
        {lang === "ja" ? (
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative font-mincho text-xs font-normal tracking-[0.34em] text-[#EBD6A6] md:text-sm"
          >
            <span className={band}>{h1Keyword}</span>
          </motion.h1>
        ) : (
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="relative font-mincho text-[11px] tracking-[0.4em] text-[#EBD6A6] md:text-xs"
          >
            <span className={band}>{t.eyebrow}</span>
          </motion.p>
        )}

        {lang === "ja" ? (
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            aria-hidden="true"
            className="relative mt-7 font-serif text-[clamp(2.4rem,7vw,5rem)] font-normal leading-[1.28] tracking-[0.03em] text-[#F5F1E8]"
          >
            <span className={band}>
              Ceremonial
              <br />
              Kimono Experience
            </span>
          </motion.p>
        ) : (
          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            className="relative mt-7 font-serif text-[clamp(2.4rem,7vw,5rem)] font-normal leading-[1.28] tracking-[0.03em] text-[#F5F1E8]"
          >
            <span className="sr-only">{h1Keyword}</span>
            <span aria-hidden="true" className={band}>
              Ceremonial
              <br />
              Kimono Experience
            </span>
          </motion.h1>
        )}

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.55 }}
          className="relative mt-8 max-w-xl font-mincho text-[13px] leading-[2.6] tracking-[0.08em] text-[#F5F1E8] md:text-[15px]"
        >
          <span className={band}>{t.lead}</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.75 }}
          className="pointer-events-auto relative mt-11 flex flex-col items-center gap-5 sm:flex-row sm:gap-8"
        >
          <a
            href="https://dmcfuji0823.wixsite.com/reservation/en"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#F5F1E8] px-11 py-4 font-['Noto_Sans_JP'] text-[13px] font-medium tracking-[0.22em] text-[#1D1812] shadow-[0_12px_40px_rgba(29,24,18,0.35)] transition-colors duration-300 hover:bg-[#C9A97C]"
          >
            {t.reserve}
          </a>
          <Link
            href={`/${locale}/gallery`}
            className="inline-block bg-[#1D1812]/85 px-4 py-2 font-['Noto_Sans_JP'] text-[13px] tracking-[0.22em] text-[#F5F1E8] transition-colors duration-300 hover:text-[#C9A97C]"
          >
            <span className="border-b border-[#C9A97C]/70 pb-0.5">{t.gallery}</span>
          </Link>
        </motion.div>
      </div>

      {/* スクロールキュー */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="font-['Noto_Sans_JP'] text-[10px] uppercase tracking-[0.3em] text-[#E8DFD0]/70">
          {t.scroll}
        </span>
        <span className="hero-scroll-line block h-10 w-px bg-gradient-to-b from-[#C9A97C] to-transparent" />
      </motion.div>
    </section>
  );
}
