import { Metadata } from "next";
import ChloeDetail from "@/app/components/(service)/ChloeDetail";

export const metadata: Metadata = {
  title: "Chloe (クロエ) - レンタルスタジオ | DMC",
  description: "七五三、成人式、ドレス、着物撮影に対応したレンタルスタジオ。",
};

export default function ChloePage() {
  return <ChloeDetail />;
}
