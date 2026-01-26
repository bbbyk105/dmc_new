"use client";

import { useLocale } from "next-intl";

export default function GalleryHero() {
  const locale = useLocale();

  const content = {
    ja: {
      title: "Gallery",
      subtitle: "私たちが撮影した特別な瞬間をご覧ください",
    },
    en: {
      title: "Gallery",
      subtitle: "Explore the special moments we've captured",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <section className="bg-white py-12 md:py-16">
      <div className="mx-auto max-w-[1200px] px-5 md:px-6">
        <div className="space-y-3">
          <h1 className="font-['Noto_Sans_JP'] text-3xl font-semibold tracking-tight text-[#111] md:text-5xl">
            {t.title}
          </h1>
          <p className="text-[15px] leading-7 text-[#5A5A5A] md:text-base">
            {t.subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
