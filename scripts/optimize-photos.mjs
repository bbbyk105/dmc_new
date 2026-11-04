// 商品写真を、ショップに上げる大きさにする。
//   node scripts/optimize-photos.mjs <元の写真のフォルダ> [書き出し先（既定: <元>/web）]
//
// - 長い辺を 2400px に縮める（商品ページで大きく出しても、高精細の画面で粗く見えない大きさ。拡大はしない）
// - WebP（画質 82）にする。ページに出すときは Next の画像変換が、画面に合わせてさらに縮める
// - 撮影情報（カメラ・日時・位置情報）は残さない。色は sRGB にそろえる
// - トリミング・色の補正・背景の加工はしない。元の写真は書き換えない
import { mkdirSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const LONG_EDGE = 2400;
const QUALITY = 82;
const INPUT = /\.(jpe?g|png|tiff?|heic|webp)$/i;

const [, , inputDir, outputArg] = process.argv;
if (!inputDir) {
  console.error("使い方: node scripts/optimize-photos.mjs <元の写真のフォルダ> [書き出し先]");
  process.exit(1);
}
const outputDir = outputArg ?? join(inputDir, "web");
mkdirSync(outputDir, { recursive: true });

const files = readdirSync(inputDir).filter((f) => INPUT.test(f)).sort();
let before = 0;
let after = 0;
for (const file of files) {
  const src = join(inputDir, file);
  const dest = join(outputDir, `${basename(file, extname(file))}.webp`);
  const info = await sharp(src)
    .rotate() // EXIF の向きがあれば、その向きに直してから消す
    .resize(LONG_EDGE, LONG_EDGE, { fit: "inside", withoutEnlargement: true })
    .toColourspace("srgb")
    .webp({ quality: QUALITY, effort: 6 })
    .toFile(dest);
  const srcSize = statSync(src).size;
  before += srcSize;
  after += info.size;
  console.log(`${file} → ${basename(dest)}  ${info.width}x${info.height}  ${(srcSize / 1048576).toFixed(1)}MB → ${(info.size / 1024).toFixed(0)}KB`);
}
console.log(`${files.length} 枚  ${(before / 1048576).toFixed(1)}MB → ${(after / 1048576).toFixed(1)}MB（${outputDir}）`);
