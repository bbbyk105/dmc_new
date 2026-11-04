"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Lightbox from "./Lightbox";
// 型だけを読む。写真の一覧はサーバー（page.tsx）が読んで渡す。ブラウザから Supabase には行かない
import type { GalleryImage } from "@/lib/supabase";

interface GalleryGridProps {
  activeCategory: string;
  initialImages: GalleryImage[];
}

export default function GalleryGrid({
  activeCategory,
  initialImages,
}: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const allImages = initialImages;
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );
  // ページはカテゴリと組で持つ。カテゴリが変わったら 1 ページ目に戻る
  const [paging, setPaging] = useState({ category: activeCategory, page: 1 });
  const currentPage = paging.category === activeCategory ? paging.page : 1;

  // 画面幅に応じて「先頭何枚を eager にするか」（サーバーではモバイル想定の 3）
  const eagerCount = useSyncExternalStore(subscribeResize, eagerCountForWindow, () => 3);

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

  // 先頭N枚の読み込みカウント（lazy待ちで詰まらないように）。
  // ページ・フィルターが変わったら数え直すので、いま見ている並び（view）ごとに持つ
  const targetEager = Math.min(eagerCount, currentImages.length);
  const view = `${startIndex}|${activeCategory}|${filteredImages.length}|${eagerCount}`;
  const [loaded, setLoaded] = useState({ view, count: 0 });
  const loadedEagerCount = loaded.view === view ? loaded.count : 0;
  const countLoaded = () => setLoaded((prev) => ({ view, count: (prev.view === view ? prev.count : 0) + 1 }));

  // 1.8秒フォールバック：ネットが遅くても表示を開始
  const [timedOutView, setTimedOutView] = useState<string | null>(null);
  useEffect(() => {
    const t = setTimeout(() => setTimedOutView(view), 1800);
    return () => clearTimeout(t);
  }, [view]);

  const handleImageError = (imageId: string, idx: number) => {
    setImageLoadErrors((prev) => {
      const next = new Set(prev);
      if (!next.has(imageId)) next.add(imageId);
      return next;
    });
    // エラーでも eager 対象ならカウントを進める
    if (idx < targetEager) countLoaded();
  };

  const handleImageLoaded = (idx: number) => {
    if (idx < targetEager) countLoaded();
  };

  // 表示判定：先頭N枚が読み込み完了 or フォールバック経過
  const readyToShow = loadedEagerCount >= targetEager || timedOutView === view;

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setPaging({ category: activeCategory, page });
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
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`group flex items-center gap-2 font-['Noto_Sans_JP'] text-xs font-medium uppercase tracking-[0.26em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 ${
                currentPage === 1
                  ? "cursor-not-allowed text-text-muted"
                  : "text-text hover:text-text-muted"
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
            <span className="select-none font-mincho text-lg tracking-[0.2em] text-text">
              {String(currentPage).padStart(2, "0")}
              <span className="mx-2 text-border">/</span>
              <span className="text-text-muted">
                {String(totalPages).padStart(2, "0")}
              </span>
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`group flex items-center gap-2 font-['Noto_Sans_JP'] text-xs font-medium uppercase tracking-[0.26em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-text focus-visible:ring-offset-2 ${
                currentPage === totalPages
                  ? "cursor-not-allowed text-text-muted"
                  : "text-text hover:text-text-muted"
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

function subscribeResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

/** sm未満:3, md未満:4, それ以上:6 くらいが体感バランス良い */
function eagerCountForWindow() {
  const w = window.innerWidth;
  return w < 640 ? 3 : w < 1024 ? 4 : 6;
}
