import Image from "next/image";

/**
 * 商品の写真（Supabase Storage の shop-images）。
 * fit="contain" は写真全体を枠に収める（横長のポーチ・マットの左右が切れないように。一覧と商品ページ）。
 * 手元の Supabase（http://127.0.0.1）の写真は Next の画像変換を通せないので、そのまま出す
 */
export default function ProductImage({
  src,
  alt,
  sizes,
  priority,
  fit = "cover",
}: {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  if (!src) {
    return <div className="absolute inset-0 bg-border/50" aria-hidden="true" />;
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={src.startsWith("http://")}
      className={fit === "contain" ? "object-contain" : "object-cover"}
    />
  );
}
