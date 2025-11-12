"use client";

import { useState } from "react";
import GalleryFilter from "./GalleryFilter";
import GalleryGrid from "./GalleryGrid";
import { GalleryImage } from "@/lib/supabase"; // ← Supabase 側の型を使用

interface ClientGalleryProps {
  initialImages: GalleryImage[]; // ← any[] を型安全に修正
}

export default function ClientGallery({ initialImages }: ClientGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <>
      <GalleryFilter
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <GalleryGrid
        activeCategory={activeCategory}
        initialImages={initialImages}
      />
    </>
  );
}
