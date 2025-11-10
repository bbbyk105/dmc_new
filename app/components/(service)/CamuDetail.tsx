// path: app/[locale]/service/camu/page.tsx

"use client";

import { motion } from "framer-motion";
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

type DomesticPricing = {
  title: string;
  plans: Plan[];
  membership: {
    title: string;
    price: string;
    description: string;
  };
};

type InternationalPricing = {
  title: string;
  plans: Plan[];
};

type Pricing = {
  title: string;
  domestic: DomesticPricing;
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

  const content: Record<"ja" | "en", LocaleBundle> = {
    ja: {
      title: "花夢 (CAMU)",
      subtitle: "着物撮影サービス",
      intro: {
        title: "富士山と茶畑を背景に、伝統の美を纏う",
        description:
          "静岡県富士市の雄大な富士山と美しい茶畑を背景に、伝統的な着物姿での撮影をご提供いたします。経験豊富なスタッフが、撮影から着付け、ヘアセットまで丁寧にサポートし、お客様の大切な瞬間を最高の形で残すお手伝いをいたします。",
      },
      locations: {
        title: "撮影ロケーション",
        items: [
          {
            name: "富士山ビュースポット",
            description:
              "世界遺産・富士山を正面に望む絶景ポイントでの撮影。四季折々の富士山の表情とともに、忘れられない一枚をお撮りします。晴天時には雪を冠した美しい富士山をバックに、着物姿が一層映える写真をご提供いたします。",
            image: "/images/fuji.webp",
          },
          {
            name: "茶畑ロケーション",
            description:
              "富士市の象徴である茶畑での撮影。一面に広がる緑豊かな茶畑は、着物の色彩を引き立て、日本の原風景を感じさせる情緒ある写真に仕上がります。新茶の季節には特に鮮やかな緑が広がり、絶好の撮影環境となります。",
            image: "/images/cha.webp",
          },
          {
            name: "スタジオ撮影",
            description:
              "天候に左右されることなく、プロ仕様のライティング機材を使用した本格的なスタジオ撮影も可能です。着物の色彩や刺繍、質感まで美しく表現し、細部までこだわった写真をお撮りいたします。",
            image: "/images/studio.webp",
            isStudio: true,
          },
        ],
      },
      support: {
        title: "専門スタッフによる充実したサポート",
        description:
          "お客様に安心して撮影をお楽しみいただけるよう、経験豊富なスタッフが各工程で丁寧にサポートいたします。",
        items: [
          {
            title: "プロカメラマン",
            description:
              "長年の経験を持つプロカメラマンが、お客様の魅力を最大限に引き出す構図やアングルで撮影いたします。自然な表情を引き出すコミュニケーションを大切にし、リラックスした雰囲気の中で撮影を進めます。",
          },
          {
            title: "着付け師",
            description:
              "正統な着付けの技術を持つ着付け師が、着物の美しさを最大限に引き出す着付けを行います。長時間の撮影でも着崩れしないよう、しっかりと仕上げます。着物の選び方から、帯の結び方まで、丁寧にご提案いたします。",
          },
          {
            title: "ヘアメイクスタイリスト",
            description:
              "着物に合わせた和装ヘアセットを、お客様のご要望を伺いながら仕上げます。伝統的なスタイルから、モダンなアレンジまで、幅広く対応いたします。撮影中も随時チェックし、常に最高の状態を保ちます。",
          },
          {
            title: "撮影アシスタント",
            description:
              "撮影当日の移動サポート、小物の管理、撮影スケジュールの調整など、スムーズな撮影進行をサポートいたします。お客様が撮影に集中できるよう、細やかな配慮を心がけています。",
          },
        ],
      },
      pricing: {
        title: "料金プラン",
        domestic: {
          title: "日本人向けプラン",
          plans: [
            {
              name: "DMCクラブメンバー",
              price: "5,000円",
              tax: "（税込）",
              features: [
                "着物レンタル（1着）",
                "着付け・ヘアセット",
                "プロカメラマンによる撮影",
                "ロケーション撮影（富士山・茶畑）またはスタジオ撮影",
                "撮影データオンライン納品",
              ],
            },
            {
              name: "一般",
              price: "10,000円",
              tax: "（税込）",
              features: [
                "着物レンタル（1着)",
                "着付け・ヘアセット",
                "プロカメラマンによる撮影",
                "ロケーション撮影（富士山・茶畑）またはスタジオ撮影",
                "撮影データオンライン納品",
              ],
            },
          ],
          membership: {
            title: "DMCクラブメンバーシップ",
            price: "月額 3,000円",
            description:
              "月額会員になると、撮影料金が半額になるほか、優先予約や特典写真データのプレゼントなど、様々な特典をご利用いただけます。",
          },
        },
        international: {
          title: "外国人向けプラン",
          plans: [
            {
              name: "Premium Plan",
              price: "¥98,000",
              tax: "(tax included)",
              features: [
                "Location shoot (Mt. Fuji & tea fields)",
                "Studio photography",
                "Kimono rental (up to 2 outfits)",
                "Dressing & hairstyling",
                "Professional photographer",
                "Matcha tea experience with sweets",
                "Special photo album",
                "Online photo delivery",
              ],
            },
            {
              name: "Girls' Trip Light Plan",
              price: "¥40,000",
              tax: "(per person, tax included)",
              features: [
                "Group kimono experience",
                "Kimono rental (1 outfit per person)",
                "Dressing & hairstyling",
                "Professional photographer",
                "Location or studio shoot",
                "Online photo delivery",
              ],
            },
          ],
        },
      },
      notes: {
        title: "ご予約・注意事項",
        items: [
          "撮影は完全予約制となっております。ご希望日の1週間前までにご予約ください。",
          "天候によりロケーション撮影が困難な場合は、スタジオ撮影に変更させていただく場合がございます。",
          "撮影データは、撮影後1〜2週間程度でオンラインにて納品いたします。",
          "キャンセルは3日前までにご連絡ください。それ以降のキャンセルにはキャンセル料が発生いたします。",
        ],
      },
    },

    /* ===== EN (flyer-accurate) ===== */
    en: {
      title: "CAMU",
      subtitle: "Kimono Photo Shoot — Mt. Fuji & Tea Fields",
      intro: {
        title: "Traditional Beauty with Mt. Fuji and Tea Fields",
        description:
          "A professional kimono photo experience that combines outdoor views of Mt. Fuji and tea fields with an elegant studio session. Photo data are delivered online. Advance reservation required.",
      },
      locations: {
        title: "Photography Locations",
        items: [
          {
            name: "Mt. Fuji Viewpoint",
            description:
              "Capture unforgettable photos with Mt. Fuji as your backdrop. Seasonal scenery enhances the contrast with your kimono, creating a timeless image.",
            image: "/images/fuji.webp",
          },
          {
            name: "Tea Field",
            description:
              "Shoot among iconic tea fields in Fuji City. The vivid green landscape beautifully complements the colors and textures of your kimono.",
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
          "From dressing and hairstyling to photography, our experienced staff support you at every step for a smooth experience.",
        items: [
          {
            title: "Professional Photographer",
            description:
              "We capture flattering compositions and natural expressions in a relaxed atmosphere.",
          },
          {
            title: "Kimono Dresser",
            description:
              "Secure, beautiful dressing that resists dishevelment during longer sessions.",
          },
          {
            title: "Hair & Makeup Stylist",
            description:
              "Traditional to modern looks coordinated to your preferences and kimono.",
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
        domestic: {
          /* 英語ページでは未使用だが型のため空で定義 */
          title: "",
          plans: [],
          membership: { title: "", price: "", description: "" },
        },
        international: {
          title: "Plans for International Guests",
          plans: [
            {
              name: "Premium Plan",
              price: "¥100,000",
              tax: "(per person, tax included)",
              features: [
                "Location + Studio session",
                "Studio rental (60 min)",
                "Kimono rental",
                "Dressing & hairstyling",
                "Professional photo shoot",
                "10 photo data files (online delivery)",
              ],
            },
            {
              name: "Light Plan",
              price: "¥40,000",
              tax: "(per person, tax included)",
              features: [
                "Kimono rental",
                "Self-shoot allowed (use your own device)",
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
          "Please contact us at least 3 days in advance for cancellations.",
        ],
      },
    },
  };

  // locale の型を固定して t に型を付与
  const currentLocale: "ja" | "en" = locale === "en" ? "en" : "ja";
  const t: LocaleBundle = content[currentLocale];

  return (
    <div className="min-h-screen bg-white">
      {/* ナビゲーション */}
      <div className="border-b border-gray-200 bg-white pt-12">
        <div className="container mx-auto px-6 py-4 lg:px-12">
          <Link
            href={`/${currentLocale}/service`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-[#8B7355]"
          >
            <ArrowLeft className="h-4 w-4" />
            {currentLocale === "ja" ? "サービス一覧に戻る" : "Back to Services"}
          </Link>
        </div>
      </div>

      {/* メインビジュアル：極小幅対策 + sizes */}
      <section className="relative overflow-hidden bg-gray-900 h-[42vh] max-[360px]:h-[36vh] md:h-[55vh]">
        <Image
          src="/images/camu.webp"
          alt="CAMU Kimono Photography"
          fill
          className="object-cover opacity-70 object-[50%_35%]"
          priority
          sizes="(max-width: 390px) 100vw, (max-width: 768px) 100vw, 100vw"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-6 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-4 font-serif text-5xl font-bold text-white md:text-6xl lg:text-7xl"
            >
              {t.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg text-white/90 md:text-xl"
            >
              {t.subtitle}
            </motion.p>
          </div>
        </div>
      </section>

      {/* イントロダクション */}
      <section className="border-b border-gray-200 bg-[#F5F3F0] py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
          >
            <h2 className="mb-6 font-serif text-3xl font-bold text-gray-900 md:text-4xl">
              {t.intro.title}
            </h2>
            <p className="leading-relaxed text-gray-700">
              {t.intro.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 撮影ロケーション：iPadで重ならないよう 2カラム開始を xl に */}
      <section className="border-b border-gray-200 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center font-serif text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {t.locations.title}
          </motion.h2>

          <div className="space-y-20">
            {t.locations.items.map((location: LocationItem, index: number) => (
              <motion.div
                key={`${location.name}-${index}`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
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
                  <h3 className="mb-4 font-serif text-2xl font-bold text-gray-900">
                    {location.name}
                  </h3>
                  <p className="leading-relaxed text-gray-700">
                    {location.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* スタッフサポート */}
      <section className="border-b border-gray-200 bg-[#F5F3F0] py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center"
          >
            <h2 className="mb-6 font-serif text-3xl font-bold text-gray-900 md:text-4xl">
              {t.support.title}
            </h2>
            <p className="mx-auto max-w-3xl leading-relaxed text-gray-700">
              {t.support.description}
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {t.support.items.map((item: SupportItem, index: number) => (
              <motion.div
                key={`${item.title}-${index}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="border-l-4 border-[#8B7355] bg-white p-6"
              >
                <h3 className="mb-3 text-xl font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-gray-700">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 料金プラン */}
      <section className="border-b border-gray-200 py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-16 text-center font-serif text-3xl font-bold text-gray-900 md:text-4xl"
          >
            {t.pricing.title}
          </motion.h2>

          {/* 日本語：国内プラン */}
          {currentLocale === "ja" && (
            <div className="mb-20">
              <h3 className="mb-8 text-center text-2xl font-bold text-gray-900">
                {t.pricing.domestic.title}
              </h3>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                {t.pricing.domestic.plans.map((plan: Plan, index: number) => (
                  <motion.div
                    key={`${plan.name}-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="border-2 border-gray-200 bg-white p-8"
                  >
                    <div className="mb-6 border-b border-gray-200 pb-6">
                      <h4 className="mb-2 text-xl font-bold text-gray-900">
                        {plan.name}
                      </h4>
                      <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                        <span className="text-4xl font-bold text-[#8B7355] leading-tight sm:whitespace-nowrap">
                          {plan.price}
                        </span>
                        <span className="text-sm text-gray-600">
                          {plan.tax}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-3">
                      {plan.features.map((feature: string, i: number) => (
                        <li
                          key={`${plan.name}-feat-${i}`}
                          className="flex items-start gap-3 text-sm text-gray-700"
                        >
                          <span className="mt-1 text-[#8B7355]">•</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mx-auto mt-12 max-w-3xl border-2 border-[#8B7355] bg-[#8B7355]/5 p-8"
              >
                <h4 className="mb-3 text-xl font-bold text-gray-900">
                  {t.pricing.domestic.membership.title}
                </h4>
                <p className="mb-4 text-2xl font-bold text-[#8B7355]">
                  {t.pricing.domestic.membership.price}
                </p>
                <p className="leading-relaxed text-gray-700">
                  {t.pricing.domestic.membership.description}
                </p>
              </motion.div>
            </div>
          )}

          {/* 英語：国際プラン */}
          {currentLocale === "en" && (
            <div>
              <h3 className="mb-8 text-center text-2xl font-bold text-gray-900">
                {t.pricing.international.title}
              </h3>
              <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-2">
                {t.pricing.international.plans.map(
                  (plan: Plan, index: number) => (
                    <motion.div
                      key={`${plan.name}-${index}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: index * 0.2 }}
                      className="border-2 border-gray-200 bg-white p-8"
                    >
                      <div className="mb-6 border-b border-gray-200 pb-6">
                        <h4 className="mb-2 text-xl font-bold text-gray-900">
                          {plan.name}
                        </h4>
                        <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                          <span className="text-4xl font-bold text-[#8B7355] leading-tight sm:whitespace-nowrap">
                            {plan.price}
                          </span>
                          <span className="text-sm text-gray-600">
                            {plan.tax}
                          </span>
                        </div>
                      </div>
                      <ul className="space-y-3">
                        {plan.features.map((feature: string, i: number) => (
                          <li
                            key={`${plan.name}-feat-${i}`}
                            className="flex items-start gap-3 text-sm text-gray-700"
                          >
                            <span className="mt-1 text-[#8B7355]">•</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 注意事項 */}
      <section className="bg-[#F5F3F0] py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl"
          >
            <h2 className="mb-8 text-center font-serif text-3xl font-bold text-gray-900 md:text-4xl">
              {t.notes.title}
            </h2>
            <div className="space-y-4 bg-white p-8">
              {t.notes.items.map((note: string, index: number) => (
                <p
                  key={`note-${index}`}
                  className="border-l-2 border-gray-300 pl-4 text-sm leading-relaxed text-gray-700"
                >
                  {note}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-200 py-16">
        <div className="container mx-auto px-6 text-center lg:px-12">
          <Link href={`/${currentLocale}/contact`}>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="border-2 border-[#2C2C2C] bg-[#2C2C2C] px-12 py-4 font-bold uppercase tracking-wider text-white transition-colors hover:bg-transparent hover:text-[#2C2C2C]"
            >
              {currentLocale === "ja" ? "ご予約・お問い合わせ" : "Book Now"}
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}
