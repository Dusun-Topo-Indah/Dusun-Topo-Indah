"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, ImagePlus, Loader2, Save, Send, Check, ChevronsUpDown, Plus } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import type { BeritaRow } from "@/types";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  { ssr: false }
);

import { useBeritaForm } from "@/hooks/admin/use-berita-form";

interface BeritaFormProps {
  initialData?: BeritaRow;
  existingCategories: string[];
}

export function BeritaForm({ initialData, existingCategories }: BeritaFormProps) {
  const {
    isSubmitting,
    comboboxOpen,
    setComboboxOpen,
    search,
    setSearch,
    kategori,
    setKategori,
    customCategories,
    setCustomCategories,
    allCategories,
    judul,
    setJudul,
    ringkasan,
    setRingkasan,
    isiBerita,
    setIsiBerita,
    foto,
    setFoto,
    isDragging,
    isEdit,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit,
  } = useBeritaForm({ initialData, existingCategories });

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Judul Berita */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="judul" className="text-sm font-semibold">
            Judul Berita <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Input
            id="judul"
            placeholder="Contoh: Kerja Bakti Massal Sambut HUT RI"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            required
          />
        </div>

        {/* Kategori */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold">
            Kategori <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger
              render={
                <Button type="button" variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between h-11 font-normal bg-background" />
              }
            >
              {kategori ? kategori : "Pilih atau ketik kategori..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </PopoverTrigger>
            <PopoverContent className="w-(--anchor-width) p-0" align="start">
              <Command>
                <CommandInput placeholder="Cari kategori..." value={search} onValueChange={(val) => setSearch(val.toUpperCase())} />
                <CommandList>
                  <CommandEmpty>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start text-sm"
                      onPointerDown={(event) => {
                        event.preventDefault();
                        const newCat = search.trim().toUpperCase();
                        if (!customCategories.includes(newCat) && !existingCategories.includes(newCat)) {
                          setCustomCategories([...customCategories, newCat]);
                        }
                        setKategori(newCat);
                        setComboboxOpen(false);
                        setSearch("");
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Buat &quot;{search.trim().toUpperCase()}&quot;
                    </Button>
                  </CommandEmpty>
                  <CommandGroup>
                    {allCategories.map((cat) => (
                      <CommandItem
                        key={cat}
                        value={cat}
                        onSelect={() => {
                          setKategori(kategori === cat ? "" : cat);
                          setComboboxOpen(false);
                          setSearch("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            kategori.toLowerCase() === cat.toLowerCase() ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {cat}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Ringkasan Singkat */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="ringkasan" className="text-sm font-semibold">Ringkasan Singkat</Label>
          <Textarea
            id="ringkasan"
            placeholder="Tulis 1-2 kalimat untuk pratinjau di beranda..."
            className="resize-none min-h-[100px]"
            rows={3}
            value={ringkasan}
            onChange={(e) => setRingkasan(e.target.value)}
          />
          <p className="text-[11px] text-muted-foreground mt-1">Maksimal 150 karakter direkomendasikan.</p>
        </div>


        {/* Foto Kover */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold">Gambar Sampul</Label>
          <div className="relative group mt-1">
            <label 
              htmlFor="foto" 
              className={`flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-md cursor-pointer overflow-hidden transition-all ${
                isDragging 
                  ? "border-primary bg-primary/5" 
                  : "border-slate-300 bg-transparent hover:border-slate-400/80 hover:bg-slate-50"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {foto ? (
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center z-10 relative">
                  <FileText className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{foto.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{(foto.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : initialData?.url_foto ? (
                <>
                  <Image 
                    src={initialData.url_foto} 
                    alt="Current Cover" 
                    fill 
                    className="object-cover opacity-40 group-hover:opacity-20 transition-opacity" 
                    sizes="300px" 
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <ImagePlus className="w-6 h-6 text-foreground mb-2" />
                    <p className="text-sm text-foreground font-semibold">Ganti Gambar</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 z-10 relative text-center">
                  <div className="flex gap-4 items-center mb-3 text-slate-500">
                    <ImagePlus className="w-5 h-5" />
                  </div>
                  <p className="text-[13px] text-slate-500">Geser & Lepas berkas disini</p>
                </div>
              )}
              <Input
                id="foto"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setFoto(e.target.files?.[0] || null)}
              />
            </label>
          </div>
        </div>


        {/* Naskah Berita */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold">
            Naskah Berita <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <div className="border border-input rounded-md overflow-hidden hover:border-slate-400/80 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
            <RichTextEditor value={isiBerita} onChange={setIsiBerita} />
          </div>
        </div>
      </div>

      <div className="pt-4 flex md:col-span-2">
        <Button type="submit" disabled={isSubmitting} className="w-full text-base h-14">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {isEdit ? "Menyimpan..." : "Menerbitkan..."}
            </>
          ) : isEdit ? (
            <>
              <Save className="mr-2 h-5 w-5" />
              Simpan Perubahan
            </>
          ) : (
            <>
              <Send className="mr-2 h-5 w-5" />
              Terbitkan Berita
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
