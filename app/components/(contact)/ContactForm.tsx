// app/components/(contact)/ContactForm.tsx
"use client";

import { motion } from "framer-motion";
import { useLocale } from "next-intl";
import { useState } from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

type FormData = {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
};

export default function ContactForm() {
  const locale = useLocale();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );

  const content = {
    ja: {
      title: "お問い合わせ",
      subtitle: "ご予約・ご質問はこちらから",
      form: {
        name: "お名前",
        email: "メールアドレス",
        phone: "電話番号",
        service: "ご希望のサービス",
        message: "お問い合わせ内容",
        submit: "送信する",
        submitting: "送信中...",
        namePlaceholder: "山田 太郎",
        emailPlaceholder: "example@email.com",
        phonePlaceholder: "090-1234-5678",
        messagePlaceholder: "ご質問やご要望をお聞かせください",
      },
      services: [
        { value: "", label: "選択してください" },
        { value: "camu", label: "花夢 (CAMU) - 着物撮影" },
        { value: "chloe", label: "Chloe - レンタルスタジオ" },
        { value: "cafe", label: "アンティークカフェ" },
        { value: "other", label: "その他" },
      ],
      info: {
        title: "店舗情報",
        address: {
          label: "住所",
          value: "〒417-0001\n静岡県富士市荒田島町1-13 ラシェット1",
        },
        phone: { label: "電話番号", value: "+81-545-55-4550" },
        email: { label: "メール", value: "dmc.fuji0823@gmail.com" },
        hours: { label: "営業時間", value: "11:00〜17:00\n定休日: 水曜日" },
      },
      success: {
        title: "送信完了",
        message:
          "お問い合わせありがとうございます。2営業日以内にご連絡させていただきます。",
      },
      error: {
        title: "送信エラー",
        message:
          "送信に失敗しました。お手数ですが、もう一度お試しいただくか、お電話にてお問い合わせください。",
      },
    },
    en: {
      title: "Contact Us",
      subtitle: "Get in touch for reservations and inquiries",
      form: {
        name: "Name",
        email: "Email",
        phone: "Phone",
        service: "Service",
        message: "Message",
        submit: "Send Message",
        submitting: "Sending...",
        namePlaceholder: "John Doe",
        emailPlaceholder: "example@email.com",
        phonePlaceholder: "+81-90-1234-5678",
        messagePlaceholder: "Tell us about your inquiry",
      },
      services: [
        { value: "", label: "Select a service" },
        { value: "camu", label: "CAMU - Ceremonial Kimono Photography" },
        { value: "chloe", label: "Chloe - Rental Studio" },
        { value: "cafe", label: "Antique Cafe" },
        { value: "other", label: "Other" },
      ],
      info: {
        title: "Studio Information",
        address: {
          label: "Address",
          value: "1-13 Aratajima-cho, Fuji City, Shizuoka 417-0001, Japan",
        },
        phone: { label: "Phone", value: "+81-545-55-4550" },
        email: { label: "Email", value: "dmc.fuji0823@gmail.com" },
        hours: {
          label: "Business Hours",
          value: "11:00–17:00\nClosed: Wednesday",
        },
      },
      success: {
        title: "Message Sent",
        message:
          "Thank you for contacting us. We will respond within 2 business days.",
      },
      error: {
        title: "Send Error",
        message:
          "Failed to send message. Please try again or contact us by phone.",
      },
    },
  } as const;

  const t = content[(locale as "ja" | "en") ?? "ja"] ?? content.ja;

  // ✅ 型を正しく付け直し（ここが原因）
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name as keyof FormData]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, locale }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data?.error || "Failed to send message");

      setSubmitStatus("success");
      setFormData({ name: "", email: "", phone: "", service: "", message: "" });
    } catch {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <section className="border-b border-[#E5E3DC] bg-white py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="mb-6 font-serif text-4xl font-light tracking-wide text-[#2C2C2C] md:text-5xl">
              {t.title}
            </h1>
            <div className="mx-auto mb-6 h-px w-16 bg-[#8B7355]" />
            <p className="text-base text-gray-600 md:text-lg">{t.subtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <form
                onSubmit={handleSubmit}
                className="space-y-6 border border-[#E5E3DC] bg-white p-8 shadow-lg md:p-10"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block font-light tracking-wide text-gray-700"
                  >
                    {t.form.name}
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder={t.form.namePlaceholder}
                    autoComplete="name"
                    className="w-full border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-[#8B7355] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-light tracking-wide text-gray-700"
                  >
                    {t.form.email}
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t.form.emailPlaceholder}
                    autoComplete="email"
                    className="w-full border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-[#8B7355] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block font-light tracking-wide text-gray-700"
                  >
                    {t.form.phone}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t.form.phonePlaceholder}
                    autoComplete="tel"
                    className="w-full border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-[#8B7355] focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="service"
                    className="mb-2 block font-light tracking-wide text-gray-700"
                  >
                    {t.form.service}
                  </label>
                  <select
                    id="service"
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-[#8B7355] focus:outline-none"
                  >
                    {t.services.map((service) => (
                      <option key={service.value} value={service.value}>
                        {service.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="mb-2 block font-light tracking-wide text-gray-700"
                  >
                    {t.form.message}
                    <span className="ml-1 text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder={t.form.messagePlaceholder}
                    className="w-full resize-none border border-gray-300 bg-white px-4 py-3 text-gray-900 transition-colors focus:border-[#8B7355] focus:outline-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  className="w-full border-2 border-[#2C2C2C] bg-[#2C2C2C] px-8 py-4 font-light uppercase tracking-widest text-white transition-all duration-300 hover:bg-transparent hover:text-[#2C2C2C] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? t.form.submitting : t.form.submit}
                </motion.button>

                {submitStatus === "success" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-l-4 border-green-500 bg-green-50 p-4"
                  >
                    <p className="font-medium text-green-800">
                      {t.success.title}
                    </p>
                    <p className="mt-1 text-sm text-green-700">
                      {t.success.message}
                    </p>
                  </motion.div>
                )}

                {submitStatus === "error" && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-l-4 border-red-500 bg-red-50 p-4"
                  >
                    <p className="font-medium text-red-800">{t.error.title}</p>
                    <p className="mt-1 text-sm text-red-700">
                      {t.error.message}
                    </p>
                  </motion.div>
                )}
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div>
                <h2 className="mb-8 font-serif text-3xl font-light tracking-wide text-[#2C2C2C]">
                  {t.info.title}
                </h2>
                <div className="h-px w-12 bg-[#8B7355]" />
              </div>

              <div className="space-y-8 border border-[#E5E3DC] bg-white p-8 shadow-lg">
                <div className="flex gap-4">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#8B7355]" />
                  <div>
                    <p className="mb-2 font-light tracking-wide text-gray-900">
                      {t.info.address.label}
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                      {t.info.address.value}
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-[#E5E3DC] pt-8">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-[#8B7355]" />
                  <div>
                    <p className="mb-2 font-light tracking-wide text-gray-900">
                      {t.info.phone.label}
                    </p>
                    <a
                      href={`tel:${t.info.phone.value.replace(/[^+\d]/g, "")}`}
                      className="text-sm text-gray-600 transition-colors hover:text-[#8B7355]"
                    >
                      {t.info.phone.value}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-[#E5E3DC] pt-8">
                  <Mail className="mt-1 h-5 w-5 shrink-0 text-[#8B7355]" />
                  <div>
                    <p className="mb-2 font-light tracking-wide text-gray-900">
                      {t.info.email.label}
                    </p>
                    <a
                      href={`mailto:${t.info.email.value}`}
                      className="text-sm text-gray-600 transition-colors hover:text-[#8B7355]"
                    >
                      {t.info.email.value}
                    </a>
                  </div>
                </div>

                <div className="flex gap-4 border-t border-[#E5E3DC] pt-8">
                  <Clock className="mt-1 h-5 w-5 shrink-0 text-[#8B7355]" />
                  <div>
                    <p className="mb-2 font-light tracking-wide text-gray-900">
                      {t.info.hours.label}
                    </p>
                    <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                      {t.info.hours.value}
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="h-[300px] overflow-hidden border border-[#E5E3DC] shadow-lg">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.935887267429!2d138.68353227668302!3d35.15821965852564!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x601a2b006bb14195%3A0x5dfbf3ad2e789fda!2zRE1D44OJ44Os44K544Oe44Oz44Kz44O844OJ!5e0!3m2!1sja!2sjp!4v1763086557169!5m2!1sja!2sjp"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="DMC Photo Studio Location"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
