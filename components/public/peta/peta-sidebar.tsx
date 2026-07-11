"use client";

import type { FasilitasRow } from "@/types";
import {
  ChevronUp,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { getAllCategories, getCategoryConfig } from "./peta-marker-icon";

interface PetaSidebarProps {
  fasilitas: FasilitasRow[];
  activeCategory: string | null;
  searchQuery: string;
  selectedId: string | null;
  onCategoryChange: (category: string | null) => void;
  onSearchChange: (query: string) => void;
  onSelectFasilitas: (id: string) => void;
}

export function PetaSidebar({
  fasilitas,
  activeCategory,
  searchQuery,
  selectedId,
  onCategoryChange,
  onSearchChange,
  onSelectFasilitas,
}: PetaSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const categories = getAllCategories();

  const filteredFasilitas = useMemo(() => {
    let items = fasilitas;

    if (activeCategory) {
      items = items.filter((f) => f.kategori_ikon === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (f) =>
          f.nama_fasum.toLowerCase().includes(q) ||
          f.deskripsi.toLowerCase().includes(q) ||
          f.kategori_ikon.toLowerCase().includes(q)
      );
    }

    return items;
  }, [fasilitas, activeCategory, searchQuery]);

  const sidebarContent = (
    <>
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          type="text"
          placeholder="Cari fasilitas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-10 pl-10 pr-10 rounded-lg bg-slate-100 border-0 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          id="peta-search-input"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            activeCategory === null
              ? "bg-slate-900 text-white shadow-sm"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
          }`}
        >
          Semua
        </button>
        {categories.map((cat) => {
          const config = getCategoryConfig(cat);
          const count = fasilitas.filter((f) => f.kategori_ikon === cat).length;
          return (
            <button
              key={cat}
              onClick={() =>
                onCategoryChange(activeCategory === cat ? null : cat)
              }
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeCategory === cat
                  ? "text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              style={
                activeCategory === cat
                  ? { background: config.color }
                  : undefined
              }
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: config.color }}
              />
              {config.label}
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      <div className="text-xs text-slate-400 font-medium">
        {filteredFasilitas.length} fasilitas ditemukan
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 -mx-1 px-1 min-h-0">
        {filteredFasilitas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400">
            <MapPin className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">Tidak ada fasilitas</p>
            <p className="text-xs mt-1">Coba ubah filter atau kata kunci</p>
          </div>
        ) : (
          filteredFasilitas.map((item) => {
            const config = getCategoryConfig(item.kategori_ikon);
            const isSelected = selectedId === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectFasilitas(item.id);
                  setIsMobileOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl transition-all group ${
                  isSelected
                    ? "bg-primary/10 ring-1 ring-primary/30"
                    : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${config.color}20` }}
                  >
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ background: config.color }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-slate-900 truncate leading-tight">
                      {item.nama_fasum}
                    </h4>
                    <p className="text-[11px] font-medium mt-0.5" style={{ color: config.color }}>
                      {config.label}
                    </p>
                    {item.deskripsi && (
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {item.deskripsi}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col absolute top-4 left-4 bottom-4 z-10 w-[340px] bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/50 p-4 gap-3 overflow-hidden">
        <div className="flex items-center gap-2 pb-1">
          <MapPin className="h-5 w-5 text-primary" />
          <h2 className="text-base font-bold text-slate-900">Fasilitas Dusun</h2>
        </div>
        {sidebarContent}
      </aside>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 bg-white shadow-lg rounded-full px-5 py-3 flex items-center gap-2 text-sm font-semibold text-slate-700 border border-slate-200/80"
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span>{filteredFasilitas.length} Fasilitas</span>
          <ChevronUp
            className={`h-4 w-4 text-slate-400 transition-transform duration-300 ${
              isMobileOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out flex flex-col ${
            isMobileOpen
              ? "translate-y-0"
              : "translate-y-full"
          }`}
          style={{ maxHeight: "70vh" }}
        >
          {/* Handle */}
          <div className="flex items-center justify-center py-3">
            <div className="w-10 h-1 rounded-full bg-slate-300" />
          </div>
          <div className="flex flex-col gap-3 px-4 pb-6 overflow-hidden flex-1 min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="text-base font-bold text-slate-900">Fasilitas Dusun</h2>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      </div>
    </>
  );
}
