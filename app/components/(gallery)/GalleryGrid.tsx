"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import Lightbox from "./Lightbox";
import { getAllGalleryImages, GalleryImage } from "@/lib/supabase";

interface GalleryGridProps {
  activeCategory: string;
}

export default function GalleryGrid({ activeCategory }: GalleryGridProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [allImages, setAllImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(
    new Set()
  );

  // Supabaseから画像を取得
  useEffect(() => {
    async function fetchImages() {
      setLoading(true);
      try {
        const images = await getAllGalleryImages();
        setAllImages(images);
      } catch (error) {
        console.error("Error fetching gallery images:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchImages();
  }, []);

  // フィルター処理
  const filteredImages =
    activeCategory === "all"
      ? allImages
      : allImages.filter((img) => img.category === activeCategory);

  // 画像読み込みエラーハンドリング
  const handleImageError = (imageId: string) => {
    setImageLoadErrors((prev) => new Set(prev).add(imageId));
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-[#8B7355] border-t-transparent"
        />
      </div>
    );
  }

  if (filteredImages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex min-h-[400px] items-center justify-center"
      >
        <p className="text-lg text-[#2C2C2C]/60">画像が見つかりませんでした</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        <AnimatePresence mode="popLayout">
          {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg"
              onClick={() => setSelectedImage(index)}
            >
              {/* 画像 */}
              <div className="relative aspect-3/4 overflow-hidden bg-gray-100">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.6 }}
                  className="h-full w-full"
                >
                  {!imageLoadErrors.has(image.id) ? (
                    <Image
                      src={image.publicUrl}
                      alt={image.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      loading="lazy"
                      quality={75}
                      onError={() => handleImageError(image.id)}
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

                {/* オーバーレイ */}
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
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7"
                      />
                    </svg>
                  </motion.div>
                </motion.div>
              </div>

              {/* カテゴリーバッジ */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1 text-xs font-bold uppercase tracking-wider text-[#2C2C2C] backdrop-blur-sm"
              >
                {image.category}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

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
