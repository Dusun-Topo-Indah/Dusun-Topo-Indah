import { AboutSection } from "@/components/public/about-section";
import { GaleriSection } from "@/components/public/galeri-section";
import { HeroBanner } from "@/components/public/hero-banner";
import { NewsSection } from "@/components/public/news-section";
import { getGaleriList, getGlobalConfig } from "@/lib/google-sheets";

export const metadata = {
  title: "Beranda — Dusun Topo Indah",
  description: "Selamat datang di portal informasi resmi Dusun Topo Indah.",
};

export default async function BerandaPage() {
  const globalConfig = await getGlobalConfig();
  const galeriList = await getGaleriList();
  
  const selectedGaleriIdsStr = globalConfig["beranda_galeri_ids"];
  let selectedGaleri = galeriList;
  
  if (selectedGaleriIdsStr && selectedGaleriIdsStr.trim() !== "") {
    const ids = selectedGaleriIdsStr.split(",").map(id => id.trim());
    selectedGaleri = ids.map(id => galeriList.find(g => g.id === id)).filter((g): g is NonNullable<typeof g> => g !== undefined);
  }

  if (selectedGaleri.length === 0) {
    selectedGaleri = galeriList.slice(0, 5);
  }
  
  const fallbackSlides = [
    {
      id: "fallback-1",
      image: "/images/hero_bg_desa.png",
      title: "KEINDAHAN ALAM",
      subtitle: "Dusun Topo Indah - Tidore",
      description: "Nikmati pemandangan alam yang asri dan sejuk, membentang dari perbukitan hingga pesisir pantai. Sebuah harmoni alam yang menenangkan.",
    },
    {
      id: "fallback-2",
      image: "/images/hero_bg_desa_2.png",
      title: "PANEN RAYA",
      subtitle: "Pertanian Organik",
      description: "Sektor pertanian yang terus berkembang dengan hasil panen padi organik melimpah setiap musimnya. Bukti kesuburan tanah Topo Indah.",
    },
    {
      id: "fallback-3",
      image: "/images/hero_bg_desa_3.png",
      title: "PESONA PAGI",
      subtitle: "Destinasi Ekowisata",
      description: "Keindahan embun pagi dan udara segar menjadikan Topo Indah sebagai destinasi ekowisata favorit bagi wisatawan lokal maupun mancanegara.",
    },
  ];

  const galeriSlides = selectedGaleri.length > 0 
    ? selectedGaleri.slice(0, 5).map((item) => ({
        id: item.id,
        image: item.url_foto,
        title: item.judul || "Tanpa Judul",
        subtitle: item.kategori,
        description: item.deskripsi,
      }))
    : fallbackSlides;

  return (
    <div className="flex flex-col w-full">
      <HeroBanner />
      {/* About Section */}
      <AboutSection />
      {/* Galeri Section */}
      <GaleriSection initialSlides={galeriSlides} />
      {/* News Section */}
      <NewsSection />
    </div>
  );
}
