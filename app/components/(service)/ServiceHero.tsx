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
    <section className="relative flex h-[60vh] items-center justify-center overflow-hidden bg-[#2C2C2C]">
      <div className="absolute inset-0">
        <Image
          src="/images/hero1.jpg"
          alt="Service Background"
          fill
          className="object-cover opacity-40"
          priority
          sizes="100vw"
        />
      </div>

      <div className="relative z-10 text-center space-y-4">
        <h1 className="font-['Crimson_Text'] text-6xl font-black uppercase tracking-tighter text-white md:text-7xl lg:text-8xl">
          {t.title}
        </h1>
        <div className="mx-auto h-0.5 w-24 bg-[#8B7355]" />
        <p className="text-lg font-light tracking-wide text-white/90 md:text-xl">
          {t.subtitle}
        </p>
        <p className="text-sm text-white/70">{t.description}</p>
      </div>
    </section>
  );
}
