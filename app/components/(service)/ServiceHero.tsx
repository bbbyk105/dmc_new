"use client";

import Image from "next/image";
import { useLocale } from "next-intl";

export default function ServiceHero() {
  const locale = useLocale();

  const content = {
    ja: {
      title: "SERVICE",
      subtitle: "サービス案内",
      description: "DMCのサービスを紹介いたします",
    },
    en: {
      title: "SERVICE",
      subtitle: "Our Services",
      description: "Introducing DMC's Services",
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <section className="relative flex h-[60vh] items-center justify-center overflow-hidden bg-text">
      <div className="absolute inset-0">
        <Image
          src="/images/hero1.jpg"
          alt="Service Background"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* 写真の色は変えず、文字を読ませるぶんだけ墨をかける */}
        <div className="absolute inset-0 bg-text/30" aria-hidden="true" />
      </div>

      <div
        className="relative z-10 text-center space-y-4"
        style={{
          textShadow:
            "0 2px 28px color-mix(in srgb, var(--color-text) 60%, transparent)",
        }}
      >
        <h1 className="font-mincho text-6xl font-black uppercase tracking-tighter text-background md:text-7xl lg:text-8xl">
          {t.title}
        </h1>
        <div className="mx-auto h-px w-24 bg-background/60" />
        <p className="text-lg font-light tracking-wide text-background/90 md:text-xl">
          {t.subtitle}
        </p>
        <p className="text-sm text-background/75">{t.description}</p>
      </div>
    </section>
  );
}
