"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ChevronsUpDown, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import type { GaleriRow } from "@/types";
import { Button } from "@/components/ui/button";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";

interface GaleriFormFieldsProps {
  existingCategories: string[];
  initialData?: GaleriRow;
  onSuccess?: () => void;
}

type GaleriFormMode = "create" | "edit";

const MAX_IMAGE_SIZE_MB = 4;

export function GaleriFormFields({ existingCategories, initialData, onSuccess }: GaleriFormFieldsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState(initialData?.kategori || "");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [judul, setJudul] = useState(initialData?.judul || "");
  const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || "");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const mode: GaleriFormMode = initialData ? "edit" : "create";
  const selectedPreview = preview || initialData?.url_foto || null;
  const allCategories = useMemo(
    () => Array.from(new Set([...existingCategories, ...customCategories])),
    [existingCategories, customCategories]
  );

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const resetPreview = () => {
    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = e.target.files?.[0];
    if (!nextFile) return;

    if (!nextFile.type.startsWith("image/")) {
      alert("Harap unggah file gambar.");
      return;
    }

    if (nextFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      alert("Ukuran gambar maksimal 4 MB.");
      return;
    }

    resetPreview();
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (!droppedFile) return;

    if (!droppedFile.type.startsWith("image/")) {
      alert("Harap unggah file gambar.");
      return;
    }

    if (droppedFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      alert("Ukuran gambar maksimal 4 MB.");
      return;
    }

    resetPreview();
    setFile(droppedFile);
    setPreview(URL.createObjectURL(droppedFile));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!kategori.trim()) {
      alert("Kategori wajib diisi.");
      return;
    }

    if (mode === "create" && !file) {
      alert("Harap unggah foto terlebih dahulu.");
      return;
    }

    setIsLoading(true);
    let uploadedImageUrl = "";

    try {
      let url_foto = initialData?.url_foto || "";
      if (file) {
        url_foto = await uploadToCloudinary(file);
        uploadedImageUrl = url_foto;
      }

      const endpoint = mode === "edit" && initialData ? `/api/galeri/${initialData.id}` : "/api/galeri";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: judul.trim(),
          kategori: kategori.trim(),
          deskripsi: deskripsi.trim(),
          url_foto,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message || `Gagal ${mode === "edit" ? "memperbarui" : "menyimpan"} galeri.`);
      }

      if (mode === "create") {
        setJudul("");
        setKategori("");
        setDeskripsi("");
        setFile(null);
        resetPreview();
      }

      onSuccess?.();
      router.refresh();
    } catch (error) {
      console.error(error);
      if (uploadedImageUrl) {
        await deleteUploadedCloudinaryImage(uploadedImageUrl).catch((rollbackError: unknown) => {
          console.error(rollbackError);
        });
      }
      alert(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-10 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        
        {/* Foto Galeri */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold">
            Foto Galeri <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <div className="relative group mt-1">
            <label
              htmlFor="dropzone-file"
              className={cn(
                "flex flex-col items-center justify-center w-full h-40 border border-dashed rounded-md cursor-pointer overflow-hidden transition-all relative",
                isDragging ? "border-primary bg-primary/5" : "border-slate-300 bg-transparent hover:border-slate-400/80 hover:bg-slate-50"
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              {selectedPreview ? (
                <>
                  <Image
                    src={selectedPreview}
                    alt="Preview galeri"
                    fill
                    className="object-cover opacity-40 group-hover:opacity-20 transition-opacity"
                    unoptimized={selectedPreview.startsWith("blob:")}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                  <div className="relative z-10 flex flex-col items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-foreground mb-2" />
                    <p className="text-sm text-foreground font-semibold">Ganti Gambar</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-4 text-center z-10 relative">
                  <div className="flex gap-4 items-center mb-3 text-slate-500">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <p className="text-[13px] text-slate-500">Geser & Lepas berkas disini</p>
                </div>
              )}
              <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
            </label>
          </div>
        </div>

        {/* Judul Foto */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold">Judul Foto <span className="text-red-500 ml-0.5">*</span></Label>
          <input
            type="text"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Contoh: KEINDAHAN ALAM"
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
                <Button type="button" variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between h-14 font-normal" />
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

        {/* Deskripsi */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold">Deskripsi (Opsional)</Label>
          <Textarea
            placeholder="Tulis deskripsi singkat..."
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            className="resize-none min-h-[100px]"
          />
        </div>

      </div>

      <div className="pt-4 flex md:col-span-2">
        <Button type="submit" className="w-full text-base h-14" disabled={isLoading || !kategori || (mode === "create" && !file)}>
          {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
          {isLoading ? (mode === "edit" ? "Menyimpan..." : "Mengunggah...") : mode === "edit" ? "Simpan Perubahan" : "Simpan Foto"}
        </Button>
      </div>
    </form>
  );
}
