import { Metadata } from "next";
import ContactForm from "@/app/components/(contact)/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ | DMC FUJI 着物撮影・レンタルスタジオ",
  description:
    "静岡県富士市のDMC FUJIへのお問い合わせページ。着物撮影「花夢(CAMU)」、レンタルスタジオ「Chloe」、アンティークカフェ併設スタジオへのご予約・ご相談はこちらから。",
  keywords: [
    "DMC FUJI",
    "kimono fuji",
    "富士市 着物撮影",
    "レンタルスタジオ 富士",
    "花夢 CAMU",
    "成人式 前撮り",
    "七五三 写真 富士市",
    "ブライダルフォト 富士",
  ],
  openGraph: {
    title: "お問い合わせ | DMC FUJI 着物撮影・レンタルスタジオ",
    description:
      "静岡県富士市の着物撮影・レンタルスタジオDMC FUJIへのお問い合わせ・予約フォーム。",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactForm />;
}
