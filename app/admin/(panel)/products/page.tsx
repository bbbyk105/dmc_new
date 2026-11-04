import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { getAllProducts } from "@/lib/db/shop";
import { formatYen } from "@/lib/reserve/pricing";
import { Flash, PageTitle, type FlashParams } from "../../ui";

export default async function AdminProductsPage({ searchParams }: { searchParams: FlashParams }) {
  await requireAdmin();
  const flash = await searchParams;
  const products = await getAllProducts();

  return (
    <>
      <PageTitle
        action={
          <Link href="/admin/products/new" className="btn-primary min-h-0 px-5 py-2.5 text-xs">
            商品を登録
          </Link>
        }
      >
        商品
      </PageTitle>
      <Flash done={flash.done} error={flash.error} />
      {products.length === 0 ? (
        <p className="text-sm text-text-muted">商品はまだありません。</p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border text-xs text-text-muted">
            <tr>
              <th className="py-2 pr-4 font-normal">商品名</th>
              <th className="py-2 pr-4 font-normal">値段</th>
              <th className="py-2 pr-4 font-normal">在庫</th>
              <th className="py-2 font-normal">公開</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((p) => (
              <tr key={p.id}>
                <td className="py-3 pr-4">
                  <Link href={`/admin/products/${p.id}`} className="underline decoration-border underline-offset-4 hover:decoration-text">
                    {p.name_ja}
                  </Link>
                </td>
                <td className="py-3 pr-4 tabular-nums">{formatYen(p.price)}</td>
                <td className="py-3 pr-4 tabular-nums">{p.stock}</td>
                <td className="py-3">{p.active ? "公開中" : "非公開"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
