/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import Lightbox from "./Lightbox";
import { getAllGalleryImages, GalleryImage } from "@/lib/supabase";

interface GalleryGridProps {
  activeCategory: string;
  initialImages: GalleryImage[];
}

export default function GalleryGrid({
  activeCategory,
  initialImages,
}: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [allImages, setAllImages] = useState<GalleryImage[]>(
    initialImages ?? []
  );
  const [loading, setLoading] = useState(allImages.length === 0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  const [overrideSrc, setOverrideSrc] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedCount, setLoadedCount] = useState(0);

  const imagesPerPage = 6;

  // 最新取得（初期はSSR分が即出る）
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const images = await getAllGalleryImages();
        if (mounted) setAllImages(images);
      } catch (e) {
        console.error("Error fetching gallery images:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // フィルタ
  const filteredImages = useMemo(
    () =>
      activeCategory === "all"
        ? allImages
        : allImages.filter((img) => img.category === activeCategory),
    [activeCategory, allImages]
  );

  // ページネーション
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = filteredImages.slice(
    startIndex,
    startIndex + imagesPerPage
  );

  // ページ/絞り込み変更時
  useEffect(() => {
    setCurrentPage(1);
    setSelectedImage(null);
    setLoadedCount(0);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }, [activeCategory]);

  useEffect(() => {
    setLoadedCount(0);
  }, [startIndex, filteredImages.length]);

  const targetCount = currentImages.length;
  const allLoaded = targetCount > 0 && loadedCount >= targetCount;

  /* ▼▼▼ ここから差し替え：プロキシ初期・object直フォールバックだけに統一 ▼▼▼ */
  const toObject = (url: string) =>
    url.replace("/render/image/public/", "/object/public/");

  const handleImageError = (imageId: string, image: GalleryImage) => {
    setImageLoadErrors((prev) => {
      const next = new Set(prev);
      if (!next.has(imageId)) {
        // 初回エラー → object直URLへフォールバック
        setOverrideSrc((s) => ({ ...s, [imageId]: toObject(image.publicUrl) }));
        next.add(imageId);
      } else {
        // 2回目以降はそのまま（既にobject直）。必要なら別の代替画像に差し替え可。
      }
      return next;
    });
    setLoadedCount((c) => c + 1); // 失敗も完了としてカウント
  };
  /* ▲▲▲ ここまで差し替え ▲▲▲ */

  const handleImageLoaded = () => setLoadedCount((c) => c + 1);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 初回の全体ローディング（Filter直下に表示）
  if (loading && allImages.length === 0) {
    return (
      <div className="mt-4 flex min-h-60 items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-10 w-10 rounded-full border-4 border-[#8B7355] border-t-transparent"
          aria-label="読み込み中"
        />
      </div>
    );
  }

  if (filteredImages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 flex min-h-60 items-center justify-center"
      >
        <p className="text-lg text-[#2C2C2C]/60">画像が見つかりませんでした</p>
      </motion.div>
    );
  }

  return (
    <>
      {/* グリッド（全画像ロード完了までクリック不可） */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: allLoaded ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
          allLoaded ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-busy={!allLoaded}
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {currentImages.map((image, index) => {
            /* ▼▼▼ 差し替え：初期は proxiedUrl を使う。override があればそれを優先 ▼▼▼ */
            const src = overrideSrc[image.id] ?? image.proxiedUrl;
            /* ▲▲▲ 差し替えここまで ▲▲▲ */

            const eager = currentPage === 1 && index < 3;
            return (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ y: -10, scale: 1.02 }}
                className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg"
                onClick={() => setSelectedImage(startIndex + index)}
              >
                <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className="h-full w-full"
                  >
                    <Image
                      src={src}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      priority={eager}
                      loading={eager ? "eager" : "lazy"}
                      quality={75}
                      onError={() => handleImageError(image.id, image)}
                      onLoadingComplete={handleImageLoaded}
                      placeholder="blur"
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                    />
                  </motion.div>

                  {/* Hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileHover={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.5, type: "spring" }}
                      className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0114 0zM10 7v6m3-3H7"
                        />
                      </svg>
                    </motion.div>
                  </motion.div>
                </div>

                <motion.div
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#2C2C2C] backdrop-blur-sm"
                >
                  {image.category}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Filter直下のローダー（全画像ロード完了まで） */}
      {!allLoaded && (
        <div className="relative mt-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({
              length: Math.max(currentImages.length, imagesPerPage),
            }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="overflow-hidden rounded-lg bg-white shadow-lg"
              >
                <div className="aspect-3/4 animate-pulse bg-gray-200" />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-10 w-10 rounded-full border-4 border-[#8B7355] border-t-transparent"
              aria-label="読み込み中"
            />
          </div>
        </div>
      )}

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex w-full items-center justify-center gap-3 sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`min-w-14 rounded-md px-3 py-2 text-sm font-medium transition ${
                currentPage === 1
                  ? "cursor-not-allowed text-gray-400"
                  : "text-[#2C2C2C] hover:bg-[#2C2C2C]/10"
              }`}
            >
              前へ
            </button>
            <span className="select-none text-sm font-semibold text-[#2C2C2C]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`min-w-14 rounded-md px-3 py-2 text-sm font-medium transition ${
                currentPage === totalPages
                  ? "cursor-not-allowed text-gray-400"
                  : "text-[#2C2C2C] hover:bg-[#2C2C2C]/10"
              }`}
            >
              次へ
            </button>
          </div>

          <div className="hidden items-center justify-center gap-2 sm:flex">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                currentPage === 1
                  ? "cursor-not-allowed text-gray-400"
                  : "text-[#2C2C2C] hover:bg-[#2C2C2C]/10"
              }`}
            >
              ← 前へ
            </button>
            {(() => {
              const pages: (number | "dots")[] = [];
              const add = (p: number | "dots") => pages.push(p);
              const showWindow = 1;
              const start = Math.max(1, currentPage - showWindow);
              const end = Math.min(totalPages, currentPage + showWindow);
              if (start > 1) add(1);
              if (start > 2) add("dots");
              for (let p = start; p <= end; p++) add(p);
              if (end < totalPages - 1) add("dots");
              if (end < totalPages) add(totalPages);
              return pages.map((p, i) =>
                p === "dots" ? (
                  <span key={`dots-${i}`} className="px-2 text-[#2C2C2C]/60">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    aria-current={p === currentPage ? "page" : undefined}
                    className={`min-w-9 rounded-md px-3 py-2 text-sm font-bold ${
                      p === currentPage
                        ? "bg-[#2C2C2C] text-white shadow-md"
                        : "text-[#2C2C2C] hover:bg-[#2C2C2C]/10"
                    }`}
                  >
                    {p}
                  </button>
                )
              );
            })()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                currentPage === totalPages
                  ? "cursor-not-allowed text-gray-400"
                  : "text-[#2C2C2C] hover:bg-[#2C2C2C]/10"
              }`}
            >
              次へ →
            </button>
          </div>
        </div>
      )}

      {selectedImage !== null && (
        <Lightbox
          images={filteredImages}
          currentIndex={selectedImage}
          onClose={() => setSelectedImage(null)}
          onNavigate={setSelectedImage}
        />
      )}
    </>
  );
}
