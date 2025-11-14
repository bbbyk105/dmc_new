// app/components/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Menu, X } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 背景スクロール制限
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const navItems = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/gallery`, label: t("gallery") },
    { href: `/${locale}/service`, label: t("service") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  // ヘッダーの見た目（メニュー展開中はブラー無効＆完全不透明）
  const headerSkin = isMobileMenuOpen
    ? "bg-white shadow-md"
    : isScrolled
    ? "bg-white/95 shadow-md backdrop-blur-sm"
    : "bg-transparent";

  return (
    <header
      className={`fixed top-0 z-[9999] w-full transition-all duration-300 ${headerSkin}`}
    >
      <nav className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-12">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="flex flex-col">
            <span
              className={`font-['Crimson_Text'] text-xl font-bold transition-colors ${
                isScrolled || isMobileMenuOpen ? "text-[#5A4A3A]" : "text-white"
              }`}
            >
              DMC
            </span>
            <span
              className={`font-['Noto_Sans_JP'] text-xs tracking-wider transition-colors ${
                isScrolled || isMobileMenuOpen
                  ? "text-[#8B7355]"
                  : "text-white/90"
              }`}
            >
              DressManCode
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-wider transition-colors ${
                isScrolled
                  ? "text-[#5A4A3A] hover:text-[#8B7355]"
                  : "text-white hover:text-[#C9A97C]"
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* Reserve Button */}
          <a
            href="https://dmcfuji0823.wixsite.com/reservation/en"
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded border-2 px-6 py-2 font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-wider transition-all ${
              isScrolled
                ? "border-[#8B7355] bg-[#8B7355] text-white hover:border-[#5A4A3A] hover:bg-[#5A4A3A]"
                : "border-white bg-white/10 text-white hover:bg-white hover:text-[#5A4A3A]"
            }`}
          >
            {t("reserve")}
          </a>

          {/* Language Switcher */}
          <LanguageSwitcher isScrolled={isScrolled} />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          className="relative z-[10001] lg:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-[#5A4A3A]" />
          ) : (
            <Menu
              className={`h-6 w-6 ${
                isScrolled ? "text-[#5A4A3A]" : "text-white"
              }`}
            />
          )}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[10000] bg-black/70 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu（透け防止：完全不透明 + 正しいgradientクラス + 有効z-index） */}
      <div
        className={`fixed right-0 top-0 z-[10001] h-full w-[85%] max-w-sm transform
        bg-[#5A4A3A] bg-gradient-to-br from-[#5A4A3A] via-[#6B5A4A] to-[#5A4A3A]
        shadow-2xl transition-transform duration-300 ease-in-out lg:hidden
        ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex h-full flex-col">
          {/* Header with Close Button */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-6">
            <div className="flex flex-col">
              <span className="font-['Crimson_Text'] text-2xl font-bold text-white">
                DMC
              </span>
              <span className="font-['Noto_Sans_JP'] text-xs tracking-wider text-white/80">
                DressManCode
              </span>
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded-full p-2 transition-colors hover:bg-white/10"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-6 py-8">
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="group relative overflow-hidden rounded-lg px-4 py-4 font-['Noto_Sans_JP'] text-base font-medium uppercase tracking-wider text-white/90 transition-all hover:bg-white/10 hover:text-white"
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                }}
              >
                <span className="relative z-10">{item.label}</span>
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-300 group-hover:translate-x-full" />
              </Link>
            ))}
          </nav>

          {/* Bottom Section */}
          <div className="space-y-4 border-t border-white/10 px-6 py-6">
            <a
              href="https://dmcfuji0823.wixsite.com/reservation/en"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block rounded-lg border-2 border-white bg-white px-6 py-3 text-center font-['Noto_Sans_JP'] text-sm font-semibold uppercase tracking-wider text-[#5A4A3A] transition-all hover:bg-transparent hover:text-white"
            >
              {t("reserve")}
            </a>
            <div className="flex justify-center">
              <LanguageSwitcher isScrolled={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </header>
  );
}
