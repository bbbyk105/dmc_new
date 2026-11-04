import { requireAdmin } from "@/lib/admin/auth";
import { getShopSettings } from "@/lib/db/shop";
import { updateShopSettingsAction } from "../../actions";
import { Flash, PageTitle, Section, inputClass, labelClass, type FlashParams } from "../../ui";

export default async function AdminSettingsPage({ searchParams }: { searchParams: FlashParams }) {
  await requireAdmin();
  const flash = await searchParams;
  const settings = await getShopSettings();

  return (
    <>
      <PageTitle>ショップの設定</PageTitle>
      <Flash done={flash.done} error={flash.error} />
      <Section title="送料と発送">
        <form action={updateShopSettingsAction} className="grid gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="shippingFee" className={labelClass}>
              送料（1回の注文あたり・円）
            </label>
            <input id="shippingFee" name="shippingFee" type="number" min={0} required defaultValue={settings.shipping_fee} className={inputClass} />
          </div>
          <div>
            <label htmlFor="freeShippingThreshold" className={labelClass}>
              この金額以上で送料無料（円・空にすると無料にしない）
            </label>
            <input
              id="freeShippingThreshold"
              name="freeShippingThreshold"
              type="number"
              min={1}
              defaultValue={settings.free_shipping_threshold ?? ""}
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="overseasShippingFee" className={labelClass}>
              オーストラリアへの送料（英語のページからの注文。一律・円。支払いのときに一緒にいただきます。送料無料の金額は当てません）
            </label>
            <input
              id="overseasShippingFee"
              name="overseasShippingFee"
              type="number"
              min={0}
              required
              defaultValue={settings.overseas_shipping_fee}
              className={`${inputClass} md:max-w-xs`}
            />
          </div>
          <div>
            <label htmlFor="deliveryNoteJa" className={labelClass}>
              発送の目安（カート・確認メールに出します）
            </label>
            <input id="deliveryNoteJa" name="deliveryNoteJa" required defaultValue={settings.delivery_note_ja} className={inputClass} />
          </div>
          <div>
            <label htmlFor="deliveryNoteEn" className={labelClass}>
              発送の目安（英語）
            </label>
            <input id="deliveryNoteEn" name="deliveryNoteEn" defaultValue={settings.delivery_note_en} className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <button type="submit" className="btn-primary min-h-0 px-6 py-3 text-xs">
              設定を保存
            </button>
          </div>
        </form>
      </Section>
    </>
  );
}
