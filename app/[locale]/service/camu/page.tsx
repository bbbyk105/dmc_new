import type { Metadata } from "next";
import CamuDetail from "@/app/components/(service)/CamuDetail";
import { buildPageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const isJa = locale === "ja";
  return buildPageMeta({
    title: isJa
      ? "花夢 (CAMU) - 着物撮影 | DMC"
      : "CAMU - Ceremonial Kimono Photography | DMC FUJI",
    description: isJa
      ? "富士山と茶畑を背景に、伝統的な着物姿で特別な一枚を撮影します。"
      : "Capture a special moment in traditional ceremonial kimono with Mt. Fuji and tea fields as your backdrop.",
    locale,
    canonicalPath: `/${locale}/service/camu`,
  });
}

export default function CamuPage() {
  return <CamuDetail />;
}
