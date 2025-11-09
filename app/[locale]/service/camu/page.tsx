import { Metadata } from "next";
import CamuDetail from "@/app/components/(service)/CamuDetail";

export const metadata: Metadata = {
  title: "花夢 (CAMU) - 着物撮影 | DMC",
  description: "富士山と茶畑を背景に、伝統的な着物姿で特別な一枚を撮影します。",
};

export default function CamuPage() {
  return <CamuDetail />;
}
