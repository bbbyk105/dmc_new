"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

export default function LanguageSwitcher({
  isScrolled,
}: {
  isScrolled: boolean;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/").filter(Boolean);

    if (segments[0] === "ja" || segments[0] === "en") {
      segments[0] = newLocale;
    } else {
      segments.unshift(newLocale);
    }

    const newPathname = `/${segments.join("/")}`;
    router.push(newPathname);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => switchLocale("ja")}
        className={`font-['Noto_Sans_JP'] text-sm font-medium transition-colors ${
          locale === "ja"
            ? isScrolled
              ? "text-brand"
              : "text-brand-soft"
            : isScrolled
            ? "text-text-muted hover:text-brand"
            : "text-background/60 hover:text-background"
        }`}
      >
        日本語
      </button>
      <span className={`${isScrolled ? "text-border" : "text-background/40"}`}>
        /
      </span>
      <button
        onClick={() => switchLocale("en")}
        className={`font-['Noto_Sans_JP'] text-sm font-medium transition-colors ${
          locale === "en"
            ? isScrolled
              ? "text-brand"
              : "text-brand-soft"
            : isScrolled
            ? "text-text-muted hover:text-brand"
            : "text-background/60 hover:text-background"
        }`}
      >
        EN
      </button>
    </div>
  );
}
