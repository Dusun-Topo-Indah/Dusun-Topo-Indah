"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, Plus, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export function GaleriForm({ existingCategories }: { existingCategories: string[] }) {
  const [open, setOpen] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  
  const router = useRouter();

  const allCategories = Array.from(new Set([...existingCategories, ...customCategories]));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      throw new Error("Cloudinary belum dikonfigurasi");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Gagal unggah gambar");
    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !kategori) return;

    setIsLoading(true);
    try {
      // 1. Upload to Cloudinary
      const url_foto = await uploadToCloudinary(file);
      
      // 2. Save to Google Sheets via API
      const res = await fetch("/api/galeri", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kategori, caption, url_foto }),
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan data galeri");
      }

      // Reset
      setOpen(false);
      setFile(null);
      setPreview(null);
      setKategori("");
      setCaption("");
      
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>
        <Plus className="mr-2 h-4 w-4" /> Unggah Foto
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Unggah Foto Galeri</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Pilih Foto</Label>
            <div className="flex items-center justify-center w-full">
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors relative overflow-hidden">
                {preview ? (
                  <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <ImageIcon className="w-8 h-8 mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground"><span className="font-semibold">Klik untuk unggah</span> foto</p>
                  </div>
                )}
                <input id="dropzone-file" type="file" className="hidden" accept="image/*" onChange={handleFileChange} required />
              </label>
            </div>
          </div>

          <div className="space-y-2 flex flex-col">
            <Label>Kategori</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger render={<Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="w-full justify-between" />}>
                {kategori ? kategori : "Pilih atau ketik kategori..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Cari kategori..." 
                    value={search} 
                    onValueChange={setSearch} 
                  />
                  <CommandList>
                    <CommandEmpty>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-sm"
                        onClick={() => {
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

          <Button type="submit" className="w-full" disabled={isLoading || !file || !kategori}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isLoading ? "Mengunggah..." : "Simpan Foto"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
