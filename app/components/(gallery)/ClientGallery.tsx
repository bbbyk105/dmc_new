"use client";

import { useState } from "react";
import GalleryFilter from "./GalleryFilter";
import GalleryGrid from "./GalleryGrid";
import { GalleryImage } from "@/lib/supabase";

interface ClientGalleryProps {
  initialImages: GalleryImage[];
}

export default function ClientGallery({ initialImages }: ClientGalleryProps) {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <div className="pb-16 md:pb-20">
      <GalleryFilter
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      <GalleryGrid
        activeCategory={activeCategory}
        initialImages={initialImages}
      />
    </div>
  );
}
