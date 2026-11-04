import { requireAdmin } from "@/lib/admin/auth";
import { createProductAction } from "../../../actions";
import { Flash, PageTitle, Section, type FlashParams } from "../../../ui";
import ProductForm from "../ProductForm";

export default async function AdminNewProductPage({ searchParams }: { searchParams: FlashParams }) {
  await requireAdmin();
  const flash = await searchParams;
  return (
    <>
      <PageTitle>商品を登録</PageTitle>
      <Flash done={flash.done} error={flash.error} />
      <Section title="商品の内容">
        <p className="mb-6 text-xs text-text-muted">登録したあとに写真を追加できます。準備ができるまでは「ショップに公開する」のチェックを解除しておいてください。</p>
        <ProductForm action={createProductAction} submitLabel="商品を登録" />
      </Section>
    </>
  );
}
