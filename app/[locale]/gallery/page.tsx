"use client";

import { useState } from "react";
import GalleryHero from "@/app/components/(gallery)/GalleryHero";
import GalleryFilter from "@/app/components/(gallery)/GalleryFilter";
import GalleryGrid from "@/app/components/(gallery)/GalleryGrid";

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      <GalleryHero />
      <div className="container mx-auto px-6 py-16 lg:px-12">
        <GalleryFilter
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
        <GalleryGrid activeCategory={activeCategory} />
      </div>
    </div>
  );
}
