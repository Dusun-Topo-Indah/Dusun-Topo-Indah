"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";
import { ImagePlus, Loader2, FileText, Send, Save } from "lucide-react";

import type { BeritaRow } from "@/types";

const RichTextEditor = dynamic(
  () => import("@/components/ui/rich-text-editor").then((mod) => mod.RichTextEditor),
  { ssr: false }
);

interface BeritaFormProps {
  initialData?: BeritaRow;
}

export function BeritaForm({ initialData }: BeritaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [judul, setJudul] = useState(initialData?.judul || "");
  const [ringkasan, setRingkasan] = useState(initialData?.ringkasan || "");
  const [isiBerita, setIsiBerita] = useState(initialData?.isi_berita || "");
  const [foto, setFoto] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const isEdit = !!initialData;

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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type.startsWith("image/")) {
        setFoto(f);
      } else {
        alert("Harap unggah file gambar.");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !isiBerita) {
      alert("Judul dan isi berita wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    let uploadedCoverUrl = "";
    try {
      let urlFoto = initialData?.url_foto || "";
      if (foto) {
        urlFoto = await uploadToCloudinary(foto);
        uploadedCoverUrl = urlFoto;
      }

      const method = isEdit ? "PUT" : "POST";
      const endpoint = isEdit ? `/api/berita/${initialData.id}` : "/api/berita";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul,
          ringkasan,
          isi_berita: isiBerita,
          url_foto: urlFoto,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Gagal ${isEdit ? "memperbarui" : "menyimpan"} berita.`);
      }

      router.push("/admin/berita");
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      if (uploadedCoverUrl) {
        await deleteUploadedCloudinaryImage(uploadedCoverUrl).catch((rollbackError: unknown) => {
          console.error(rollbackError);
        });
      }
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem saat menyimpan berita.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

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

        {/* Naskah Berita */}
        <div className="space-y-2 md:col-span-2">
          <Label className="text-sm font-semibold">
            Naskah Berita <span className="text-red-500 ml-0.5">*</span>
          </Label>
          <div className="border border-input rounded-md overflow-hidden hover:border-slate-400/80 transition-colors focus-within:border-primary focus-within:ring-2 focus-within:ring-primary">
            <RichTextEditor value={isiBerita} onChange={setIsiBerita} />
          </div>
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
