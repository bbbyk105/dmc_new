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
      { id: "studio", label: "スタジオ" },
      { id: "chloe", label: "Chloe" },
      { id: "gallery", label: "ギャラリー" },
    ],
    en: [
      { id: "all", label: "All" },
      { id: "kimono", label: "Ceremonial Kimono" },
      { id: "studio", label: "Studio" },
      { id: "chloe", label: "Chloe" },
      { id: "gallery", label: "Gallery" },
    ],
  };

  const items = categories[locale as keyof typeof categories] || categories.ja;

  return (
    <div className="mt-8 md:mt-12 mb-8 md:mb-12">
      <div className="mx-auto max-w-[1200px] px-5 md:px-6">
        <div className="overflow-x-auto scroll-smooth">
          <div className="flex gap-8 border-b border-black/5 snap-x snap-mandatory">
            {items.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`snap-start whitespace-nowrap border-b-2 px-4 py-3 mb-[-1px] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2 ${
                  activeCategory === category.id
                    ? "border-[#111] font-medium text-[#111]"
                    : "border-transparent text-[#5A5A5A] hover:text-[#111]"
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
