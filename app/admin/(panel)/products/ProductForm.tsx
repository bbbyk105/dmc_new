import type { ProductRow } from "@/lib/db/types";
import { inputClass, labelClass } from "../../ui";

/** 商品の登録・編集のフォーム（Server Action を action に渡す） */
export default function ProductForm({
  action,
  product,
  submitLabel,
}: {
  action: (form: FormData) => Promise<void>;
  product?: ProductRow;
  submitLabel: string;
}) {
  return (
    <form action={action} className="grid gap-5 md:grid-cols-2">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div>
        <label htmlFor="nameJa" className={labelClass}>
          商品名
        </label>
        <input id="nameJa" name="nameJa" required defaultValue={product?.name_ja} className={inputClass} />
      </div>
      <div>
        <label htmlFor="nameEn" className={labelClass}>
          商品名（英語・任意）
        </label>
        <input id="nameEn" name="nameEn" defaultValue={product?.name_en} className={inputClass} />
      </div>
      <div className="md:col-span-2">
        <label htmlFor="slug" className={labelClass}>
          URL の名前（半角英小文字・数字・ハイフン。例: kimono-hadagi → /shop/kimono-hadagi）
        </label>
        <input id="slug" name="slug" required pattern="[a-z0-9-]+" defaultValue={product?.slug} className={inputClass} />
      </div>
      <div>
        <label htmlFor="descriptionJa" className={labelClass}>
          説明
        </label>
        <textarea id="descriptionJa" name="descriptionJa" rows={6} defaultValue={product?.description_ja} className={inputClass} />
      </div>
      <div>
        <label htmlFor="descriptionEn" className={labelClass}>
          説明（英語・任意）
        </label>
        <textarea id="descriptionEn" name="descriptionEn" rows={6} defaultValue={product?.description_en} className={inputClass} />
      </div>
      <div>
        <label htmlFor="price" className={labelClass}>
          値段（税込・円）
        </label>
        <input id="price" name="price" type="number" min={50} required defaultValue={product?.price} className={inputClass} />
      </div>
      <div>
        <label htmlFor="stock" className={labelClass}>
          在庫
        </label>
        <input id="stock" name="stock" type="number" min={0} required defaultValue={product?.stock ?? 0} className={inputClass} />
      </div>
      <div>
        <label htmlFor="sort" className={labelClass}>
          並び順（小さいほど先）
        </label>
        <input id="sort" name="sort" type="number" defaultValue={product?.sort ?? 0} className={inputClass} />
      </div>
      <label className="flex items-center gap-2 self-end text-sm">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? false} className="accent-[var(--color-text)]" />
        ショップに公開する
      </label>
      <div className="md:col-span-2">
        <button type="submit" className="btn-primary min-h-0 px-6 py-3 text-xs">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
