"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { attachProductImageAction, createProductImageUploadAction } from "../../actions";

/**
 * 商品の写真を上げる。サーバーで発行した URL へ、ブラウザから Storage に直接上げてから商品に付ける
 * （Vercel の関数はリクエストが 4.5MB までで、スマホの写真が通らないため）
 */
export default function ImageUploader({ productId }: { productId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setMessage(null);
    try {
      for (const file of Array.from(files)) {
        const target = await createProductImageUploadAction(productId, file.type, file.size);
        if (!target.ok) throw new Error(target.message);
        const res = await fetch(target.signedUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type },
          body: file,
        });
        if (!res.ok) throw new Error("写真を上げられませんでした。もう一度お試しください");
        const attached = await attachProductImageAction(productId, target.path);
        if (!attached.ok) throw new Error(attached.message);
      }
      setMessage("写真を追加しました");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "写真を上げられませんでした");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-2">
      <label className="btn-secondary inline-flex min-h-0 cursor-pointer px-5 py-2.5 text-xs">
        {busy ? "上げています…" : "写真を追加"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={busy}
          className="sr-only"
          onChange={(e) => {
            void upload(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
      <p className="text-xs text-text-muted">JPEG・PNG・WebP・AVIF、1枚 10MB まで。1枚目が一覧の写真になります。</p>
      {message && (
        <p role="status" className="text-sm text-text">
          {message}
        </p>
      )}
    </div>
  );
}
