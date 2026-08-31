"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

/**
 * 写真ウォール・ヒーロー（編集誌的レイアウト）。
 *
 * 写真には一切手を入れない（暗幕・ぼかし・帯・プレートなし）。
 * 代わりに、着物写真の3カラムが流れるウォールを右 2/3（モバイルは上半分）に寄せ、
 * -4° の回転でできる斜めの縁をそのまま見せる。文字は左側の墨の地に左揃えで置き、
 * 大見出しの端だけが写真に食い込むコリジョンで一枚の構図にする。
 * ドリフトは CSS keyframes（globals.css の .hero-drift-*）で駆動。
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
 * 各列の先頭2枚が初期表示に入る。3列目はモバイルでは非表示。
 * 列の長さはドリフト時間（globals.css）と釣り合わせてある。
 */
const WALL_COLUMNS: Tile[][] = [
  // 左列: 大見出しの端が触れるので、左端が静かなカット（風景・空間・被写体が中央）
  [TILES.fuji, TILES.studio, TILES.rack, TILES.chloe, TILES.entrance, TILES.counter],
  // 中央列: 看板写真（茶畑×富士×着物）と神社・白無垢
  [TILES.camu, TILES.shrine, TILES.uchikake, TILES.shiromuku, TILES.cafe],
  // 右列: 富士山×人物
  [TILES.cha, TILES.fujiCouple, TILES.standing, TILES.fujiDuo, TILES.dresses],
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
              sizes="(min-width: 768px) 24vw, 58vw"
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

  // 見出しの端が写真に食い込む部分のための、ごく柔らかい影（面としては見えない）
  const headlineShadow =
    "0 2px 32px rgba(29,24,18,0.55), 0 1px 2px rgba(29,24,18,0.35)";
  const reveal = [0.22, 1, 0.36, 1] as const;

  const headlineLines = ["Ceremonial", "Kimono", "Experience"];
  const headlineClass =
    "mt-5 w-max max-w-none font-serif text-[clamp(3rem,7.2vw,7rem)] font-normal leading-[0.98] text-[#F5F1E8] md:mt-6";

  // 一行ずつ下から立ち上がる見出し（ディセンダが切れないよう少し下に余白）
  const Headline = (
    <>
      {headlineLines.map((line, i) => (
        <span
          key={line}
          className="-mb-[0.14em] block overflow-hidden pb-[0.14em] whitespace-nowrap"
        >
          <motion.span
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, delay: 0.25 + i * 0.1, ease: reveal }}
            className="block"
            style={{ textShadow: headlineShadow }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </>
  );

  return (
    <section className="relative min-h-svh overflow-hidden bg-[#1D1812]">
      {/*
        写真ウォール（背景・ホバー可能）。
        モバイル: 上 50svh。md 以上: 右 68vw。どちらも -4° 回転させ、
        回転で生まれる斜めの縁（左／下）をそのまま構図の一部として見せる。
        外にはみ出す分は section の overflow-hidden で切る。
      */}
      <div
        className="absolute inset-x-[-8vw] top-[-6%] h-[52svh] select-none md:inset-x-auto md:inset-y-[-8%] md:right-[-7vw] md:h-auto md:w-[68vw]"
        aria-hidden="true"
        style={{ transform: "rotate(-4deg)" }}
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

      {/* 上端（透明ヘッダー用）だけ薄く。写真の中央は明るいまま */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(29,24,18,0.45) 0%, rgba(29,24,18,0) 100%)",
        }}
      />

      {/* 縦書きタグライン（左端・墨の地の上） */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2, delay: 1.1 }}
        aria-hidden="true"
        className="pointer-events-none absolute left-7 top-1/2 z-10 hidden -translate-y-1/2 select-none font-mincho text-[13px] tracking-[0.5em] text-[#F5F1E8]/55 md:block lg:left-10"
        style={{ writingMode: "vertical-rl" }}
      >
        {t.tagline}
      </motion.p>

      {/* コンテンツ（ラッパーはクリックを透過し、写真のホバーを邪魔しない） */}
      <div className="pointer-events-none relative z-10 flex min-h-svh flex-col justify-start px-6 pb-12 pt-[48svh] md:justify-center md:py-28 md:pl-[clamp(5rem,8vw,8.5rem)] md:pr-0">
        <div className="w-full md:w-[29vw] md:min-w-[14rem] md:max-w-[40rem]">
          {/*
            日本語ページ: 見える H1 は日本語のキーワード行（英字の大見出しは装飾）。
            英語ページ: 英字の大見出しがそのまま H1。
            同じ見た目のまま、ja/en で H1 の中身を言語ごとに分ける（重複コンテンツ対策）。
          */}
          {lang === "ja" ? (
            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: reveal }}
              className="flex items-start gap-3 font-mincho text-[11px] font-normal leading-[1.5] tracking-[0.2em] text-[#EBD6A6] md:gap-4 md:tracking-[0.24em] xl:text-[12px] xl:tracking-[0.3em]"
            >
              <span aria-hidden="true" className="mt-[0.75em] h-px w-5 shrink-0 bg-[#C9A97C]/80 md:w-8" />
              <span>{h1Keyword}</span>
            </motion.h1>
          ) : (
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: reveal }}
              className="flex items-start gap-3 font-mincho text-[11px] leading-[1.5] tracking-[0.26em] text-[#EBD6A6] md:gap-4 md:tracking-[0.3em] xl:text-[12px] xl:tracking-[0.36em]"
            >
              <span aria-hidden="true" className="mt-[0.75em] h-px w-5 shrink-0 bg-[#C9A97C]/80 md:w-8" />
              <span>{t.eyebrow}</span>
            </motion.p>
          )}

          {lang === "ja" ? (
            <p aria-hidden="true" className={headlineClass}>
              {Headline}
            </p>
          ) : (
            <h1 className={headlineClass}>
              <span className="sr-only">{h1Keyword}</span>
              <span aria-hidden="true">{Headline}</span>
            </h1>
          )}

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: reveal }}
            className="mt-7 max-w-[24rem] font-mincho text-[13px] leading-[2.1] tracking-[0.06em] text-[#F5F1E8]/85 md:mt-10 md:text-[14px] md:leading-[2.2]"
          >
            {t.lead}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: reveal }}
            className="pointer-events-auto mt-8 flex flex-wrap items-center gap-x-6 gap-y-5 md:mt-11 lg:gap-x-8"
          >
            <a
              href="https://dmcfuji0823.wixsite.com/reservation/en"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#F5F1E8] px-9 py-4 font-['Noto_Sans_JP'] text-[13px] font-medium tracking-[0.22em] text-[#1D1812] transition-colors duration-300 hover:bg-[#C9A97C] lg:px-10"
            >
              {t.reserve}
            </a>
            <Link
              href={`/${locale}/gallery`}
              className="inline-block font-['Noto_Sans_JP'] text-[13px] tracking-[0.22em] text-[#F5F1E8] transition-colors duration-300 hover:text-[#C9A97C]"
            >
              <span className="border-b border-[#C9A97C]/70 pb-1">{t.gallery}</span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* スクロールキュー（左下・文字列と同じ左端） */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="pointer-events-none absolute bottom-8 left-[clamp(5rem,8vw,8.5rem)] z-10 hidden items-center gap-4 md:flex"
        aria-hidden="true"
      >
        <span className="hero-scroll-line block h-10 w-px bg-gradient-to-b from-[#C9A97C] to-transparent" />
        <span className="font-['Noto_Sans_JP'] text-[10px] uppercase tracking-[0.3em] text-[#E8DFD0]/60">
          {t.scroll}
        </span>
      </motion.div>
    </section>
  );
}
