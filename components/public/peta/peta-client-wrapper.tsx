"use client";

import type { FasilitasRow } from "@/types";
import { useCallback, useEffect, useState } from "react";
import { PetaMapView } from "./peta-map-view";
import { PetaSidebar } from "./peta-sidebar";

interface PetaClientWrapperProps {
  fasilitas: FasilitasRow[];
}

export function PetaClientWrapper({ fasilitas }: PetaClientWrapperProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const filteredFasilitas = fasilitas.filter((f) => {
    if (activeCategory && f.kategori_ikon !== activeCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !f.nama_fasum.toLowerCase().includes(q) &&
        !f.deskripsi.toLowerCase().includes(q) &&
        !f.kategori_ikon.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const handleMarkerClick = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleSelectFasilitas = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  return (
    <div className="relative h-[calc(100dvh-5rem)] w-full overflow-hidden" style={{ marginTop: "5rem" }}>
      <PetaMapView
        fasilitas={filteredFasilitas}
        selectedId={selectedId}
        onMarkerClick={handleMarkerClick}
      />
      <PetaSidebar
        fasilitas={fasilitas}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        selectedId={selectedId}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
        onSelectFasilitas={handleSelectFasilitas}
      />
    </div>
  );
}
