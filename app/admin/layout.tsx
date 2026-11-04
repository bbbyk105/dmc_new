import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "../globals.css";

const notoSansJP = Noto_Sans_JP({ subsets: ["latin"], variable: "--font-noto-sans-jp", display: "swap" });

export const metadata: Metadata = {
  title: "管理画面 | DMC FUJI",
  robots: { index: false, follow: false },
};

/** 管理画面（/admin）。お客さま向けのページ（app/[locale]）とは別のレイアウト */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className={notoSansJP.variable}>
      <body className="min-h-screen bg-background antialiased">{children}</body>
    </html>
  );
}
