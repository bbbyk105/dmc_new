"use client";

import { useLocale } from "next-intl";

export default function GalleryHero() {
  const locale = useLocale();

  const content = {
    ja: {
      title: "Gallery",
      srTitle: "富士市の着物撮影ギャラリー｜DMC FUJI 作品集",
      subtitle: "私たちが撮影した特別な瞬間をご覧ください",
      introHeading: "富士山と茶畑を背景にした着物撮影の作品集",
      introBody:
        "DMC FUJIは静岡県富士市のスタジオを拠点に、富士山と茶畑を望むロケーションで着物撮影を行っています。成人式の前撮りや七五三、ブライダル、記念日のポートレートまで、お一人おひとりの装いに合わせて撮影した作例を掲載しています。下記のカテゴリーから、着物・富士山・スタジオなどの写真をご覧ください。",
    },
    en: {
      title: "Gallery",
      srTitle: "Kimono Photography Gallery in Fuji｜DMC FUJI Portfolio",
      subtitle: "Explore the special moments we've captured",
      introHeading: "Kimono Photography with Mt. Fuji and Tea Fields",
      introBody:
        "At DMC FUJI, we photograph kimono experiences at our Fuji City studio and on location with Mt. Fuji and the surrounding tea fields. From coming-of-age (Seijin-shiki) and Shichi-Go-San to bridal and anniversary portraits, each session is styled around the individual. Browse the collection below by category — kimono, Mt. Fuji, studio, and more.",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-6">
        <div className="space-y-3">
          <h1 className="font-mincho text-3xl font-semibold tracking-tight text-[#111] md:text-5xl">
            <span className="sr-only">{t.srTitle}</span>
            <span aria-hidden="true">{t.title}</span>
          </h1>
          <p className="text-[15px] leading-7 text-[#5A5A5A] md:text-base">
            {t.subtitle}
          </p>
        </div>

        <div className="mt-8 max-w-3xl space-y-3 border-t border-black/5 pt-8">
          <h2 className="font-mincho text-xl font-semibold tracking-tight text-[#2C2C2C] md:text-2xl">
            {t.introHeading}
          </h2>
          <p className="text-sm leading-7 text-[#5A5A5A] md:text-[15px]">
            {t.introBody}
          </p>
        </div>
      </div>
    </section>
  );
}
