"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Instagram, Phone, MapPin, Clock } from "lucide-react";

export default function Footer() {
  const t = useTranslations();
  const locale = useLocale();

  const navItems = [
    { href: `/${locale}`, label: t("nav.home") },
    { href: `/${locale}/gallery`, label: t("nav.gallery") },
    { href: `/${locale}/service`, label: t("nav.service") },
    { href: `/${locale}/contact`, label: t("nav.contact") },
  ];

  return (
    <footer className="bg-[#5A4A3A] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-12 lg:px-12">
        {/* 3カラム：会社情報 / メニュー / 連絡先 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/logo.png"
                alt="DMC Logo"
                width={50}
                height={50}
                className="h-12 w-auto brightness-0 invert"
              />
              <div className="flex flex-col">
                <span className="font-['Crimson_Text'] text-2xl font-bold">
                  DMC
                </span>
                <span className="font-['Noto_Sans_JP'] text-xs tracking-widest">
                  Dressman Code
                </span>
              </div>
            </div>
            <p className="font-['Noto_Sans_JP'] text-sm leading-relaxed text-white/80">
              {locale === "ja"
                ? "富士山と茶畑を背景に、あなたの特別な瞬間を美しく残します。"
                : "Capture your special moments with Mt. Fuji and tea fields as your backdrop."}
            </p>
            {/* Social Media */}
            <div className="flex gap-4">
              <a
                href="https://www.instagram.com/dmc_fuji"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white/10 p-2 transition-colors hover:bg-[#8B7355]"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-['Crimson_Text'] text-lg font-bold">
              {locale === "ja" ? "メニュー" : "Menu"}
            </h3>
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-['Noto_Sans_JP'] text-sm text-white/80 transition-colors hover:text-[#C9A97C]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-['Crimson_Text'] text-lg font-bold">
              {t("contact.info.title")}
            </h3>
            <ul className="space-y-3 font-['Noto_Sans_JP'] text-sm text-white/80">
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 h-4 w-4 shrink-0" />
                <span>
                  {locale === "ja"
                    ? "〒417-0001 静岡県富士市新田島町1-13"
                    : "1-13 Aratajimacho, Fuji-shi, Shizuoka, 417-0001, Japan"}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0" />
                <a
                  href="tel:0545-55-4550"
                  className="transition-colors hover:text-[#C9A97C]"
                >
                  +81-545-55-4550
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-1 h-4 w-4 shrink-0" />
                <div>
                  <div>{t("contact.info.hoursValue")}</div>
                  <div className="text-xs">
                    {locale === "ja" ? "定休日: 水曜日" : "Closed: Wednesday"}
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 py-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="font-['Noto_Sans_JP'] text-sm text-white/60">
              {t("footer.copyright")}
            </p>
            <p className="font-['Noto_Sans_JP'] text-sm text-white/60">
              {t("footer.company")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
