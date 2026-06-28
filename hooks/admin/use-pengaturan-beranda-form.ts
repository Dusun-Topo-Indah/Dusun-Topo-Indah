import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/lib/cloudinary-client";
import type { ParsedSlide, SlideData } from "@/types";

export function usePengaturanBerandaForm({
  globalConfig,
}: {
  globalConfig?: Record<string, string>;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggingSlideId, setDraggingSlideId] = useState<string | null>(null);

  let initialSlides: SlideData[] = [
    {
      id: "slide-1",
      judul: "Membangun Dusun Topo Indah yang Lebih Mandiri dan Sejahtera",
      linkText: "Pelajari Lebih Lanjut",
      linkHref: "/profil",
      foto: null,
      currentFotoUrl: "",
    },
  ];

  if (globalConfig?.["beranda_hero_slides"]) {
    try {
      const parsed = JSON.parse(globalConfig["beranda_hero_slides"]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        initialSlides = parsed.map((s: ParsedSlide, i: number) => ({
          id: s.id || `slide-initial-${i}`,
          judul: s.title || "",
          linkText: s.linkText || "",
          linkHref: s.linkHref || "",
          foto: null,
          currentFotoUrl: s.image || "",
        }));
      }
    } catch(e) {}
  }

  // State untuk Bagian Hero (Daftar Slide)
  const [slides, setSlides] = useState<SlideData[]>(initialSlides);

  // State untuk Bagian Tentang Dusun
  const [narasi, setNarasi] = useState(
    globalConfig?.["beranda_tentang_narasi"] || 
    "Misi kami adalah mewujudkan Dusun Topo Indah yang sejahtera, mandiri, dan berbudaya melalui kolaborasi aktif warga, pemanfaatan potensi alam yang berkelanjutan, serta pelayanan publik yang transparan."
  );
  const [totalPenduduk, setTotalPenduduk] = useState(globalConfig?.["beranda_tentang_penduduk"] || "1250");
  const [totalRw, setTotalRw] = useState(globalConfig?.["beranda_tentang_rw"] || "4");
  const [totalRt, setTotalRt] = useState(globalConfig?.["beranda_tentang_rt"] || "12");

  // State untuk Bagian Galeri Beranda
  const [selectedGaleriIds, setSelectedGaleriIds] = useState<string[]>(
    globalConfig?.["beranda_galeri_ids"] ? globalConfig["beranda_galeri_ids"].split(",").map(id => id.trim()) : []
  );

  // Handler untuk Slide
  const handleAddSlide = () => {
    setSlides([
      ...slides,
      {
        id: `slide-${Date.now()}`,
        judul: "",
        linkText: "",
        linkHref: "",
        foto: null,
        currentFotoUrl: "",
      },
    ]);
  };

  const handleRemoveSlide = (id: string) => {
    if (slides.length === 1) {
      alert("Minimal harus ada 1 slide banner.");
      return;
    }
    setSlides(slides.filter((slide) => slide.id !== id));
  };

  const updateSlide = <K extends keyof SlideData>(id: string, field: K, value: SlideData[K]) => {
    setSlides(
      slides.map((slide) => (slide.id === id ? { ...slide, [field]: value } : slide))
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>, slideId: string) => {
    e.preventDefault();
    setDraggingSlideId(slideId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDraggingSlideId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>, slideId: string) => {
    e.preventDefault();
    setDraggingSlideId(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type.startsWith("image/")) {
        updateSlide(slideId, "foto", f);
      } else {
        alert("Harap unggah file gambar.");
      }
    }
  };

  const handleToggleGaleri = (id: string) => {
    setSelectedGaleriIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        if (prev.length >= 5) {
          alert("Maksimal 5 galeri yang dapat dipilih.");
          return prev;
        }
        return [...prev, id];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const finalSlides = [];
      
      for (const slide of slides) {
        let imageUrl = slide.currentFotoUrl;
        
        if (slide.foto) {
          try {
            imageUrl = await uploadToCloudinary(slide.foto);
          } catch (error) {
            toast.error(`Gagal mengunggah foto untuk slide: ${slide.judul}`);
            setIsSubmitting(false);
            return;
          }
        }
        
        finalSlides.push({
          id: slide.id,
          image: imageUrl,
          title: slide.judul,
          linkText: slide.linkText,
          linkHref: slide.linkHref,
        });
      }

      const response = await fetch("/api/pengaturan-beranda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beranda_hero_slides: JSON.stringify(finalSlides),
          beranda_tentang_narasi: narasi,
          beranda_tentang_penduduk: totalPenduduk,
          beranda_tentang_rw: totalRw,
          beranda_tentang_rt: totalRt,
          beranda_galeri_ids: selectedGaleriIds.join(","),
        }),
      });
      if (!response.ok) throw new Error("Gagal menyimpan pengaturan.");
      toast.success("Pengaturan galeri beranda berhasil disimpan!");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan pengaturan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    draggingSlideId,
    slides,
    narasi,
    setNarasi,
    totalPenduduk,
    setTotalPenduduk,
    totalRw,
    setTotalRw,
    totalRt,
    setTotalRt,
    selectedGaleriIds,
    handleAddSlide,
    handleRemoveSlide,
    updateSlide,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleToggleGaleri,
    handleSubmit,
  };
}
