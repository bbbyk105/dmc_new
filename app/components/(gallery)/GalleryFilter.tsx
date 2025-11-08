"use client";

import { motion } from "framer-motion";
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
      { id: "portrait", label: "ポートレート" },
      { id: "event", label: "イベント" },
    ],
    en: [
      { id: "all", label: "All" },
      { id: "kimono", label: "Kimono" },
      { id: "studio", label: "Studio" },
      { id: "portrait", label: "Portrait" },
      { id: "event", label: "Event" },
    ],
  };

  const items = categories[locale as keyof typeof categories] || categories.ja;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="mb-12 flex flex-wrap justify-center gap-4"
    >
      {items.map((category, index) => (
        <motion.button
          key={category.id}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ scale: 1.1, y: -5 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveCategory(category.id)}
          className={`relative overflow-hidden px-8 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
            activeCategory === category.id
              ? "bg-[#2C2C2C] text-white shadow-lg"
              : "border-2 border-[#2C2C2C] bg-transparent text-[#2C2C2C] hover:bg-[#2C2C2C] hover:text-white"
          }`}
        >
          {activeCategory === category.id && (
            <motion.div
              layoutId="activeCategory"
              className="absolute inset-0 bg-[#2C2C2C]"
              transition={{ type: "spring", duration: 0.6 }}
            />
          )}
          <span className="relative z-10">{category.label}</span>
        </motion.button>
      ))}
    </motion.div>
  );
}
