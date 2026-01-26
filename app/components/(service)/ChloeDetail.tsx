"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Camera, Clock, Check, ArrowLeft, Lightbulb } from "lucide-react";

export default function ChloeDetail() {
  const locale = useLocale();

  const content = {
    ja: {
      title: "Chloe (クロエ)",
      subtitle: "レンタルスタジオ",
      hero: {
        title: "プロ仕様の撮影スタジオを\nリーズナブルな価格で",
        description:
          "七五三、成人式、ドレス、着物撮影に対応。自由なスタイルで撮影できるセルフスタジオです。",
      },
      pricing: {
        title: "料金プラン",
        plans: [
          {
            duration: "1時間",
            price: "¥2,000",
            description: "短時間の撮影や商品撮影に最適",
          },
          {
            duration: "4時間",
            price: "¥5,000",
            description: "じっくり撮影したい方におすすめ",
          },
        ],
        note: "※カメラマン・メイクは含まれません",
      },
      features: {
        title: "スタジオの特徴",
        items: [
          {
            icon: "camera",
            title: "多様な撮影シーン",
            description: "七五三、成人式、ドレス、着物撮影など幅広く対応",
          },
          {
            icon: "background",
            title: "豊富な背景セット",
            description: "シーンに合わせた各種背景をご用意",
          },
          {
            icon: "costume",
            title: "衣装レンタル可能",
            description: "撮影用の衣装もご用意しています",
          },
        ],
      },
      scenes: {
        title: "撮影シーン",
        items: [
          {
            name: "七五三撮影",
            description:
              "お子様の大切な節目を、プロ仕様のスタジオで記念に残しませんか。",
          },
          {
            name: "成人式撮影",
            description: "振袖姿を美しく撮影。人生の節目を特別な一枚に。",
          },
          {
            name: "ドレス撮影",
            description: "ウェディングドレスやカラードレスでの撮影に対応。",
          },
          {
            name: "ポートレート撮影",
            description: "プロフィール写真、家族写真など様々なシーンに。",
          },
        ],
      },
      equipment: {
        title: "設備・機材",
        items: [
          "各種背景セット",
          "撮影用小道具",
          "衣装レンタル",
          "メイクスペース",
          "着替えスペース",
          "Wi-Fi完備",
        ],
      },
      usage: {
        title: "ご利用の流れ",
        steps: [
          {
            number: "01",
            title: "ご予約",
            description: "お電話またはお問い合わせフォームからご予約",
          },
          {
            number: "02",
            title: "スタジオ入室",
            description: "予約時間にスタジオへお越しください",
          },
          {
            number: "03",
            title: "準備・セッティング",
            description: "照明や背景をご自由にセッティング",
          },
          {
            number: "04",
            title: "撮影",
            description: "ご自身のカメラで自由に撮影",
          },
          {
            number: "05",
            title: "退室",
            description: "片付けをして退室",
          },
        ],
      },
      notes: {
        title: "ご注意事項",
        items: [
          "完全予約制です。事前にご予約をお願いいたします。",
          "カメラマン・メイクアップアーティストは含まれておりません。",
          "ご自身でカメラをご持参ください。",
          "スタジオ内での飲食はご遠慮ください。",
          "キャンセルは前日までにご連絡ください。",
        ],
      },
    },
    en: {
      title: "Chloe",
      subtitle: "Rental Studio",
      hero: {
        title: "Professional Photography Studio\nat Affordable Rates",
        description:
          "Perfect for Shichi-Go-San, coming-of-age ceremonies, dress and ceremonial kimono photography. Self-service studio for creative freedom.",
      },
      pricing: {
        title: "Pricing Plans",
        plans: [
          {
            duration: "1 hour",
            price: "¥2,000",
            description: "Perfect for quick shoots and product photography",
          },
          {
            duration: "4 hours",
            price: "¥5,000",
            description: "Recommended for extended photo sessions",
          },
        ],
        note: "※Photographer and makeup not included",
      },
      features: {
        title: "Studio Features",
        items: [
          {
            icon: "camera",
            title: "Versatile Photography",
            description:
              "Suitable for Shichi-Go-San, ceremonies, dress and ceremonial kimono shoots",
          },
          {
            icon: "background",
            title: "Various Backgrounds",
            description: "Multiple backdrop options for different scenes",
          },
          {
            icon: "costume",
            title: "Costume Rental",
            description: "Photography costumes available for rent",
          },
        ],
      },
      scenes: {
        title: "Photography Scenes",
        items: [
          {
            name: "Shichi-Go-San",
            description:
              "Capture your child's milestone in our professional studio.",
          },
          {
            name: "Coming-of-Age Ceremony",
            description:
              "Beautiful ceremonial kimono photography for life's special moments.",
          },
          {
            name: "Dress Photography",
            description: "Wedding and colored dress photography sessions.",
          },
          {
            name: "Portrait Photography",
            description: "Profile photos, family portraits and more.",
          },
        ],
      },
      equipment: {
        title: "Equipment & Facilities",
        items: [
          "Various background sets",
          "Photography props",
          "Costume rental",
          "Makeup space",
          "Changing room",
          "Wi-Fi available",
        ],
      },
      usage: {
        title: "How to Use",
        steps: [
          {
            number: "01",
            title: "Reservation",
            description: "Book via phone or contact form",
          },
          {
            number: "02",
            title: "Studio Entry",
            description: "Arrive at studio at your reserved time",
          },
          {
            number: "03",
            title: "Setup",
            description: "Set up lighting and backgrounds as needed",
          },
          {
            number: "04",
            title: "Photo Shoot",
            description: "Take photos freely with your own camera",
          },
          {
            number: "05",
            title: "Check Out",
            description: "Clean up and exit the studio",
          },
        ],
      },
      notes: {
        title: "Important Notes",
        items: [
          "Reservation required. Please book in advance.",
          "Photographer and makeup artist not included.",
          "Please bring your own camera.",
          "Food and drinks not allowed in studio.",
          "Cancellations must be made by the day before.",
        ],
      },
    },
  };

  const t = content[locale as keyof typeof content] || content.ja;

  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      {/* ヒーローセクション */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-[#2C2C2C]">
        <motion.div
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src="/images/chloe.webp"
            alt="Chloe Studio"
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        <div className="relative z-10 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link
              href={`/${locale}/service`}
              className="mb-8 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm uppercase tracking-wider">
                {locale === "ja" ? "サービス一覧に戻る" : "Back to Services"}
              </span>
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-6 whitespace-pre-line font-['Crimson_Text'] text-4xl font-black leading-tight text-white md:text-6xl lg:text-7xl"
          >
            {t.hero.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mx-auto max-w-2xl text-lg text-white/90"
          >
            {t.hero.description}
          </motion.p>
        </div>
      </section>

      {/* コンテンツ */}
      <div className="container mx-auto px-6 py-20 lg:px-12">
        {/* 料金プラン */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="mb-12 text-center font-['Crimson_Text'] text-4xl font-black text-[#2C2C2C]">
            {t.pricing.title}
          </h2>

          <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2">
            {t.pricing.plans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="rounded-2xl border-2 border-[#2C2C2C]/10 bg-white p-8 shadow-xl"
              >
                <div className="mb-4 flex items-center gap-3">
                  <Clock className="h-8 w-8 text-[#8B7355]" />
                  <h3 className="text-2xl font-bold text-[#2C2C2C]">
                    {plan.duration}
                  </h3>
                </div>

                <div className="mb-4">
                  <span className="text-4xl font-black text-[#8B7355]">
                    {plan.price}
                  </span>
                </div>

                <p className="text-sm text-[#5A5A5A]">{plan.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 text-center text-sm italic text-[#999]"
          >
            {t.pricing.note}
          </motion.p>
        </motion.section>

        {/* スタジオの特徴 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="mb-12 text-center font-['Crimson_Text'] text-4xl font-black text-[#2C2C2C]">
            {t.features.title}
          </h2>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {t.features.items.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="rounded-2xl bg-white p-6 shadow-lg"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#8B7355]/10">
                  {feature.icon === "camera" && (
                    <Camera className="h-7 w-7 text-[#8B7355]" />
                  )}
                  {feature.icon === "light" && (
                    <Lightbulb className="h-7 w-7 text-[#8B7355]" />
                  )}
                  {feature.icon === "background" && (
                    <svg
                      className="h-7 w-7 text-[#8B7355]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        strokeWidth="2"
                      />
                      <path d="M3 9h18M9 21V9" strokeWidth="2" />
                    </svg>
                  )}
                  {feature.icon === "costume" && (
                    <svg
                      className="h-7 w-7 text-[#8B7355]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2L8 8H3l5 5-1 7 5-3 5 3-1-7 5-5h-5l-4-6z"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="mb-2 text-lg font-bold text-[#2C2C2C]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[#5A5A5A]">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 撮影シーン */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="mb-12 text-center font-['Crimson_Text'] text-4xl font-black text-[#2C2C2C]">
            {t.scenes.title}
          </h2>

          <div className="grid gap-6 md:grid-cols-2">
            {t.scenes.items.map((scene, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-2xl bg-white p-6 shadow-lg"
              >
                <h3 className="mb-3 text-xl font-bold text-[#2C2C2C]">
                  {scene.name}
                </h3>
                <p className="text-sm text-[#5A5A5A]">{scene.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 設備・機材 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="mb-12 text-center font-['Crimson_Text'] text-4xl font-black text-[#2C2C2C]">
            {t.equipment.title}
          </h2>

          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
            <ul className="grid gap-4 md:grid-cols-2">
              {t.equipment.items.map((item, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <Check className="h-5 w-5 shrink-0 text-[#8B7355]" />
                  <span className="text-[#5A5A5A]">{item}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* ご利用の流れ */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <h2 className="mb-12 text-center font-['Crimson_Text'] text-4xl font-black text-[#2C2C2C]">
            {t.usage.title}
          </h2>

          <div className="space-y-8">
            {t.usage.steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex gap-6"
              >
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#8B7355] text-2xl font-black text-white">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 text-xl font-bold text-[#2C2C2C]">
                    {step.title}
                  </h3>
                  <p className="text-[#5A5A5A]">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 注意事項 */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <h2 className="mb-8 text-center font-['Crimson_Text'] text-4xl font-black text-[#2C2C2C]">
            {t.notes.title}
          </h2>

          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 shadow-lg">
            <ul className="space-y-4">
              {t.notes.items.map((note, index) => (
                <li
                  key={index}
                  className="flex items-start gap-3 text-sm text-[#5A5A5A]"
                >
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-[#8B7355]" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <Link href={`/${locale}/contact`}>
            <motion.button
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className="border-2 border-[#2C2C2C] bg-[#2C2C2C] px-12 py-4 text-lg font-bold uppercase tracking-wider text-white transition-all hover:bg-transparent hover:text-[#2C2C2C]"
            >
              {locale === "ja" ? "ご予約・お問い合わせ" : "Book Now"}
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
