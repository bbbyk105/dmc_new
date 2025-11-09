import { Metadata } from "next";
import ContactForm from "@/app/components/(contact)/ContactForm";

export const metadata: Metadata = {
  title: "お問い合わせ | DMC",
  description: "DMCへのお問い合わせ・ご予約はこちらから。",
};

export default function ContactPage() {
  return <ContactForm />;
}
