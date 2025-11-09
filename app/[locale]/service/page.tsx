import ServiceHero from "@/app/components/(service)/ServiceHero";
import ServiceList from "@/app/components/(service)/ServiceList";

export default function ServicePage() {
  return (
    <div className="min-h-screen bg-[#F5F3F0]">
      <ServiceHero />
      <ServiceList />
    </div>
  );
}
