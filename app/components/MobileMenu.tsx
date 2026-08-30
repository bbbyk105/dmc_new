"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Instagram, Phone } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  TELEPHONE_DISPLAY,
  TELEPHONE_E164,
  HOURS_JA,
  HOURS_EN,
  CLOSED_JA,
  CLOSED_EN,
  SAME_AS_INSTAGRAM,
} from "@/lib/site-info";

gsap.registerPlugin(useGSAP);

export type MobileNavItem = { href: string; label: string };

const RESERVE_URL = "https://dmcfuji0823.wixsite.com/reservation/en";

/* ------------------------------------------------------------------
   ハンバーガーボタン：2本線が GSAP で × に変形する
   ------------------------------------------------------------------ */
export function HamburgerButton({
  open,
  onClick,
  light,
  locale,
}: {
  open: boolean;
  onClick: () => void;
  /** 暗い背景の上に置くときは線を生成り色に */
  light: boolean;
  locale: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useGSAP(
    () => {
      const ease = "power3.inOut";
      const duration = 0.45;
      gsap.to(".hb-top", { y: open ? 5 : 0, rotate: open ? 45 : 0, duration, ease });
      gsap.to(".hb-bottom", { y: open ? -5 : 0, rotate: open ? -45 : 0, duration, ease });
    },
    { scope: ref, dependencies: [open] },
  );

  const lineColor = light ? "bg-[#F5F1E8]" : "bg-[#5A4A3A]";
  const label =
    locale === "ja"
      ? open
        ? "メニューを閉じる"
        : "メニューを開く"
      : open
        ? "Close menu"
        : "Open menu";

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-expanded={open}
      aria-controls="mobile-menu"
      className="relative z-[10001] -mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
    >
      <span className="relative block h-[11.5px] w-7">
        <span
          className={`hb-top absolute left-0 top-0 block h-[1.5px] w-full origin-center transition-colors duration-300 ${lineColor}`}
        />
        <span
          className={`hb-bottom absolute bottom-0 left-0 block h-[1.5px] w-full origin-center transition-colors duration-300 ${lineColor}`}
        />
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------
   フルスクリーンメニュー：
   金の薄いカーテン → 墨のパネルが上から降り、項目がマスクから立ち上がる。
   閉じるときは同じタイムラインを速めに逆再生。
   ------------------------------------------------------------------ */
export default function MobileMenu({
  open,
  onClose,
  navItems,
  reserveLabel,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  navItems: MobileNavItem[];
  reserveLabel: string;
  locale: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const pathname = usePathname();
  const isJa = locale === "ja";

  // タイムラインは一度だけ組む。reduced-motion のときは即時切替。
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        {
          reduce: "(prefers-reduced-motion: reduce)",
          motion: "(prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const reduce = Boolean(ctx.conditions?.reduce);
          const d = (v: number) => (reduce ? 0 : v);

          const timeline = gsap
            .timeline({
              paused: true,
              defaults: { ease: "power3.out" },
              onReverseComplete: () => {
                gsap.set(root.current, { visibility: "hidden", pointerEvents: "none" });
              },
            })
            .set(root.current, { visibility: "visible", pointerEvents: "auto" }, 0)
            .fromTo(
              ".mm-accent",
              { clipPath: "inset(0 0 100% 0)" },
              { clipPath: "inset(0 0 0% 0)", duration: d(0.7), ease: "power4.inOut" },
              0,
            )
            .fromTo(
              ".mm-panel",
              { clipPath: "inset(0 0 100% 0)" },
              { clipPath: "inset(0 0 0% 0)", duration: d(0.8), ease: "power4.inOut" },
              0.1,
            )
            .fromTo(
              ".mm-item-inner",
              { yPercent: 115 },
              { yPercent: 0, duration: d(0.8), stagger: d(0.06) },
              0.45,
            )
            .fromTo(
              ".mm-index",
              { opacity: 0, x: -6 },
              { opacity: 1, x: 0, duration: d(0.5), stagger: d(0.06) },
              0.55,
            )
            .fromTo(
              ".mm-rule",
              { scaleX: 0 },
              { scaleX: 1, duration: d(0.7), ease: "power2.out", transformOrigin: "left center" },
              0.7,
            )
            .fromTo(
              ".mm-footer > *",
              { y: 14, opacity: 0 },
              { y: 0, opacity: 1, duration: d(0.55), stagger: d(0.07) },
              0.8,
            )
            .fromTo(
              ".mm-tagline",
              { opacity: 0 },
              { opacity: 1, duration: d(0.8) },
              0.95,
            );

          tl.current = timeline;
          return () => {
            tl.current = null;
          };
        },
      );
    },
    { scope: root },
  );

  // open の変化で再生／逆再生
  useGSAP(
    () => {
      const timeline = tl.current;
      if (!timeline) return;
      if (open) {
        timeline.timeScale(1).play();
      } else {
        timeline.timeScale(1.7).reverse();
      }
    },
    { dependencies: [open] },
  );

  // Escape で閉じる
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const isActive = (href: string) => pathname === href || pathname === `${href}/`;

  return (
    <div
      ref={root}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={isJa ? "メニュー" : "Menu"}
      aria-hidden={!open}
      className="fixed inset-0 z-[9998] lg:hidden"
      style={{ visibility: "hidden", pointerEvents: "none" }}
    >
      {/* 先行する金の薄いカーテン */}
      <div
        className="mm-accent absolute inset-0 bg-[#C9A97C]"
        aria-hidden="true"
        style={{ clipPath: "inset(0 0 100% 0)" }}
      />
      {/* 墨のパネル本体 */}
      <div
        className="mm-panel absolute inset-0 overflow-y-auto bg-[#1D1812] text-[#F5F1E8]"
        style={{ clipPath: "inset(0 0 100% 0)" }}
      >
        {/* 縦書きタグライン（右端） */}
        <p
          className="mm-tagline pointer-events-none absolute right-5 top-28 select-none font-mincho text-[12px] tracking-[0.5em] text-[#F5F1E8]/35"
          style={{ writingMode: "vertical-rl" }}
          aria-hidden="true"
        >
          富士山と、茶畑と、着物と。
        </p>

        <div className="flex min-h-full flex-col px-7 pb-10 pt-28">
          <p className="font-serif text-[11px] uppercase tracking-[0.34em] text-[#C9A97C]">
            Menu
          </p>

          {/* ナビ */}
          <nav className="mt-6" aria-label={isJa ? "メインメニュー" : "Main menu"}>
            <ul className="flex flex-col">
              {navItems.map((item, i) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href} className="border-b border-[#F5F1E8]/10">
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className="group flex items-baseline gap-4 py-4"
                    >
                      <span className="mm-index w-7 shrink-0 font-serif text-[11px] tracking-[0.2em] text-[#C9A97C]">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {/* マスク：この中で文字が下から立ち上がる */}
                      <span className="block overflow-hidden">
                        <span
                          className={`mm-item-inner block font-mincho text-[1.7rem] leading-[1.25] tracking-[0.06em] transition-colors duration-300 ${
                            active ? "text-[#C9A97C]" : "text-[#F5F1E8] group-hover:text-[#C9A97C]"
                          }`}
                        >
                          {item.label}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <span className="mm-rule mt-8 block h-px w-full bg-[#C9A97C]/50" aria-hidden="true" />

          {/* フッター：予約・言語・連絡先 */}
          <div className="mm-footer mt-8 flex flex-col gap-6">
            <a
              href={RESERVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onClose}
              className="inline-block bg-[#F5F1E8] px-8 py-4 text-center font-['Noto_Sans_JP'] text-[13px] font-medium tracking-[0.22em] text-[#1D1812] transition-colors duration-300 hover:bg-[#C9A97C]"
            >
              {reserveLabel}
            </a>

            <div className="flex items-center justify-between">
              <LanguageSwitcher isScrolled={false} />
              <a
                href={SAME_AS_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-[#F5F1E8]/20 p-2.5 text-[#F5F1E8]/80 transition-colors hover:border-[#C9A97C] hover:text-[#C9A97C]"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>

            <div className="font-['Noto_Sans_JP'] text-xs leading-6 text-[#F5F1E8]/60">
              <a
                href={`tel:${TELEPHONE_E164}`}
                className="inline-flex items-center gap-2 transition-colors hover:text-[#F5F1E8]"
              >
                <Phone className="h-3.5 w-3.5" />
                {TELEPHONE_DISPLAY}
              </a>
              <p className="mt-1">
                {isJa ? HOURS_JA : HOURS_EN}
                <span className="mx-2 text-[#C9A97C]" aria-hidden="true">
                  /
                </span>
                {isJa ? CLOSED_JA : CLOSED_EN}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
