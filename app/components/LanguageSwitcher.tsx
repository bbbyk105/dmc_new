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
              ? "text-[#8B7355]"
              : "text-white"
            : isScrolled
            ? "text-gray-400 hover:text-[#8B7355]"
            : "text-white/60 hover:text-white"
        }`}
      >
        日本語
      </button>
      <span className={`${isScrolled ? "text-gray-400" : "text-white/60"}`}>
        /
      </span>
      <button
        onClick={() => switchLocale("en")}
        className={`font-['Noto_Sans_JP'] text-sm font-medium transition-colors ${
          locale === "en"
            ? isScrolled
              ? "text-[#8B7355]"
              : "text-white"
            : isScrolled
            ? "text-gray-400 hover:text-[#8B7355]"
            : "text-white/60 hover:text-white"
        }`}
      >
        EN
      </button>
    </div>
  );
}
