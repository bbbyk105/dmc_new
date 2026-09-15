"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowLeft } from "lucide-react";

/* ========= Type Definitions ========= */
type LocationItem = {
  name: string;
  description: string;
  image: string;
  isStudio?: boolean;
};

type SupportItem = {
  title: string;
  description: string;
};

type Plan = {
  name: string;
  price: string;
  tax: string;
  features: string[];
};

type InternationalPricing = {
  title: string;
  plans: Plan[];
};

type Pricing = {
  title: string;
  international: InternationalPricing;
};

type Intro = { title: string; description: string };
type Locations = { title: string; items: LocationItem[] };
type Support = { title: string; description: string; items: SupportItem[] };
type Notes = { title: string; items: string[] };

type LocaleBundle = {
  title: string;
  subtitle: string;
  intro: Intro;
  locations: Locations;
  support: Support;
  pricing: Pricing;
  notes: Notes;
};
/* ========= End Types ========= */

export default function CamuDetail() {
  const locale = useLocale();
  const currentLocale: "ja" | "en" = locale === "en" ? "en" : "ja";
  const isJa = currentLocale === "ja";

  // ja / en で本文を分ける（以前は両言語とも英語を出していたため、/ja と /en が重複扱いになっていた）
  const content: Record<"ja" | "en", LocaleBundle> = {
    ja: {
      title: "花夢（CAMU）",
      subtitle: "富士山と茶畑を背景にした、打掛の着物撮影",
      intro: {
        title: "富士山と茶畑を背景に、伝統の装いを",
        description:
          "富士山と茶畑を望むロケーションと、ライティングの整ったスタジオで撮影する、プロによる打掛の撮影体験です。写真データはオンラインでお届けします。事前予約制です。",
      },
      locations: {
        title: "撮影ロケーション",
        items: [
          {
            name: "富士山ビューポイント",
            description:
              "富士山を背にした一枚を。季節ごとの風景が打掛の色を引き立て、時が経っても色あせない写真になります。",
            image: "/images/fuji.webp",
          },
          {
            name: "茶畑",
            description:
              "富士市らしい茶畑の中で撮影します。鮮やかな緑が、打掛の色と生地の質感を美しく際立たせます。",
            image: "/images/cha.webp",
          },
          {
            name: "スタジオ撮影",
            description:
              "天候に左右されないスタジオ撮影。プロ仕様のライティングで、刺繍や色、生地の質感まで細やかに写し取ります。",
            image: "/images/studio.webp",
            isStudio: true,
          },
        ],
      },
      support: {
        title: "プロによるトータルサポート",
        description:
          "着付けから撮影まで、経験豊富なスタッフが一つひとつの工程をサポートします。",
        items: [
          {
            title: "プロカメラマン",
            description:
              "リラックスした雰囲気の中で、自然な表情と映える構図を引き出します。",
          },
          {
            title: "着付け師",
            description:
              "長時間の撮影でも着崩れしにくい、美しい着付けを行います。",
          },
          {
            title: "ヘアメイク",
            description:
              "古典から現代風まで、ご希望と打掛に合わせてコーディネートします。",
          },
          {
            title: "撮影アシスタント",
            description:
              "小物の準備や進行管理など、当日の撮影を円滑にサポートします。",
          },
        ],
      },
      pricing: {
        title: "料金プラン",
        international: {
          title: "海外からのお客様向けプラン",
          plans: [
            {
              name: "プレミアムプラン",
              price: "¥100,000",
              tax: "（お一人様・税込）",
              features: [
                "ロケーションまたはスタジオでの撮影",
                "スタジオ利用（60分）",
                "打掛レンタル",
                "着付け",
                "プロカメラマンによる撮影",
                "写真データ10枚（オンライン納品）",
              ],
            },
            {
              name: "ライトプラン",
              price: "¥20,000",
              tax: "（お一人様・税込）",
              features: [
                "打掛レンタル",
                "ご自身のカメラ・スマートフォンでの撮影OK",
              ],
            },
            {
              name: "打掛着物体験（1時間）",
              price: "¥10,000",
              tax: "（1着目・税込）",
              features: [
                "打掛レンタル（1時間）",
                "2着目以降：1着 ¥5,000（グループ予約）",
              ],
            },
          ],
        },
      },
      notes: {
        title: "ご予約・ご注意事項",
        items: [
          "事前のご予約が必要です。",
          "ロケーション撮影は天候により変更になる場合があります。",
          "写真データはオンラインでお届けします。",
          "キャンセルは撮影日の2日前までにご連絡ください。",
          "日本のお客様向けの「花夢プラン ¥5,000（打掛・ドレスレンタル、スタジオ1時間）」はサービス一覧をご覧ください。",
        ],
      },
    },
    en: {
      title: "CAMU",
      subtitle: "Ceremonial Kimono Photo Shoot — Mt. Fuji & Tea Fields",
      intro: {
        title: "Traditional Beauty with Mt. Fuji and Tea Fields",
        description:
          "A professional ceremonial kimono photo experience that combines outdoor views of Mt. Fuji and tea fields with an elegant studio session. Photo data are delivered online. Advance reservation required.",
      },
      locations: {
        title: "Photography Locations",
        items: [
          {
            name: "Mt. Fuji Viewpoint",
            description:
              "Capture unforgettable photos with Mt. Fuji as your backdrop. Seasonal scenery enhances the contrast with your ceremonial kimono, creating a timeless image.",
            image: "/images/fuji.webp",
          },
          {
            name: "Tea Field",
            description:
              "Shoot among iconic tea fields in Fuji City. The vivid green landscape beautifully complements the colors and textures of your ceremonial kimono.",
            image: "/images/cha.webp",
          },
          {
            name: "Studio Session",
            description:
              "Weather-proof photography in our studio with professional lighting to highlight embroidery, color, and texture with refined detail.",
            image: "/images/studio.webp",
            isStudio: true,
          },
        ],
      },
      support: {
        title: "Comprehensive Support by Professionals",
        description:
          "From dressing to photography, our experienced staff support you at every step for a smooth experience.",
        items: [
          {
            title: "Professional Photographer",
            description:
              "We capture flattering compositions and natural expressions in a relaxed atmosphere.",
          },
          {
            title: "Ceremonial Kimono Dresser",
            description:
              "Secure, beautiful dressing that resists dishevelment during longer sessions.",
          },
          {
            title: "Hair & Makeup Stylist",
            description:
              "Traditional to modern looks coordinated to your preferences and ceremonial kimono.",
          },
          {
            title: "Photography Assistant",
            description:
              "On-site support for props, schedule, and smooth progress throughout.",
          },
        ],
      },
      pricing: {
        title: "Pricing Plans",
        international: {
          title: "Plans for International Guests",
          plans: [
            {
              name: "Premium Plan",
              price: "¥100,000",
              tax: "(per person, tax included)",
              features: [
                "Location or Studio session",
                "Studio rental (60 min)",
                "Ceremonial Kimono rental",
                "Dressing",
                "Professional photo shoot",
                "10 photo data files (online delivery)",
              ],
            },
            {
              name: "Light Plan",
              price: "¥20,000",
              tax: "(per person, tax included)",
              features: [
                "Ceremonial Kimono rental",
                "Self-shoot allowed (use your own device)",
              ],
            },
            {
              name: "Ceremonial Kimono Experience (1 hour)",
              price: "¥10,000",
              tax: "(first kimono, tax included)",
              features: [
                "Ceremonial Kimono rental (1 hour)",
                "Additional kimonos: ¥5,000 each (group bookings)",
              ],
            },
          ],
        },
      },
      notes: {
        title: "Reservations & Notes",
        items: [
          "Reservations are required in advance.",
          "Location shoots may change depending on weather conditions.",
          "Photo data are delivered online.",
          "Please contact us at least 2 days in advance for cancellations.",
        ],
      },
    },
  };

  const t: LocaleBundle = content[currentLocale];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="border-b border-border bg-surface pt-12">
        <div className="container mx-auto px-6 py-4 lg:px-12">
          <Link
            href={`/${currentLocale}/service`}
            className="inline-flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-text"
          >
            <ArrowLeft className="h-4 w-4" />
            {isJa ? "サービス一覧へ戻る" : "Back to Services"}
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-text h-[42vh] max-[360px]:h-[36vh] md:h-[55vh]">
        <Image
          src="/images/camu.webp"
          alt={isJa ? "花夢（CAMU）富士山と茶畑を背景にした打掛の着物撮影" : "CAMU Ceremonial Kimono Photography"}
          fill
          className="object-cover object-[50%_35%]"
          priority
          sizes="(max-width: 390px) 100vw, (max-width: 768px) 100vw, 100vw"
        />
        {/* 写真の色は変えず、文字を読ませるぶんだけ墨をかける */}
        <div className="absolute inset-0 bg-text/30" aria-hidden="true" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="px-6 text-center"
            style={{
              textShadow:
                "0 2px 28px color-mix(in srgb, var(--color-text) 60%, transparent)",
            }}
          >
            <h1 className="mb-4 font-serif text-5xl font-bold text-background md:text-6xl lg:text-7xl">
              {t.title}
            </h1>
            <p className="text-lg text-background/90 md:text-xl">{t.subtitle}</p>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="border-b border-border bg-surface py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-serif text-3xl font-bold text-text md:text-4xl">
              {t.intro.title}
            </h2>
            <p className="leading-relaxed text-text-muted">
              {t.intro.description}
            </p>
          </div>
        </div>
      </section>

      {/* Locations */}
      <section className="border-b border-border py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="mb-16 text-center font-serif text-3xl font-bold text-text md:text-4xl">
            {t.locations.title}
          </h2>

          <div className="space-y-20">
            {t.locations.items.map((location: LocationItem, index: number) => (
              <div
                key={`${location.name}-${index}`}
                className={`grid gap-8 xl:grid-cols-2 xl:gap-12 ${
                  index % 2 === 1 ? "xl:grid-flow-dense" : ""
                }`}
              >
                <div
                  className={`relative overflow-hidden ${
                    location.isStudio
                      ? "mx-auto aspect-9/16 w-full max-w-md"
                      : "h-[300px] max-[360px]:h-60 md:h-[380px] lg:h-[420px]"
                  } ${index % 2 === 1 ? "xl:col-start-2" : ""}`}
                >
                  <Image
                    src={location.image}
                    alt={location.name}
                    fill
                    className="object-cover object-[50%_40%]"
                    sizes="(max-width: 1280px) 100vw, 50vw"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <h3 className="mb-4 font-serif text-2xl font-bold text-text">
                    {location.name}
                  </h3>
                  <p className="leading-relaxed text-text-muted">
                    {location.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="border-b border-border bg-surface py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mb-16 text-center">
            <h2 className="mb-6 font-serif text-3xl font-bold text-text md:text-4xl">
              {t.support.title}
            </h2>
            <p className="mx-auto max-w-3xl leading-relaxed text-text-muted">
              {t.support.description}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {t.support.items.map((item: SupportItem, index: number) => (
              <div
                key={`${item.title}-${index}`}
                className="border-l border-text bg-surface p-6"
              >
                <h3 className="mb-3 text-xl font-bold text-text">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-text-muted">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-b border-border py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <h2 className="mb-16 text-center font-serif text-3xl font-bold text-text md:text-4xl">
            {t.pricing.title}
          </h2>

          <div>
            <h3 className="mb-8 text-center text-2xl font-bold text-text">
              {t.pricing.international.title}
            </h3>
            <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
              {t.pricing.international.plans.map(
                (plan: Plan, index: number) => (
                  <div
                    key={`${plan.name}-${index}`}
                    className="border border-border bg-surface p-8"
                  >
                    <div className="mb-6 border-b border-border pb-6">
                      <h4 className="mb-2 text-xl font-bold text-text">
                        {plan.name}
                      </h4>
                      <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                        <span className="text-4xl font-bold text-text leading-tight sm:whitespace-nowrap">
                          {plan.price}
                        </span>
                        <span className="text-sm text-text-muted">
                          {plan.tax}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature: string, i: number) => (
                        <li
                          key={`${plan.name}-feat-${i}`}
                          className="flex items-start gap-3 text-sm text-text-muted"
                        >
                          <span className="mt-1 text-text-muted">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Notes */}
      <section className="bg-surface py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-8 text-center font-serif text-3xl font-bold text-text md:text-4xl">
              {t.notes.title}
            </h2>
            <div className="space-y-4 bg-surface p-8">
              {t.notes.items.map((note: string, index: number) => (
                <p
                  key={`note-${index}`}
                  className="border-l-2 border-border pl-4 text-sm leading-relaxed text-text-muted"
                >
                  {note}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-16">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <Link href="https://dmcfuji0823.wixsite.com/reservation/en">
            <button className="btn-primary px-12">
              {isJa ? "予約する" : "Book Now"}
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
