// app/components/Header.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";
import MobileMenu, { HamburgerButton } from "./MobileMenu";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 透明ヘッダー（白文字）はダークヒーローのあるトップページだけ。
  // 他ページは白背景に重なるため、最初からソリッド表示にする。
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`;
  const solid = isScrolled || !isHome;

  // ページ遷移したらメニューを閉じる（前回の pathname を state に持ち、レンダー中に比較して閉じる）
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setIsMobileMenuOpen(false);
  }

  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

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
    { href: `/${locale}/about`, label: t("about") },
    { href: `/${locale}/service`, label: t("service") },
    { href: `/${locale}/gallery`, label: t("gallery") },
    { href: `/${locale}/blog`, label: t("blog") },
    { href: `/${locale}/contact`, label: t("contact") },
  ];

  // ヘッダーの見た目。メニュー展開中は透明にして、墨のパネルの上にロゴとボタンだけを残す
  const headerSkin = isMobileMenuOpen
    ? "bg-transparent"
    : solid
    ? "border-b border-border bg-background/95 backdrop-blur-sm"
    : "bg-transparent";
  // ロゴ・ハンバーガーを白抜きにする条件（透明ヘッダー時 or メニュー展開中）
  const onDark = !solid || isMobileMenuOpen;

  return (
    <header
      className={`fixed top-0 z-[9999] w-full transition-all duration-300 ${headerSkin}`}
    >
      <nav className="container mx-auto flex items-center justify-between px-6 py-4 lg:px-12">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="relative z-[10001] flex items-center gap-3"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="relative h-10 w-20 md:h-12 md:w-24">
            <Image
              src="/logo/logo.png"
              alt="DMC FUJI - 富士市の着物撮影スタジオ"
              fill
              className={`object-contain transition-all duration-300 ${
                onDark ? "brightness-0 invert" : ""
              }`}
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-6 lg:flex xl:gap-8">
          {navItems.map((item) => {
            // active は「そのページにいる」ことをブランドブラウンで示す
            const active =
              item.href === `/${locale}`
                ? isHome
                : pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`font-['Noto_Sans_JP'] text-sm font-medium uppercase tracking-wider transition-colors ${
                  solid
                    ? active
                      ? "text-brand"
                      : "text-text hover:text-brand"
                    : active
                    ? "text-background"
                    : "text-background/70 hover:text-background"
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Reserve Button（Primary CTA は全ページ・全状態で同じ見た目） */}
          <a
            href="https://dmcfuji0823.wixsite.com/reservation/en"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary min-h-0 px-6 py-2.5 text-xs"
          >
            {t("reserve")}
          </a>

          {/* Language Switcher */}
          <LanguageSwitcher isScrolled={solid} />
        </div>

        {/* Mobile Menu Button（GSAP で × に変形） */}
        <HamburgerButton
          open={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((v) => !v)}
          light={onDark}
          locale={locale}
        />
      </nav>

      {/* Mobile Menu（GSAP フルスクリーン） */}
      <MobileMenu
        open={isMobileMenuOpen}
        onClose={closeMobileMenu}
        navItems={navItems}
        reserveLabel={t("reserve")}
        locale={locale}
      />
    </header>
  );
}
