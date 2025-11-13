"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
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
  const [allImages, setAllImages] = useState<GalleryImage[]>(initialImages);
  const [loadingList, setLoadingList] = useState(initialImages.length === 0);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);

  // ▼ ローダー制御（Filter直下に表示）
  const [showLoader, setShowLoader] = useState(true);
  // 画面幅に応じて「先頭何枚を eager にするか」
  const [eagerCount, setEagerCount] = useState(3); // 初期はモバイル想定

  useEffect(() => {
    const w = window.innerWidth;
    // sm未満:3, md未満:4, それ以上:6 くらいが体感バランス良い
    setEagerCount(w < 640 ? 3 : w < 1024 ? 4 : 6);
  }, []);

  // 初回 & 再取得（安全のため）
  useEffect(() => {
    if (initialImages.length > 0) {
      setLoadingList(false);
      return;
    }
    (async () => {
      setLoadingList(true);
      try {
        const images = await getAllGalleryImages();
        setAllImages(images);
      } catch (e) {
        console.error("Error fetching gallery images:", e);
      } finally {
        setLoadingList(false);
      }
    })();
  }, [initialImages]);

  // フィルター
  const filteredImages = useMemo(
    () =>
      activeCategory === "all"
        ? allImages
        : allImages.filter((img) => img.category === activeCategory),
    [activeCategory, allImages]
  );

  // ページング
  const imagesPerPage = 9;
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = filteredImages.slice(
    startIndex,
    startIndex + imagesPerPage
  );

  // 先頭N枚の読み込みカウント（lazy待ちで詰まらないように）
  const [loadedEagerCount, setLoadedEagerCount] = useState(0);
  const targetEager = Math.min(eagerCount, currentImages.length);

  // ページ/フィルター変更時にリセット & フォールバックタイマー
  useEffect(() => {
    setLoadedEagerCount(0);
    setShowLoader(true);

    // 1.8秒フォールバック：ネットが遅くても表示を開始
    const t = setTimeout(() => setShowLoader(false), 1800);
    return () => clearTimeout(t);
  }, [startIndex, activeCategory, filteredImages.length, eagerCount]);

  const handleImageError = (imageId: string, idx: number) => {
    setImageLoadErrors((prev) => {
      const next = new Set(prev);
      if (!next.has(imageId)) next.add(imageId);
      return next;
    });
    // エラーでも eager 対象ならカウントを進める
    if (idx < targetEager) setLoadedEagerCount((c) => c + 1);
  };

  const handleImageLoaded = (idx: number) => {
    if (idx < targetEager) setLoadedEagerCount((c) => c + 1);
  };

  // 表示判定：先頭N枚が読み込み完了 or フォールバック経過
  const readyToShow =
    !loadingList && (loadedEagerCount >= targetEager || !showLoader);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- UI ---
  return (
    <>
      {/* ▼ Filter直下にローダーを固定配置（スマホ/PC共通で視認可能） */}
      {!readyToShow && (
        <div className="mb-6 flex w-full items-center justify-center">
          <motion.div
            aria-label="読み込み中"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="h-10 w-10 rounded-full border-4 border-[#8B7355] border-t-transparent"
          />
        </div>
      )}

      {/* スケルトン（レイアウトシフト防止） */}
      {!readyToShow && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.max(currentImages.length, imagesPerPage) })
            .slice(0, imagesPerPage)
            .map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="overflow-hidden rounded-lg bg-white shadow-lg"
              >
                <div className="aspect-3/4 animate-pulse bg-gray-200" />
              </div>
            ))}
        </div>
      )}

      {/* グリッド本体 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: readyToShow ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${
          readyToShow ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-busy={!readyToShow}
      >
        <AnimatePresence mode="popLayout">
          {currentImages.map((image, idxOnPage) => {
            const globalIndex = startIndex + idxOnPage;
            const isEager = idxOnPage < targetEager; // 先頭N枚だけ eager

            return (
              <motion.div
                key={image.id}
                layout
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                whileHover={{ y: -6, scale: 1.01 }}
                className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg"
                onClick={() => setSelectedImage(globalIndex)}
              >
                <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
                  <motion.div
                    whileHover={{ scale: 1.06 }}
                    transition={{ duration: 0.5 }}
                    className="h-full w-full"
                  >
                    {!imageLoadErrors.has(image.id) ? (
                      <Image
                        src={image.publicUrl /* or `/api/img/${image.url}` */}
                        alt={image.name}
                        fill
                        className="object-cover"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        // ▼ 先頭N枚は即読み込み（lazy待ちで詰まらない）
                        priority={isEager}
                        loading={isEager ? "eager" : "lazy"}
                        quality={75}
                        onError={() => handleImageError(image.id, idxOnPage)}
                        onLoadingComplete={() => handleImageLoaded(idxOnPage)}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gray-200">
                        <p className="text-sm text-gray-600">
                          画像を読み込めません
                        </p>
                      </div>
                    )}
                  </motion.div>

                  {/* hover overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      whileHover={{ scale: 1, rotate: 0 }}
                      transition={{ duration: 0.45, type: "spring" }}
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
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#2C2C2C] backdrop-blur-sm"
                >
                  {image.category}
                </motion.div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* ページネーション（既存そのまま） */}
      {totalPages > 1 && (
        <div className="mt-12 flex flex-col items-center gap-3">
          <div className="flex w-full items-center justify-center gap-3 sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`min-w-14 rounded-md px-3 py-2 text-sm font-medium transition ${
                currentPage === 1
                  ? "cursor-not-allowed text-gray-400"
                  : "text-[#2C2C2C] hover:bg-[#2C2C2C]/10 active:scale-[0.98]"
              }`}
              aria-label="前のページ"
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
                  : "text-[#2C2C2C] hover:bg-[#2C2C2C]/10 active:scale-[0.98]"
              }`}
              aria-label="次へ"
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
              aria-label="前のページ"
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
              aria-label="次へ"
            >
              次へ →
            </button>
          </div>
        </div>
      )}

      {/* Lightbox */}
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
