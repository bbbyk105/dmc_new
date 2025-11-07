"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

const routeLabels: Record<string, string> = {
  "/": "ホーム",
  "/gallery": "ギャラリー",
  "/services": "サービス案内",
  "/reserve": "ご予約",
};

export default function Breadcrumbs() {
  const pathname = usePathname();

  // トップページではパンくずを表示しない
  if (pathname === "/") return null;

  const pathSegments = pathname.split("/").filter((segment) => segment);

  const breadcrumbs: BreadcrumbItem[] = [{ label: "ホーム", href: "/" }];

  let currentPath = "";
  pathSegments.forEach((segment) => {
    currentPath += `/${segment}`;
    const label = routeLabels[currentPath] || segment;
    breadcrumbs.push({ label, href: currentPath });
  });

  return (
    <nav
      aria-label="パンくずリスト"
      className="bg-white/80 backdrop-blur-sm py-4 px-6 border-b border-[#D4C4B0]"
    >
      <ol
        className="container mx-auto flex items-center gap-2 text-sm"
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li
              key={breadcrumb.href}
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
              className="flex items-center"
            >
              {index > 0 && (
                <ChevronRight className="mx-2 h-4 w-4 text-[#8B7355]" />
              )}

              {isLast ? (
                <span
                  itemProp="name"
                  className="text-[#5A4A3A] font-medium"
                  aria-current="page"
                >
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  href={breadcrumb.href}
                  itemProp="item"
                  className="text-[#8B7355] hover:text-[#5A4A3A] transition-colors flex items-center gap-1"
                >
                  {index === 0 && <Home className="h-4 w-4" />}
                  <span itemProp="name">{breadcrumb.label}</span>
                </Link>
              )}

              <meta itemProp="position" content={String(index + 1)} />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
