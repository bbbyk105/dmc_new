import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  /** 表示名 */
  name: string;
  /** ロケール付きの相対パス（例: /ja/service）。最後の項目は省略可（現在地） */
  href?: string;
}

/**
 * 可視パンくずリスト。
 * BreadcrumbList JSON-LD（buildBreadcrumbSchema）と内容を一致させて使う。
 */
export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav
      aria-label="breadcrumb"
      className="mx-auto max-w-[1200px] px-5 pt-24 md:px-6"
    >
      <ol className="flex flex-wrap items-center gap-1.5 font-['Noto_Sans_JP'] text-xs text-[#8B7355] md:text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.name} className="flex items-center gap-1.5">
              {index > 0 && (
                <ChevronRight
                  className="h-3.5 w-3.5 text-[#C9A97C]"
                  aria-hidden="true"
                />
              )}
              {isLast || !item.href ? (
                <span className="text-[#5A4A3A]" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-[#5A4A3A]"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
