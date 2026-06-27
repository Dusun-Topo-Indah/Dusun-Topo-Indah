"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ImagePlus, Loader2, Save, FileText, Plus, Trash2 } from "lucide-react";

type SlideData = {
  id: string;
  judul: string;
  linkText: string;
  linkHref: string;
  foto: File | null;
  currentFotoUrl: string;
};

export function PengaturanBerandaForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draggingSlideId, setDraggingSlideId] = useState<string | null>(null);

  // State untuk Bagian Hero (Daftar Slide)
  const [slides, setSlides] = useState<SlideData[]>([
    {
      id: "slide-1",
      judul: "Membangun Dusun Topo Indah yang Lebih Mandiri dan Sejahtera",
      linkText: "Pelajari Lebih Lanjut",
      linkHref: "/profil",
      foto: null,
      currentFotoUrl: "",
    },
  ]);

  // State untuk Bagian Tentang Dusun
  const [narasi, setNarasi] = useState("Misi kami adalah mewujudkan Dusun Topo Indah yang sejahtera, mandiri, dan berbudaya melalui kolaborasi aktif warga, pemanfaatan potensi alam yang berkelanjutan, serta pelayanan publik yang transparan.");
  const [totalPenduduk, setTotalPenduduk] = useState("1250");
  const [totalRw, setTotalRw] = useState("4");
  const [totalRt, setTotalRt] = useState("12");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // TODO: Implementasi upload ke Cloudinary dan simpan ke sheet Global_Config
    setTimeout(() => {
      setIsSubmitting(false);
      alert("Pengaturan beranda berhasil disimpan (Simulasi)!");
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl pb-20">
      <Accordion multiple defaultValue={["hero", "tentang"]} className="w-full space-y-4">
        
        {/* SECTION 1: HERO BANNER */}
        <AccordionItem value="hero" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Bagian Hero Banner
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-8">
            {slides.map((slide, index) => (
              <div key={slide.id} className="relative flex flex-col gap-6 p-6 border rounded-lg bg-slate-50/50">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-slate-700">Pengaturan Slide</h4>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                    onClick={() => handleRemoveSlide(slide.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kiri: Upload Gambar */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-sm font-semibold">
                      Gambar Banner <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <div className="relative group mt-1">
                      <label 
                        htmlFor={`foto-${slide.id}`} 
                        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-md cursor-pointer overflow-hidden transition-all ${
                          draggingSlideId === slide.id 
                            ? "border-primary bg-primary/5" 
                            : "border-slate-300 bg-white hover:border-slate-400/80 hover:bg-slate-50"
                        }`}
                        onDragOver={(e) => handleDragOver(e, slide.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, slide.id)}
                      >
                        {slide.foto ? (
                          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 relative">
                            <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">{slide.foto.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">{(slide.foto.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        ) : slide.currentFotoUrl ? (
                          <>
                            <Image 
                              src={slide.currentFotoUrl} 
                              alt="Current Cover" 
                              fill 
                              className="object-cover opacity-40 group-hover:opacity-20 transition-opacity" 
                              sizes="400px" 
                            />
                            <div className="relative z-10 flex flex-col items-center justify-center">
                              <ImagePlus className="w-8 h-8 text-foreground mb-2" />
                              <p className="text-sm text-foreground font-semibold">Ganti Gambar Banner</p>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 z-10 relative text-center">
                            <div className="flex gap-4 items-center mb-3 text-slate-500">
                              <ImagePlus className="w-8 h-8" />
                            </div>
                            <p className="text-sm text-slate-500 mb-1">Geser & Lepas gambar banner ke sini</p>
                            <p className="text-xs text-muted-foreground">Rekomendasi ukuran: 1920x1080px (Landscape)</p>
                          </div>
                        )}
                        <Input
                          id={`foto-${slide.id}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => updateSlide(slide.id, "foto", e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Kanan: Teks Input */}
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`judul-${slide.id}`} className="text-sm font-semibold">
                      Judul Utama <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      id={`judul-${slide.id}`}
                      placeholder="Teks besar yang tampil di tengah gambar..."
                      value={slide.judul}
                      onChange={(e) => updateSlide(slide.id, "judul", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`linkText-${slide.id}`} className="text-sm font-semibold">Teks Tombol Aksi</Label>
                    <Input
                      id={`linkText-${slide.id}`}
                      placeholder="Contoh: Pelajari Lebih Lanjut"
                      value={slide.linkText}
                      onChange={(e) => updateSlide(slide.id, "linkText", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`linkHref-${slide.id}`} className="text-sm font-semibold">Tujuan Tautan (URL)</Label>
                    <Input
                      id={`linkHref-${slide.id}`}
                      placeholder="Contoh: /profil atau https://..."
                      value={slide.linkHref}
                      onChange={(e) => updateSlide(slide.id, "linkHref", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-dashed h-14"
              onClick={handleAddSlide}
            >
              <Plus className="w-5 h-5 mr-2" />
              Tambah Slide Banner
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* SECTION 2: TENTANG DUSUN & STATISTIK */}
        <AccordionItem value="tentang" className="border-b pb-4">
          <AccordionTrigger className="text-xl font-bold hover:no-underline">
            Bagian Tentang Dusun & Statistik
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="narasi" className="text-sm font-semibold">
                Narasi / Misi Singkat <span className="text-red-500 ml-0.5">*</span>
              </Label>
              <Textarea
                id="narasi"
                placeholder="Tuliskan cerita singkat atau misi dusun..."
                className="resize-none min-h-[120px]"
                value={narasi}
                onChange={(e) => setNarasi(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Teks ini akan tampil besar di halaman beranda dengan efek pengetikan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
              <div className="space-y-2">
                <Label htmlFor="totalPenduduk" className="text-sm font-semibold">Total Penduduk</Label>
                <Input
                  id="totalPenduduk"
                  type="number"
                  min="0"
                  value={totalPenduduk}
                  onChange={(e) => setTotalPenduduk(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRw" className="text-sm font-semibold">Jumlah RW</Label>
                <Input
                  id="totalRw"
                  type="number"
                  min="0"
                  value={totalRw}
                  onChange={(e) => setTotalRw(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalRt" className="text-sm font-semibold">Jumlah RT</Label>
                <Input
                  id="totalRt"
                  type="number"
                  min="0"
                  value={totalRt}
                  onChange={(e) => setTotalRt(e.target.value)}
                  required
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

      </Accordion>

      <div className="pt-8">
        <Button type="submit" disabled={isSubmitting} className="w-full px-8 text-base h-14">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Menyimpan Perubahan...
            </>
          ) : (
            <>
              <Save className="mr-2 h-5 w-5" />
              Simpan Pengaturan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
