"use client";

import { motion } from "framer-motion";
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

      {/* グリッド本体 (masonry: 画像本来のアスペクト比を維持) */}
      <div className="mx-auto max-w-[1200px] px-5 md:px-6 pt-0">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: readyToShow ? 1 : 0 }}
          transition={{ duration: 0.25 }}
          className={`columns-1 gap-6 sm:columns-2 lg:columns-3 md:gap-8 ${
            readyToShow ? "pointer-events-auto" : "pointer-events-none"
          }`}
          aria-busy={!readyToShow}
        >
          {currentImages.map((image, idxOnPage) => {
            const globalIndex = startIndex + idxOnPage;
            const isEager = idxOnPage < targetEager; // 先頭N枚だけ eager

            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.6, delay: (idxOnPage % 3) * 0.08 }}
                className="group mb-6 break-inside-avoid cursor-pointer md:mb-8"
                onClick={() => setSelectedImage(globalIndex)}
              >
                <div className="relative overflow-hidden bg-[#F5F1E8]">
                  {!imageLoadErrors.has(image.id) ? (
                    <>
                      <Image
                        src={image.publicUrl}
                        alt={`DMC FUJI 富士市の着物撮影${
                          image.category && image.category !== "all"
                            ? `（${image.category}）`
                            : ""
                        }`}
                        width={0}
                        height={0}
                        sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
                        style={{ width: "100%", height: "auto" }}
                        className="block transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                        priority={isEager}
                        loading={isEager ? "eager" : "lazy"}
                        quality={85}
                        onError={() => handleImageError(image.id, idxOnPage)}
                        onLoad={() => handleImageLoaded(idxOnPage)}
                        decoding="async"
                      />
                      {/* ホバー時のみ沈み込むグラデーションとカテゴリ表示 */}
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1D1812]/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                      <p className="pointer-events-none absolute bottom-4 left-4 translate-y-2 font-['Noto_Sans_JP'] text-[11px] font-medium uppercase tracking-[0.26em] text-[#F5F1E8] opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        {image.category}
                      </p>
                    </>
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center bg-white">
                      <p className="text-sm text-[#5A5A5A]">
                        画像を読み込めません
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* ページネーション */}
      {totalPages > 1 && (
        <div className="mx-auto mt-16 max-w-[1200px] px-5 md:px-6">
          <div className="flex items-center justify-center gap-10">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`group flex items-center gap-2 font-['Noto_Sans_JP'] text-xs font-medium uppercase tracking-[0.26em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A97C] focus-visible:ring-offset-2 ${
                currentPage === 1
                  ? "cursor-not-allowed text-[#C9C0B0]"
                  : "text-[#8B7355] hover:text-[#2C2418]"
              }`}
              aria-label="前のページ"
            >
              <span
                aria-hidden="true"
                className={`transition-transform duration-300 ${
                  currentPage === 1 ? "" : "group-hover:-translate-x-1"
                }`}
              >
                ←
              </span>
              Prev
            </button>
            <span className="select-none font-mincho text-lg tracking-[0.2em] text-[#2C2418]">
              {String(currentPage).padStart(2, "0")}
              <span className="mx-2 text-[#C9A97C]">/</span>
              <span className="text-[#8B7355]">
                {String(totalPages).padStart(2, "0")}
              </span>
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`group flex items-center gap-2 font-['Noto_Sans_JP'] text-xs font-medium uppercase tracking-[0.26em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A97C] focus-visible:ring-offset-2 ${
                currentPage === totalPages
                  ? "cursor-not-allowed text-[#C9C0B0]"
                  : "text-[#8B7355] hover:text-[#2C2418]"
              }`}
              aria-label="次のページ"
            >
              Next
              <span
                aria-hidden="true"
                className={`transition-transform duration-300 ${
                  currentPage === totalPages ? "" : "group-hover:translate-x-1"
                }`}
              >
                →
              </span>
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
