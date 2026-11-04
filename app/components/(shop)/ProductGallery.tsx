"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "./ProductImage";

/** 商品ページの写真。大きな写真の下に全部の写真を並べ、押すと切り替わる（左右の矢印でも送れる） */
export default function ProductGallery({ name, images, locale }: { name: string; images: string[]; locale: "ja" | "en" }) {
  const [index, setIndex] = useState(0);
  const en = locale === "en";
  const many = images.length > 1;
  const current = images[index] ?? null;
  const go = (step: number) => setIndex((i) => (i + step + images.length) % images.length);

  const alt = many ? (en ? `${name} (photo ${index + 1} of ${images.length})` : `${name}（${index + 1}枚目）`) : name;
  const arrow =
    "absolute top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-background/80 text-text transition-colors hover:bg-background";

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden bg-background">
        <ProductImage key={current ?? "none"} src={current} alt={alt} sizes="(min-width: 768px) 50vw, 100vw" priority={index === 0} fit="contain" />
        {many && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label={en ? "Previous photo" : "前の写真"} className={`${arrow} left-2`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label={en ? "Next photo" : "次の写真"} className={`${arrow} right-2`}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {many && (
        <div className="grid grid-cols-5 gap-3">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-pressed={i === index}
              aria-label={en ? `Show photo ${i + 1}` : `${i + 1}枚目の写真を表示`}
              className={`relative aspect-square overflow-hidden bg-background transition-opacity ${
                i === index ? "outline outline-1 outline-offset-2 outline-text" : "opacity-60 hover:opacity-100"
              }`}
            >
              <ProductImage src={src} alt="" sizes="(min-width: 768px) 10vw, 20vw" fit="contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
