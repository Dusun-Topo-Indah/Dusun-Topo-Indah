"use client";

import { FadeIn } from "@/components/ui/fade-in";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface BeritaItem {
  id: string;
  title: string;
  summary: string;
  date: string;
  image: string;
  category: string;
}

interface BeritaLayoutProps {
  items: BeritaItem[];
  categories: string[];
}

export function BeritaLayout({ items, categories }: BeritaLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [activeYear, setActiveYear] = useState("Semua Tahun");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 4;


  const uniqueYears = Array.from(
    new Set(items.map(item => item.date.split(" ").pop() || ""))
  ).filter(Boolean).sort((a, b) => Number(b) - Number(a));

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Semua" || item.category === activeCategory;
    const itemYear = item.date.split(" ").pop() || "";
    const matchesYear = activeYear === "Semua Tahun" || itemYear === activeYear;
    return matchesSearch && matchesCategory && matchesYear;
  });

  const isSearching = searchQuery.length > 0 || activeCategory !== "Semua" || activeYear !== "Semua Tahun";
  
  const highlightItem = !isSearching && currentPage === 1 && items.length > 0 ? filteredItems[0] : null;
  const listItemsBase = highlightItem && currentPage === 1 ? filteredItems.slice(1) : filteredItems;
  
  const totalPages = Math.max(1, Math.ceil(listItemsBase.length / ITEMS_PER_PAGE));
  const currentListItems = listItemsBase.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const popularItems = items.slice(0, 4);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-20">
      {highlightItem && (
        <FadeIn direction="up" className="mb-4 md:mb-8">
          <Link href={`/berita/${highlightItem.id}`} className="group flex flex-col md:flex-row gap-8 items-start border-b border-slate-200 pb-16 md:pb-24">
            <div className="w-full md:w-[65%] aspect-video relative overflow-hidden bg-slate-100">
              <Image 
                src={highlightItem.image} 
                alt={highlightItem.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
            </div>
            <div className="w-full md:w-[35%] flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-primary text-slate-900 text-xs font-bold uppercase tracking-wider">
                  {highlightItem.category.toUpperCase()}
                </span>
                <span className="flex items-center text-slate-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1.5" />
                  {highlightItem.date}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 leading-tight mb-6 group-hover:text-primary transition-colors">
                {highlightItem.title}
              </h2>
              <p className="text-slate-600 text-lg mb-3 line-clamp-4 leading-relaxed">
                {highlightItem.summary}
              </p>
              <div className="inline-flex items-center text-slate-900 font-bold pb-1 self-start group-hover:gap-2 transition-all">
                BACA SELENGKAPNYA <ChevronRight className="w-5 h-5 ml-1 text-primary" />
              </div>
            </div>
          </Link>
        </FadeIn>
      )}

      {/* Search and Year Filter Bar */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-12 md:mb-16 md:border-b border-slate-200 md:pb-8">
        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <Input
            type="text" 
            placeholder="Cari berita..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
          <button className="absolute right-0 top-0 bottom-0 px-4 text-primary bg-transparent hover:bg-primary hover:text-slate-900 transition-colors rounded-r-md cursor-pointer">
            <Search className="w-5 h-5" />
          </button>
        </div>

        {/* Year Filter */}
        <div className="w-full sm:w-48">
          <Select value={activeYear} onValueChange={(val) => { setActiveYear(val || "Semua Tahun"); setCurrentPage(1); }}>
            <SelectTrigger className="w-full h-[50px] bg-white border border-slate-200 rounded-none focus:ring-0 focus:ring-offset-0 focus:border-primary text-slate-700 transition-colors rounded-md">
              <SelectValue placeholder="Semua Tahun" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-slate-200">
              <SelectItem value="Semua Tahun">Semua Tahun</SelectItem>
              {uniqueYears.map(year => (
                <SelectItem key={year} value={year}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
        
        {/* Left Column (Main List) */}
        <div className="w-full lg:w-[70%] order-2 lg:order-1">
          {isSearching && (
            <div className="mb-8 pb-4 border-b border-slate-200 flex justify-between items-end">
              <h3 className="text-2xl font-bold text-slate-900">
                {searchQuery ? `Pencarian: "${searchQuery}"` : `Kategori: ${activeCategory}`}
              </h3>
              <span className="text-slate-500">{filteredItems.length} berita</span>
            </div>
          )}

          {currentListItems.length > 0 ? (
            <div className="flex flex-col gap-10">
              {currentListItems.map((item, index) => (
                <FadeIn key={item.id} direction="up" delay={index * 0.1}>
                  <Link href={`/berita/${item.id}`} className="group flex flex-col sm:flex-row gap-6 items-start pb-10 border-b border-slate-100">
                    <div className="w-full sm:w-[40%] aspect-[4/3] relative overflow-hidden bg-slate-100 flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="w-full sm:w-[60%] flex flex-col py-2">
                      <span className="bg-primary text-slate-900 px-2.5 py-1 inline-block w-fit text-xs font-bold uppercase tracking-wider mb-3">
                        {item.category.toUpperCase()}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-900 leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {item.title}
                      </h3>
                      <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                        {item.summary}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full mt-auto gap-4 sm:gap-0 pt-2">
                        <span className="flex items-center text-slate-500 text-sm font-medium">
                          <Calendar className="w-4 h-4 mr-1.5" />
                          {item.date}
                        </span>
                        <div className="inline-flex items-center text-slate-900 text-sm font-bold group-hover:text-primary group-hover:gap-1.5 transition-all">
                          BACA SELENGKAPNYA <ChevronRight className="w-4 h-4 ml-1" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </FadeIn>
              ))}
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12 border-t border-slate-100 pt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(1)} 
                    disabled={currentPage === 1}
                    className="hidden sm:flex px-3"
                    title="Halaman Pertama"
                  >
                    <ChevronsLeft className="w-4 h-4 mr-1" />
                    First
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
                    disabled={currentPage === 1}
                    className="px-3"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Prev
                  </Button>
                  
                  <div className="flex items-center gap-1 mx-2">
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNum = i + 1;
                      if (pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)) {
                        return (
                          <Button
                            key={i}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            onClick={() => setCurrentPage(pageNum)}
                            className="w-10 h-10 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={i} className="text-slate-400 px-1">...</span>;
                      }
                      return null;
                    })}
                  </div>

                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
                    disabled={currentPage === totalPages}
                    className="px-3"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setCurrentPage(totalPages)} 
                    disabled={currentPage === totalPages}
                    className="hidden sm:flex px-3"
                    title="Halaman Terakhir"
                  >
                    Last
                    <ChevronsRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          ) : items.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Belum Ada Berita</h3>
              <p className="text-slate-500">Saat ini belum ada berita atau pengumuman yang ditambahkan.</p>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center border border-dashed border-slate-200">
              <div className="w-16 h-16 bg-slate-50 flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Berita tidak ditemukan</h3>
              <p className="text-slate-500">Silakan gunakan kata kunci lain atau pilih kategori berbeda.</p>
              <Button
                onClick={() => { setSearchQuery(""); setActiveCategory("Semua"); setActiveYear("Semua Tahun"); setCurrentPage(1); }}
                className="mt-4"
                >
                Tampilkan Semua Berita
              </Button>
            </div>
          )}
        </div>

        {/* Right Column (Sidebar) */}
        <div className="w-full lg:w-[30%] flex flex-col gap-12 order-1 lg:order-2">
          
          {/* Categories */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider pb-2 border-b-2 border-primary inline-block">Kategori</h4>
            <ul className="flex flex-col">
              <li 
                className={`cursor-pointer py-3 border-b border-slate-100 transition-colors flex justify-between items-center group ${activeCategory === "Semua" ? "text-primary font-bold" : "text-slate-600 hover:text-primary"}`}
                onClick={() => { setActiveCategory("Semua"); setCurrentPage(1); }}
              >
                <span>SEMUA BERITA</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === "Semua" ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
              </li>
              {categories.map(cat => (
                <li 
                  key={cat}
                  className={`cursor-pointer py-3 border-b border-slate-100 transition-colors flex justify-between items-center group ${activeCategory === cat ? "text-primary font-bold" : "text-slate-600 hover:text-primary"}`}
                  onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
                >
                  <span>{cat.toUpperCase()}</span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeCategory === cat ? "translate-x-0" : "-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0"}`} />
                </li>
              ))}
            </ul>
          </div>

          {/* Popular News */}
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-6 uppercase tracking-wider pb-2 border-b-2 border-primary inline-block">Berita Terbaru</h4>
            <div className="flex flex-col gap-6">
              {popularItems.map((item) => (
                <Link href={`/berita/${item.id}`} key={`pop-${item.id}`} className="group flex gap-4 items-start">
                  <div className="w-24 h-24 relative overflow-hidden bg-slate-100 flex-shrink-0">
                    <Image src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col">
                    <h5 className="font-bold text-slate-900 leading-snug group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {item.title}
                    </h5>
                    <span className="text-xs text-slate-500 font-medium flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {item.date}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
