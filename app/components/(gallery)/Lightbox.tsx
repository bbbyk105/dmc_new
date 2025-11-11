"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { GalleryImage } from "@/lib/supabase";

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function Lightbox({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: LightboxProps) {
  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft")
        onNavigate((currentIndex - 1 + images.length) % images.length);
      if (e.key === "ArrowRight")
        onNavigate((currentIndex + 1) % images.length);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, images.length, onClose, onNavigate]);

  // スクロール防止
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handlePrevious = () => {
    onNavigate((currentIndex - 1 + images.length) % images.length);
  };

  const handleNext = () => {
    onNavigate((currentIndex + 1) % images.length);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
        onClick={onClose}
      >
        {/* 閉じるボタン */}
        <motion.button
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20 md:right-8 md:top-8"
          aria-label="閉じる"
        >
          <X className="h-6 w-6 text-white md:h-8 md:w-8" />
        </motion.button>

        {/* 前へボタン */}
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.2, x: -5 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handlePrevious();
          }}
          className="absolute left-4 z-50 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20 md:left-8"
          aria-label="前の画像"
        >
          <ChevronLeft className="h-6 w-6 text-white md:h-8 md:w-8" />
        </motion.button>

        {/* 次へボタン */}
        <motion.button
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 50 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          whileHover={{ scale: 1.2, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            handleNext();
          }}
          className="absolute right-4 z-50 rounded-full bg-white/10 p-3 backdrop-blur-sm transition-colors hover:bg-white/20 md:right-8"
          aria-label="次の画像"
        >
          <ChevronRight className="h-6 w-6 text-white md:h-8 md:w-8" />
        </motion.button>

        {/* 画像コンテナ */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.5, type: "spring" }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex h-full w-full max-w-6xl items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative h-full w-full"
            >
              <Image
                src={images[currentIndex].publicUrl}
                alt={images[currentIndex].name}
                fill
                className="object-contain"
                sizes="100vw"
                priority
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* カウンター */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-6 py-3 backdrop-blur-sm"
        >
          <p className="text-sm font-medium text-white md:text-base">
            {currentIndex + 1} / {images.length}
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
