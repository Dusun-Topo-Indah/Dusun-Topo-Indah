import { BentoGallery, GalleryItem } from "@/components/public/bento-gallery";
import { PageHeader } from "@/components/public/page-header";
import { getGaleriList } from "@/lib/google-sheets";

export const metadata = {
  title: "Galeri — Dusun Topo Indah",
  description: "Koleksi foto dan dokumentasi kegiatan di Dusun Topo Indah.",
};

export default async function GaleriPage() {
  const galeriData = await getGaleriList();
  
  let items: GalleryItem[] = [];
  
  if (galeriData.length > 0) {
    const baseItems = galeriData.map(g => ({
      id: g.id,
      image: g.url_foto,
      title: g.judul || "Tanpa Judul",
      category: g.kategori
    }));
    
    items = [...baseItems];
    let loopIndex = 0;
    while (items.length < 21) {
      items.push({
        ...baseItems[loopIndex % baseItems.length],
        id: `duplicate-${items.length}`,
      });
      loopIndex++;
    }
    items = items.slice(0, 21);
  } else {
    const fallbackImages = [
      "/images/hero_bg_desa.png",
      "/images/hero_bg_desa_2.png",
      "/images/hero_bg_desa_3.png"
    ];
    
    items = Array.from({ length: 21 }).map((_, i) => ({
      id: `dummy-${i}`,
      image: fallbackImages[i % fallbackImages.length],
      title: `Foto Galeri ${i + 1}`,
      category: "Umum"
    }));
  }

  return (
    <main className="w-full bg-slate-50 min-h-screen pb-20">
      <PageHeader 
        title="Galeri Dusun" 
        description="Melihat lebih dekat keindahan alam, kegiatan masyarakat, dan momen-momen penting di Dusun Topo Indah."
      />
      
      {/* Grid Container */}
      <div className="w-full pt-4 md:pt-10">
        <BentoGallery items={items} />
      </div>
    </main>
  );
}
