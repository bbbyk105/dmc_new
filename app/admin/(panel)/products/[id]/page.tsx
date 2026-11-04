import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { getProduct } from "@/lib/db/shop";
import { isUuid } from "@/lib/reserve/validate";
import { shopImageUrl } from "@/lib/supabase-admin";
import { removeProductImageAction, updateProductAction } from "../../../actions";
import { Flash, PageTitle, Section, type FlashParams } from "../../../ui";
import ImageUploader from "../ImageUploader";
import ProductForm from "../ProductForm";

export default async function AdminProductPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: FlashParams }) {
  await requireAdmin();
  const { id } = await params;
  const flash = await searchParams;
  if (!isUuid(id)) notFound();
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <>
      <PageTitle
        action={
          product.active ? (
            <Link href={`/ja/shop/${product.slug}`} target="_blank" className="text-xs underline underline-offset-4">
              ショップで見る
            </Link>
          ) : undefined
        }
      >
        {product.name_ja}
      </PageTitle>
      <Flash done={flash.done} error={flash.error} />

      <Section title="写真">
        {product.images.length > 0 && (
          <ul className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {product.images.map((path, i) => (
              <li key={path} className="space-y-2">
                {/* 管理画面だけの小さな確認用なので、画像変換は通さない */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shopImageUrl(path)} alt={`写真 ${i + 1}`} className="aspect-square w-full bg-border object-cover" />
                <form action={removeProductImageAction} className="flex items-center justify-between text-xs">
                  <input type="hidden" name="id" value={product.id} />
                  <input type="hidden" name="path" value={path} />
                  <span className="text-text-muted">{i === 0 ? "一覧の写真" : `${i + 1}枚目`}</span>
                  <button type="submit" className="underline underline-offset-4 hover:text-text-muted">
                    削除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <ImageUploader productId={product.id} />
      </Section>

      <Section title="商品の内容">
        <ProductForm action={updateProductAction} product={product} submitLabel="商品を保存" />
      </Section>
    </>
  );
}
