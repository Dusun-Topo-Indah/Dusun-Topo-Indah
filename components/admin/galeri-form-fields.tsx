"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ChevronsUpDown, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import type { GaleriRow } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const [caption, setCaption] = useState(initialData?.caption || "");
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
          kategori: kategori.trim(),
          caption: caption.trim(),
          url_foto,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message || `Gagal ${mode === "edit" ? "memperbarui" : "menyimpan"} galeri.`);
      }

      if (mode === "create") {
        setKategori("");
        setCaption("");
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
    <form onSubmit={handleSubmit} className="grid gap-6 desktop:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Foto Galeri</CardTitle>
          <CardDescription>Unggah atau ganti foto kegiatan yang akan ditampilkan.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Pilih Foto</Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className={cn(
                  "flex min-h-72 w-full flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed bg-background transition-colors relative desktop:min-h-96",
                  isDragging ? "border-primary bg-primary/10" : "bg-muted/50 hover:bg-muted"
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {selectedPreview ? (
                  <Image
                    src={selectedPreview}
                    alt="Preview galeri"
                    fill
                    className="object-contain p-3"
                    unoptimized={selectedPreview.startsWith("blob:")}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
                    <ImageIcon className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Klik untuk unggah</span> foto
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, WEBP, maksimal 4 MB</p>
                  </div>
                )}
                <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Galeri</CardTitle>
            <CardDescription>Lengkapi kategori dan caption foto.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2 flex flex-col">
              <Label>Kategori</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger
                  render={
                    <Button type="button" variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between" />
                  }
                >
                  {kategori ? kategori : "Pilih atau ketik kategori..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Cari kategori..." value={search} onValueChange={setSearch} />
                    <CommandList>
                      <CommandEmpty>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start text-sm"
                          onPointerDown={(event) => {
                            event.preventDefault();
                            setCustomCategories([...customCategories, search]);
                            setKategori(search);
                            setComboboxOpen(false);
                            setSearch("");
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Buat &quot;{search}&quot;
                        </Button>
                      </CommandEmpty>
                      <CommandGroup>
                        {allCategories.map((cat) => (
                          <CommandItem
                            key={cat}
                            value={cat}
                            onSelect={(currentValue) => {
                              setKategori(currentValue === kategori ? "" : currentValue);
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

            <div className="space-y-2">
              <Label>Caption (Opsional)</Label>
              <Textarea
                placeholder="Tulis deskripsi singkat..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button type="submit" className="w-full" disabled={isLoading || !kategori || (mode === "create" && !file)}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? (mode === "edit" ? "Menyimpan..." : "Mengunggah...") : mode === "edit" ? "Simpan Perubahan" : "Simpan Foto"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
