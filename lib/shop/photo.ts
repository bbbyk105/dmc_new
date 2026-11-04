/**
 * ショップに出す商品写真を作る。白っぽい背景で撮った写真の背景を、ページの地（生成り）になじませる。
 * 管理画面から上げた写真（lib/admin/operations.ts）と、まとめて登録するスクリプト（scripts/import-products.mjs）の両方で使う。
 *
 * Next に依存しない（photo.test.mjs が node --test で直接読む）。
 */
import sharp from "sharp";

/** ページの地（app/globals.css の --color-background: #f4f1ea） */
export const PAGE_BACKGROUND: readonly [number, number, number] = [244, 241, 234];
/** 出力の正方形の一辺（px）。商品ページで大きく出しても粗く見えない大きさ */
export const SHOP_PHOTO_SIZE = 2000;
/** これより暗い背景の写真は、色を変えずに置くだけにする（明るくすると写真が崩れるため） */
const LIGHT_BACKDROP = 200;

/**
 * 写真の縁（外側 2%）の色。チャンネルごとに明るい側から 3 割の値を取り、
 * 背景の明るさのむら（真ん中が明るい・下が影で暗い）があっても、明るい背景の色を拾う
 */
async function backdropColor(input: Buffer): Promise<[number, number, number]> {
  const { data, info } = await sharp(input).resize(240, 240, { fit: "inside" }).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const band = Math.max(2, Math.round(Math.min(info.width, info.height) * 0.02));
  const samples: number[][] = [[], [], []];
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (x >= band && x < info.width - band && y >= band && y < info.height - band) continue;
      const i = (y * info.width + x) * info.channels;
      for (let c = 0; c < 3; c++) samples[c].push(data[i + c]);
    }
  }
  return samples.map((s) => s.sort((a, b) => a - b)[Math.floor(s.length * 0.7)]) as [number, number, number];
}

/**
 * 商品写真を、ショップに出す形にする。
 * - 背景（縁の色）を白にそろえてから（それより明るい所は白で止める）、ページの生成りを掛ける。
 *   白っぽい背景は生成りになり、商品の色は白の色味を合わせる分（数 %）しか変わらない
 * - 縁を少しぼかして、生成りの正方形の真ん中に置く。トリミングはしない
 * - WebP（画質 82）。撮影情報（カメラ・日時・位置情報）は残さない
 */
export async function toShopPhoto(input: Buffer, size = SHOP_PHOTO_SIZE): Promise<Buffer> {
  const oriented = await sharp(input).rotate().flatten({ background: "#ffffff" }).toColourspace("srgb").toBuffer();
  const meta = await sharp(oriented).metadata();
  const scale = size / Math.max(meta.width ?? size, meta.height ?? size);
  const width = Math.max(1, Math.round((meta.width ?? size) * scale));
  const height = Math.max(1, Math.round((meta.height ?? size) * scale));

  const backdrop = await backdropColor(oriented);
  const light = Math.min(...backdrop) >= LIGHT_BACKDROP;

  let photo = await sharp(oriented).resize(width, height).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (light) {
    // 二段に分けて、白より明るい所を一度 255 で止めてから生成りを掛ける（真ん中の明るい背景も生成りにそろう）
    const white = await sharp(photo.data, { raw: photo.info })
      .linear(backdrop.map((v) => 255 / v), [0, 0, 0])
      .raw()
      .toBuffer({ resolveWithObject: true });
    photo = await sharp(white.data, { raw: white.info })
      .linear(PAGE_BACKGROUND.map((v) => v / 255), [0, 0, 0])
      .raw()
      .toBuffer({ resolveWithObject: true });
  }

  // 縁を少しぼかすマスク（写真の縁と生成りの境目を見せない）
  const feather = Math.max(4, Math.round(size * 0.025));
  const mask = Buffer.from(
    `<svg width="${width}" height="${height}"><defs><filter id="b"><feGaussianBlur stdDeviation="${feather / 2}"/></filter></defs>` +
      `<rect x="${feather}" y="${feather}" width="${Math.max(1, width - feather * 2)}" height="${Math.max(1, height - feather * 2)}" fill="#fff" filter="url(#b)"/></svg>`,
  );
  const alpha = await sharp(mask).resize(width, height).extractChannel(0).toBuffer();
  const withAlpha = await sharp(photo.data, { raw: photo.info }).joinChannel(alpha).png().toBuffer();

  const [r, g, b] = PAGE_BACKGROUND;
  return sharp({ create: { width: size, height: size, channels: 3, background: { r, g, b } } })
    .composite([{ input: withAlpha, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }])
    .webp({ quality: 82, effort: 5 })
    .toBuffer();
}
