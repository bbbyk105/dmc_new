import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { countOpenOrders } from "@/lib/db/admin";
import { signOut } from "../actions";

export const dynamic = "force-dynamic";

const NAV = [
  { href: "/admin", label: "予約" },
  { href: "/admin/schedule", label: "受付の設定" },
  { href: "/admin/orders", label: "注文" },
  { href: "/admin/products", label: "商品" },
  { href: "/admin/settings", label: "ショップの設定" },
];

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const openOrders = await countOpenOrders().catch(() => 0);

  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-4">
          <Link href="/admin" className="font-serif text-lg text-text">
            DMC FUJI 管理画面
          </Link>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {NAV.map((item) => (
              <Link key={item.href} href={item.href} className="text-text-muted transition-colors hover:text-text">
                {item.label}
                {item.href === "/admin/orders" && openOrders > 0 && (
                  <span className="ml-1 bg-text px-1.5 py-0.5 text-[10px] text-background">{openOrders}</span>
                )}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-xs text-text-muted">
            <span>{user.email}</span>
            <form action={signOut}>
              <button type="submit" className="underline underline-offset-4 hover:text-text">
                ログアウト
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
