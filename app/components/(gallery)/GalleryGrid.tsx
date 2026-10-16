"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Lightbox from "./Lightbox";
import { getAllGalleryImages, GalleryImage } from "@/lib/supabase";

function subscribeEagerCount() {
  return () => {};
}

function getEagerCountSnapshot() {
  const w = window.innerWidth;
  // sm未満:3, md未満:4, それ以上:6 くらいが体感バランス良い
  return w < 640 ? 3 : w < 1024 ? 4 : 6;
}

function getEagerCountServerSnapshot() {
  return 3;
}

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
  const [fetchSettled, setFetchSettled] = useState(initialImages.length > 0);
  const loadingList = initialImages.length === 0 && !fetchSettled;
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageCategory, setPageCategory] = useState(activeCategory);
  const categoryChanged = pageCategory !== activeCategory;
  const page = categoryChanged ? 1 : currentPage;
  if (categoryChanged) {
    setPageCategory(activeCategory);
    setCurrentPage(1);
  }

  // 画面幅に応じて「先頭何枚を eager にするか」。SSR はモバイル想定の 3。
  const eagerCount = useSyncExternalStore(
    subscribeEagerCount,
    getEagerCountSnapshot,
    getEagerCountServerSnapshot
  );

  // 初回画像が無いときだけ取り直す
  useEffect(() => {
    if (initialImages.length > 0) return;
    let cancelled = false;
    (async () => {
      setFetchSettled(false);
      try {
        const images = await getAllGalleryImages();
        if (!cancelled) setAllImages(images);
      } catch (e) {
        console.error("Error fetching gallery images:", e);
      } finally {
        if (!cancelled) setFetchSettled(true);
      }
    })();
    return () => {
      cancelled = true;
    };
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
  const startIndex = (page - 1) * imagesPerPage;
  const currentImages = filteredImages.slice(
    startIndex,
    startIndex + imagesPerPage
  );

  // 先頭N枚の読み込みカウント（lazy待ちで詰まらないように）
  const loaderKey = `${startIndex}|${activeCategory}|${filteredImages.length}|${eagerCount}`;
  const [loader, setLoader] = useState<{
    key: string;
    loaded: number;
    show: boolean;
  } | null>(null);
  const loaderMatches = loader !== null && loader.key === loaderKey;
  const loadedEagerCount = loaderMatches ? loader.loaded : 0;
  const showLoader = loaderMatches ? loader.show : true;
  if (!loaderMatches) {
    setLoader({ key: loaderKey, loaded: 0, show: true });
  }
  const targetEager = Math.min(eagerCount, currentImages.length);

  // ページ/フィルター変更時のフォールバックタイマー
  useEffect(() => {
    // 1.8秒フォールバック：ネットが遅くても表示を開始
    const t = setTimeout(() => {
      setLoader((current) =>
        current && current.key === loaderKey
          ? { ...current, show: false }
          : current
      );
    }, 1800);
    return () => clearTimeout(t);
  }, [loaderKey]);

  const markEagerLoaded = (idx: number) => {
    if (idx >= targetEager) return;
    setLoader((current) => {
      if (!current || current.key !== loaderKey) return current;
      return { ...current, loaded: current.loaded + 1 };
    });
  };

  const handleImageError = (imageId: string, idx: number) => {
    setImageLoadErrors((prev) => {
      const next = new Set(prev);
      if (!next.has(imageId)) next.add(imageId);
      return next;
    });
    // エラーでも eager 対象ならカウントを進める
    markEagerLoaded(idx);
  };

  const handleImageLoaded = (idx: number) => {
    markEagerLoaded(idx);
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
              className="h-8 w-8 rounded-full border-2 border-border border-t-text"
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
                <div key={`skeleton-${i}`} className="overflow-hidden rounded-xl bg-surface">
                  <div className="aspect-[4/5] animate-pulse bg-border/50" />
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
                <div className="relative overflow-hidden bg-background">
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
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-text/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                      <p className="pointer-events-none absolute bottom-4 left-4 translate-y-2 font-['Noto_Sans_JP'] text-[11px] font-medium uppercase tracking-[0.26em] text-background opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                        {image.category}
                      </p>
                    </>
                  ) : (
                    <div className="flex aspect-[4/5] w-full items-center justify-center bg-surface">
                      <p className="text-sm text-text-muted">
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
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`group flex items-center gap-2 font-['Noto_Sans_JP'] text-xs font-medium uppercase tracking-[0.26em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 ${
                page === 1
                  ? "cursor-not-allowed text-text-muted"
                  : "text-text hover:text-text-muted"
              }`}
              aria-label="前のページ"
            >
              <span
                aria-hidden="true"
                className={`transition-transform duration-300 ${
                  page === 1 ? "" : "group-hover:-translate-x-1"
                }`}
              >
                ←
              </span>
              Prev
            </button>
            <span className="select-none font-mincho text-lg tracking-[0.2em] text-text">
              {String(page).padStart(2, "0")}
              <span className="mx-2 text-border">/</span>
              <span className="text-text-muted">
                {String(totalPages).padStart(2, "0")}
              </span>
            </span>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`group flex items-center gap-2 font-['Noto_Sans_JP'] text-xs font-medium uppercase tracking-[0.26em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 ${
                page === totalPages
                  ? "cursor-not-allowed text-text-muted"
                  : "text-text hover:text-text-muted"
              }`}
              aria-label="次のページ"
            >
              Next
              <span
                aria-hidden="true"
                className={`transition-transform duration-300 ${
                  page === totalPages ? "" : "group-hover:translate-x-1"
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
