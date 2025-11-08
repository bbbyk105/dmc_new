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
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { href: `/${locale}`, label: t("home") },
    { href: `/${locale}/gallery`, label: t("gallery") },
    { href: `/${locale}/service`, label: t("service") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "bg-white/95 shadow-md backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-12">
        {/* Logo */}
        <Link href={`/${locale}`} className="flex items-center gap-3">
          <div className="flex flex-col">
            <span
              className={`font-['Crimson_Text'] text-xl font-bold transition-colors ${
                isScrolled ? "text-[#5A4A3A]" : "text-white"
              }`}
            >
              DMC
            </span>
            <span
              className={`font-['Noto_Sans_JP'] text-xs tracking-wider transition-colors ${
                isScrolled ? "text-[#8B7355]" : "text-white/90"
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
            href="https://wix.to/your-booking-page"
            target="_blank"
            rel="noopener noreferrer"
            className={`rounded border-2 px-6 py-2 font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-wider transition-all ${
              isScrolled
                ? "border-[#8B7355] bg-[#8B7355] text-white hover:border-[#5A4A3A] hover:bg-[#5A4A3A]"
                : "border-white bg-white/10 text-white backdrop-blur-sm hover:bg-white hover:text-[#5A4A3A]"
            }`}
          >
            {t("reserve")}
          </a>

          {/* Language Switcher */}
          <LanguageSwitcher isScrolled={isScrolled} />
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X
              className={`h-6 w-6 ${
                isScrolled ? "text-[#5A4A3A]" : "text-white"
              }`}
            />
          ) : (
            <Menu
              className={`h-6 w-6 ${
                isScrolled ? "text-[#5A4A3A]" : "text-white"
              }`}
            />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="bg-white/95 backdrop-blur-sm lg:hidden">
          <div className="container mx-auto flex flex-col gap-4 px-6 py-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-wider text-[#5A4A3A] hover:text-[#8B7355]"
              >
                {item.label}
              </Link>
            ))}
            <a
              href="https://wix.to/your-booking-page"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="rounded border-2 border-[#8B7355] bg-[#8B7355] px-6 py-2 text-center font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-wider text-white"
            >
              {t("reserve")}
            </a>
            <LanguageSwitcher isScrolled={true} />
          </div>
        </div>
      )}
    </header>
  );
}
