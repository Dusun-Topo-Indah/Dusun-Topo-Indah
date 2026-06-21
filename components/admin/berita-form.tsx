"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import dynamic from "next/dynamic";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { ImagePlus, Loader2, FileText, Send, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const isEdit = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!judul || !isiBerita) {
      alert("Judul dan isi berita wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    try {
      let urlFoto = initialData?.url_foto || "";
      if (foto) {
        urlFoto = await uploadToCloudinary(foto);
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
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan sistem saat menyimpan berita.";
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Konten Artikel</CardTitle>
            <CardDescription>Isi detail judul dan naskah berita di sini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="judul" className="text-base">Judul Berita <span className="text-red-500">*</span></Label>
              <Input
                id="judul"
                className="text-lg py-6"
                placeholder="Contoh: Kerja Bakti Massal Sambut HUT RI"
                value={judul}
                onChange={(e) => setJudul(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-base">Naskah Berita <span className="text-red-500">*</span></Label>
              <RichTextEditor value={isiBerita} onChange={setIsiBerita} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan & Kover</CardTitle>
            <CardDescription>Informasi pendukung artikel.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="ringkasan">Ringkasan Singkat</Label>
              <Textarea
                id="ringkasan"
                placeholder="Tulis 1-2 kalimat untuk pratinjau di beranda..."
                className="resize-none"
                rows={3}
                value={ringkasan}
                onChange={(e) => setRingkasan(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground">Maksimal 150 karakter direkomendasikan.</p>
            </div>

            <div className="space-y-2 pt-2 border-t">
              <Label>Foto Kover</Label>
              <div className="relative group">
                <label htmlFor="foto" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer bg-muted/20 hover:bg-muted/50 overflow-hidden transition-colors">
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
                        <ImagePlus className="w-8 h-8 text-foreground mb-2 shadow-sm" />
                        <p className="text-sm text-foreground font-semibold drop-shadow-md">Ganti Gambar</p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 z-10 relative">
                      <ImagePlus className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                      <p className="text-sm text-muted-foreground"><span className="font-semibold text-primary">Klik untuk unggah</span></p>
                      <p className="text-xs text-muted-foreground mt-1">Rekomendasi: 1200x630 (Max 4MB)</p>
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
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <Button type="submit" disabled={isSubmitting} className="w-full text-base py-6">
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
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
