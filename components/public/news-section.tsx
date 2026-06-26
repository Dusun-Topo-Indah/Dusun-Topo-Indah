"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { FadeIn } from "@/components/ui/fade-in";
import { Calendar, ChevronRight, ChevronLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

// Dummy data using local images to prevent next/image domain errors
const DUMMY_NEWS = [
  {
    id: "1",
    judul: "Pembangunan Irigasi Sektor Timur Telah Selesai",
    tanggal: "DECEMBER 9, 2021",
    ringkasan: "Warga dusun kini dapat menikmati aliran air yang lebih lancar untuk sawah mereka.",
    isi_berita: "",
    url_foto: "/images/hero_bg_desa.png",
    kategori: "INFRASTRUKTUR",
    badgeColor: "bg-pink-500",
  },
  {
    id: "2",
    judul: "Gotong Royong Membersihkan Jalan Utama Dusun",
    tanggal: "DECEMBER 9, 2021",
    ringkasan: "Kegiatan rutin bulanan yang diikuti oleh seluruh warga berjalan dengan lancar dan penuh semangat.",
    isi_berita: "",
    url_foto: "/images/hero_bg_desa_2.png",
    kategori: "SOSIAL",
    badgeColor: "bg-orange-500",
  },
  {
    id: "3",
    judul: "Penyuluhan Pertanian Organik Bersama Dinas",
    tanggal: "DECEMBER 9, 2021",
    ringkasan: "Petani Dusun Topo Indah mendapat pelatihan langsung mengenai pupuk organik dari ahli pertanian.",
    isi_berita: "",
    url_foto: "/images/hero_bg_desa_3.png",
    kategori: "PERTANIAN",
    badgeColor: "bg-blue-500",
  },
  {
    id: "4",
    judul: "Peresmian Balai Warga Baru oleh Kepala Desa",
    tanggal: "DECEMBER 9, 2021",
    ringkasan: "Fasilitas baru ini diharapkan dapat menjadi pusat kegiatan dan musyawarah warga Dusun.",
    isi_berita: "",
    url_foto: "/images/hero_bg_desa.png",
    kategori: "PEMERINTAHAN",
    badgeColor: "bg-green-500",
  },
];

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export function NewsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeNews = DUMMY_NEWS[activeIndex];

  const paginate = (newDirection: number) => {
    let newIndex = activeIndex + newDirection;
    if (newIndex < 0) newIndex = DUMMY_NEWS.length - 1;
    if (newIndex >= DUMMY_NEWS.length) newIndex = 0;
    setActiveIndex(newIndex);
  };

  return (
    <section className="bg-white py-24 md:py-32 relative">
      {/* Background Pattern Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        }}
      />
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Header - Mengikuti style About Section */}
        <FadeIn direction="up" className="mb-10 md:mb-14 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div className="inline-flex flex-col gap-3">
            <h2 className="text-slate-800 text-sm md:text-base font-bold tracking-[0.3em] uppercase">
              Berita & Informasi
            </h2>
            <div className="w-12 md:w-16 h-0.5 md:h-1 bg-primary rounded-full"></div>
          </div>
          <Link href="/berita" className="group hidden md:inline-flex mt-6 md:mt-0 items-center text-primary font-bold hover:text-primary/80 transition-colors">
            Lihat Semua Berita <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </FadeIn>

        {/* Layout Grid Asimetris sesuai referensi */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* KIRI: Featured News (Kotak, gambar full, overlay hitam di bawah) */}
          <FadeIn direction="up" delay={0.2} className="lg:col-span-7 relative min-h-[400px] lg:h-auto w-full overflow-hidden group">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={activeIndex}
                className="absolute inset-0 cursor-grab active:cursor-grabbing"
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={1}
                onDragEnd={(e, { offset, velocity }) => {
                  const swipe = swipePower(offset.x, velocity.x);
                  if (swipe < -swipeConfidenceThreshold) {
                    paginate(1);
                  } else if (swipe > swipeConfidenceThreshold) {
                    paginate(-1);
                  }
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Background Image - Kotak tanpa border radius */}
                <Image
                  src={activeNews.url_foto}
                  alt={activeNews.judul}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority
                />
                
                {/* Gradient Overlay dari referensi (gelap di bawah) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* Konten Text di bawah */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 pointer-events-none">
                  <div className={cn("inline-block px-2 py-1 text-white text-[10px] font-bold uppercase tracking-wider mb-3", activeNews.badgeColor)}>
                    {activeNews.kategori}
                  </div>
                  <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
                    {activeNews.judul}
                  </h3>
                  
                  <div className="flex items-center text-slate-300 text-[11px] font-bold uppercase tracking-wider gap-4">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {activeNews.tanggal}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Nav Arrows */}
            <button 
              onClick={() => paginate(-1)}
              className="absolute cursor-pointer left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => paginate(1)}
              className="absolute cursor-pointer right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 hover:bg-white/30 transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </FadeIn>

          {/* KANAN: List Berita (Tanpa border/shadow, clean list) */}
          <FadeIn direction="right" delay={0.4} className="lg:col-span-5 flex flex-col gap-6 lg:pl-4">
            {DUMMY_NEWS.map((news, idx) => {
              return (
                <div 
                  key={news.id} 
                  className={cn(
                    "group flex gap-4 cursor-pointer transition-all flex-1",
                    activeIndex === idx ? "pointer-events-none" : "hover:opacity-90"
                  )}
                  onClick={() => setActiveIndex(idx)}
                >
                  {/* Thumbnail Image - Persegi panjang / Landscape, Kotak */}
                  <div className="relative w-36 h-24 md:w-48 md:h-32 overflow-hidden flex-shrink-0 bg-slate-100">
                    <Image
                      src={news.url_foto}
                      alt={news.judul}
                      fill
                      className="object-cover"
                      sizes="192px"
                    />
                  </div>

                  {/* Content Right Side */}
                  <div className="flex flex-col py-0">
                    <div className="mb-2">
                      <span className={cn("inline-block px-1.5 py-0.5 text-white text-[10px] font-bold uppercase tracking-wider", news.badgeColor)}>
                        {news.kategori}
                      </span>
                    </div>
                    <h4 className={cn(
                      "text-base md:text-lg font-bold leading-snug line-clamp-2 mb-2 transition-colors",
                      activeIndex === idx ? "text-primary" : "text-slate-900 group-hover:text-primary"
                    )}>
                      {news.judul}
                    </h4>
                    <div className="flex items-center text-[10px] font-bold uppercase text-slate-500 gap-3 tracking-wider">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {news.tanggal}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </FadeIn>

        </div>

        {/* Mobile View All Link */}
        <div className="mt-10 flex md:hidden justify-start">
          <Link href="/berita" className="group inline-flex items-center text-primary font-bold hover:text-primary/80 transition-colors">
            Lihat Semua Berita <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
