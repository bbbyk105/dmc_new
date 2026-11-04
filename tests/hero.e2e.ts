import { describe, test } from "@e2e-dev/web";
import { expect } from "e2e";

/**
 * トップの Hero（流れる写真ウォール）。
 *
 * 枠は縦長（3:4）で、写真の多くは横長（3:2）。object-cover なので、横長の写真は枠の高さに合わせて
 * 枠の幅の約 2 倍まで拡大される。`sizes` が枠の幅のままだと、必要な解像度の半分しか届かず、
 * スマホで写真が潰れて見える。
 *
 * 飾りの写真で役割も名前も持たないので、ここだけ CSS のセレクタで取る。
 */

/** 最初に読む写真ごとに、届いた幅が、描画に必要な幅の何倍かを返す */
function servedRatios() {
  const images = [...document.querySelectorAll<HTMLImageElement>('.hero-drift img:not([loading="lazy"])')].filter(
    (image) => image.offsetWidth > 0,
  );
  return Promise.all(images.map((image) => image.decode())).then(() =>
    images.map((image) => {
      const aspect = image.naturalWidth / image.naturalHeight;
      const drawnWidth = Math.max(image.offsetWidth, image.offsetHeight * aspect);
      const served = Number(new URL(image.currentSrc).searchParams.get("w"));
      return served / (drawnWidth * window.devicePixelRatio);
    }),
  );
}

/** 写真の説明文の見た目と、写真の枠に対する位置 */
function captionOf(text: string) {
  const tile = [...document.querySelectorAll<HTMLElement>(".hero-drift > *")].find((el) => el.textContent === text);
  const caption = [...(tile?.querySelectorAll<HTMLElement>("span, p, figcaption") ?? [])].find(
    (el) => el.textContent === text,
  );
  if (!tile || !caption) throw new Error(`説明文「${text}」が見つかりません`);
  const style = getComputedStyle(caption);
  return {
    background: style.backgroundColor,
    opacity: Number(style.opacity),
    belowPhoto: caption.offsetTop >= tile.offsetHeight,
  };
}

/** Hero の文字のうち、写真の列に重なっているものを返す（文字の範囲を格子状に調べる） */
function textsOverPhotos() {
  const hero = document.querySelector("main section");
  if (!hero) throw new Error("Hero が見つかりません");
  const overlapping = new Set<string>();
  const walker = document.createTreeWalker(hero, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    // 写真の説明文と、読み上げ専用の文字は見えない場所にあるので除く
    if (node.parentElement?.closest(".hero-drift, .sr-only")) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      for (let x = 0; x <= 10; x++) {
        for (let y = 0; y <= 4; y++) {
          const hits = document.elementsFromPoint(rect.left + (rect.width * x) / 10, rect.top + (rect.height * y) / 4);
          if (hits.some((element) => element.querySelector(":scope > .hero-drift"))) {
            overlapping.add(node.textContent ?? "");
          }
        }
      }
    }
  }
  return [...overlapping];
}

describe("Hero の写真ウォール", () => {
  for (const { width, height } of [
    { width: 360, height: 640 },
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1024, height: 768 },
    { width: 1280, height: 720 },
    { width: 1440, height: 900 },
    { width: 1710, height: 1107 },
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
  ]) {
    test(`${width}x${height}: 文字が写真に重ならない`, async ({ app, browser }) => {
      await browser.setViewport({ width, height });
      for (const path of ["/ja", "/en"]) {
        await app.open(path);
        await expect.poll(() => browser.evaluate(textsOverPhotos)).toEqual([]);
      }
    });
  }

  for (const { label, width, height } of [
    { label: "スマホ", width: 390, height: 844 },
    { label: "PC", width: 1440, height: 900 },
  ]) {
    test(`${label}: 写真が、描画に足りる解像度で届く`, async ({ app, browser }) => {
      await browser.setViewport({ width, height });
      await app.open("/ja");

      const ratios = await browser.evaluate(servedRatios);
      expect(ratios.length).toBeGreaterThanOrEqual(4);
      expect(Math.min(...ratios)).toBeGreaterThanOrEqual(0.8);
    });
  }

  test("写真に触れると、説明文が箱なしで写真の下の余白に出る", async ({ app, browser }) => {
    await browser.setViewport({ width: 1440, height: 900 });
    await app.open("/ja");
    // 流れ続ける要素には触れないので、写真の流れを止める
    await browser.evaluate(() => {
      const style = document.createElement("style");
      style.textContent = ".hero-drift { animation: none !important; }";
      document.head.append(style);
      return null;
    });

    const text = "スタジオ撮影";
    await browser.locator(".hero-drift > *").filter({ hasText: text }).first().hover();

    await expect.poll(() => browser.evaluate(captionOf, text)).toEqual({
      background: "rgba(0, 0, 0, 0)",
      opacity: 1,
      belowPhoto: true,
    });
  });

  test("Hero の地はページの地と同じで、ヘッダーは最上部から地を持つ", async ({ app, browser }) => {
    await app.open("/ja");

    const colors = await browser.evaluate(() => ({
      page: getComputedStyle(document.body).backgroundColor,
      hero: getComputedStyle(document.querySelector("main section") as Element).backgroundColor,
      header: getComputedStyle(document.querySelector("header") as Element).backgroundColor,
    }));
    expect(colors.hero).toBe(colors.page);
    expect(colors.header).not.toBe("rgba(0, 0, 0, 0)");
  });
});
