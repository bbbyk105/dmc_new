import type { Metadata } from "next";
import ContactForm from "@/app/components/(contact)/ContactForm";
import { buildPageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa
      ? "お問い合わせ | DMC FUJI 着物撮影・レンタルスタジオ"
      : "Contact | DMC FUJI Ceremonial Kimono Studio",
    description: isJa
      ? "静岡県富士市のDMC FUJIへのお問い合わせページ。着物撮影「花夢(CAMU)」、レンタルスタジオ「Chloe」、アンティークカフェ併設スタジオへのご予約・ご相談はこちらから。"
      : "Contact DMC FUJI in Fuji City, Shizuoka. Inquiries and reservations for CAMU ceremonial kimono photography, Chloe rental studio, and antique cafe.",
    locale,
    canonicalPath: `/${locale}/contact`,
    keywords: isJa
      ? [
          "DMC FUJI",
          "富士市 着物撮影",
          "レンタルスタジオ 富士",
          "花夢 CAMU",
          "成人式 前撮り",
          "七五三 写真 富士市",
          "ブライダルフォト 富士",
        ]
      : [
          "DMC FUJI",
          "ceremonial kimono fuji",
          "Fuji City photo studio",
          "contact",
        ],
    openGraph: {
      title: isJa
        ? "お問い合わせ | DMC FUJI 着物撮影・レンタルスタジオ"
        : "Contact | DMC FUJI Ceremonial Kimono Studio",
      description: isJa
        ? "静岡県富士市の着物撮影・レンタルスタジオDMC FUJIへのお問い合わせ・予約フォーム。"
        : "Contact and reservation form for DMC FUJI ceremonial kimono studio in Fuji City.",
      type: "website",
    },
  });
}

export default function ContactPage() {
  return <ContactForm />;
}
