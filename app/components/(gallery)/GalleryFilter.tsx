"use client";

import { useLocale } from "next-intl";

interface GalleryFilterProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}

export default function GalleryFilter({
  activeCategory,
  setActiveCategory,
}: GalleryFilterProps) {
  const locale = useLocale();

  const categories = {
    ja: [
      { id: "all", label: "すべて" },
      { id: "kimono", label: "着物撮影" },
      { id: "mtfuji", label: "富士山" },
      { id: "objects", label: "オブジェ" },
      { id: "shoots", label: "撮影" },
    ],
    en: [
      { id: "all", label: "All" },
      { id: "kimono", label: "Kimono" },
      { id: "mtfuji", label: "Mt. Fuji" },
      { id: "objects", label: "Objects" },
      { id: "shoots", label: "Shoots" },
    ],
  };

  const items = categories[locale as keyof typeof categories] || categories.ja;

  return (
    <div className="mt-8 md:mt-12 mb-8 md:mb-12">
      <div className="mx-auto max-w-[1200px] px-5 md:px-6">
        <div className="overflow-x-auto scroll-smooth">
          <div className="flex gap-2 snap-x snap-mandatory md:gap-3">
            {items.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                aria-pressed={activeCategory === category.id}
                className={`snap-start whitespace-nowrap border px-5 py-2 font-['Noto_Sans_JP'] text-[13px] tracking-[0.12em] transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A97C] focus-visible:ring-offset-2 ${
                  activeCategory === category.id
                    ? "border-[#2C2418] bg-[#2C2418] font-medium text-[#F5F1E8]"
                    : "border-[#2C2418]/15 bg-transparent text-[#5A5245] hover:border-[#8B7355]/50 hover:text-[#2C2418]"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
