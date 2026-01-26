import IntroHeader from "@/app/components/(service)/IntroHeader";
import ValueSection from "@/app/components/(service)/ValueSection";
import FeaturedSection from "@/app/components/(service)/FeaturedSection";
import ServiceGrid from "@/app/components/(service)/ServiceGrid";
import FlowSection from "@/app/components/(service)/FlowSection";
import FaqSection from "@/app/components/(service)/FaqSection";
import FinalCtaSection from "@/app/components/(service)/FinalCtaSection";

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-[#faf8f4]">
      <IntroHeader />
      <ValueSection />
      <FeaturedSection />
      <ServiceGrid />
      <FlowSection />
      <FaqSection />
      <FinalCtaSection />
    </div>
  );
}
