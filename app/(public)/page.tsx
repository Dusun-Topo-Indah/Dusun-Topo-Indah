import { HeroBanner } from "@/components/public/hero-banner";
import { AboutSection } from "@/components/public/about-section";
import { NewsSection } from "@/components/public/news-section";
import { GaleriSection } from "@/components/public/galeri-section";

export const metadata = {
  title: "Beranda — Dusun Topo Indah",
  description: "Selamat datang di portal informasi resmi Dusun Topo Indah.",
};

export default function BerandaPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroBanner />
      {/* About Sectiown */}
      <AboutSection />
      {/* Galeri Section */}
      <GaleriSection />
      {/* News Section */}
      <NewsSection />
    </div>
  );
}
