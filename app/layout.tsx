import type { Metadata } from "next";
import { Noto_Sans_JP, Crimson_Text } from "next/font/google";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  subsets: ["latin"],
  variable: "--font-noto-sans-jp",
  display: "swap",
});

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-crimson-text",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://dmc-camu.com"),
  title: {
    default: "花夢(CAMU) | 富士山×着物フォトスタジオ | DMC ドレスマンコード",
    template: "%s | 花夢(CAMU) DMC",
  },
  description:
    "静岡県富士市のフォトスタジオ「花夢(CAMU)」by DMC（ドレスマンコード）。富士山と茶畑を背景にした着物撮影、七五三、成人式撮影。1階は終活カフェ、2階はChloeスタジオ。",
  keywords: [
    "フォトスタジオ",
    "着物撮影",
    "富士山",
    "茶畑",
    "七五三",
    "成人式",
    "静岡県",
    "富士市",
    "CAMU",
    "花夢",
    "DMC",
    "ドレスマンコード",
    "レンタルスタジオ",
    "終活カフェ",
    "Chloe",
    "クロエ",
  ],
  authors: [{ name: "DMC (Dress Man Code)" }],
  creator: "DMC LLC",
  publisher: "DMC LLC",
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://dmc-camu.com",
    siteName: "花夢(CAMU) - DMC ドレスマンコード",
    title: "花夢(CAMU) | 富士山×着物フォトスタジオ | DMC",
    description:
      "富士山と茶畑を背景にした着物撮影。人生の特別な瞬間を永遠の思い出に。DMCが運営するフォトスタジオ。",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "花夢(CAMU) フォトスタジオ by DMC",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "花夢(CAMU) | 富士山×着物フォトスタジオ",
    description:
      "富士山と茶畑を背景にした着物撮影。人生の特別な瞬間を永遠の思い出に。",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://dmc-camu.com",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ja"
      className={`${notoSansJP.variable} ${crimsonText.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#F5F3F0" />
      </head>
      <body className="min-h-screen bg-[#F5F3F0] font-['Noto_Sans_JP'] antialiased">
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "花夢(CAMU) - DMC ドレスマンコード",
              image: "https://dmc-camu.com/og-image.jpg",
              "@id": "https://dmc-camu.com",
              url: "https://dmc-camu.com",
              telephone: "0545-55-4550",
              address: {
                "@type": "PostalAddress",
                streetAddress: "新田島町1-13",
                addressLocality: "富士市",
                addressRegion: "静岡県",
                postalCode: "417-0001",
                addressCountry: "JP",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 35.1612,
                longitude: 138.6767,
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: "11:00",
                closes: "17:00",
              },
              priceRange: "¥¥",
              description:
                "富士山と茶畑を背景にした着物撮影スタジオ。七五三、成人式撮影対応。1階は終活カフェ、2階はChloeフォトスタジオ。",
            }),
          }}
        />
      </body>
    </html>
  );
}
