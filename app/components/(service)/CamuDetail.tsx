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
  // 既存の仕組みは維持するが、このページは英語固定で表示
  useLocale(); // 使わないがフック構成は維持
  const currentLocale = "en" as const;

  const content: Record<"en", LocaleBundle> = {
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

  const t: LocaleBundle = content.en;

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <div className="border-b border-gray-200 bg-white pt-12">
        <div className="container mx-auto px-6 py-4 lg:px-12">
          <Link
            href={`/${currentLocale}/service`}
            className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-[#8B7355]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Services
          </Link>
        </div>
      </div>

      {/* Hero */}
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

      {/* Intro */}
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

      {/* Locations */}
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

      {/* Support */}
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

      {/* Pricing (International only) */}
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
        </div>
      </section>

      {/* Notes */}
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
              Book Now
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  );
}
