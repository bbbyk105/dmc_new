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
  const imagesPerPage = 6;
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);
  const startIndex = (currentPage - 1) * imagesPerPage;
  const currentImages = filteredImages.slice(
    startIndex,
    startIndex + imagesPerPage
  );

  // 先頭N枚の読み込みカウント（lazy待ちで詰まらないように）
  const [loadedEagerCount, setLoadedEagerCount] = useState(0);
  const targetEager = Math.min(eagerCount, currentImages.length);

  // カテゴリ変更時は1ページ目に戻す
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

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
      {/* ローダー */}
      {!readyToShow && (
        <div className="mx-auto max-w-[1200px] px-5 md:px-6">
          <div className="mb-8 flex w-full items-center justify-center">
            <motion.div
              aria-label="読み込み中"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="h-8 w-8 rounded-full border-2 border-black/10 border-t-black/30"
            />
          </div>
        </div>
      )}

      {/* スケルトン（レイアウトシフト防止） */}
      {!readyToShow && (
        <div className="mx-auto max-w-[1200px] px-5 md:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:gap-8">
            {Array.from({ length: Math.max(currentImages.length, imagesPerPage) })
              .slice(0, imagesPerPage)
              .map((_, i) => (
                <div key={`skeleton-${i}`} className="overflow-hidden rounded-xl bg-white">
                  <div className="aspect-[4/5] animate-pulse bg-gray-50" />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* グリッド本体 */}
      <div className="mx-auto max-w-[1200px] px-5 md:px-6 pt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: readyToShow ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 md:gap-8 ${
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
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group cursor-pointer"
                  onClick={() => setSelectedImage(globalIndex)}
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-white">
                    {!imageLoadErrors.has(image.id) ? (
                      <Image
                        src={image.publicUrl}
                        alt={image.name}
                        fill
                        className="object-cover transition-opacity duration-300 group-hover:opacity-90 bg-white"
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        priority={isEager}
                        loading={isEager ? "eager" : "lazy"}
                        quality={85}
                        onError={() => handleImageError(image.id, idxOnPage)}
                        onLoad={() => handleImageLoaded(idxOnPage)}
                        placeholder="blur"
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-white">
                        <p className="text-sm text-[#5A5A5A]">
                          画像を読み込めません
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-wide text-[#5A5A5A]">
                      {image.category}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mx-auto mt-16 max-w-[1200px] px-5 md:px-6">
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`rounded-md border border-black/10 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2 ${
                currentPage === 1
                  ? "cursor-not-allowed border-black/5 text-[#5A5A5A]"
                  : "text-[#111] hover:border-black/20 hover:bg-black/5"
              }`}
              aria-label="前のページ"
            >
              Prev
            </button>
            <span className="select-none text-sm text-[#5A5A5A]">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`rounded-md border border-black/10 px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-black/10 focus:ring-offset-2 ${
                currentPage === totalPages
                  ? "cursor-not-allowed border-black/5 text-[#5A5A5A]"
                  : "text-[#111] hover:border-black/20 hover:bg-black/5"
              }`}
              aria-label="次のページ"
            >
              Next
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
