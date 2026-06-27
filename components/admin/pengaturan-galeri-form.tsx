"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PengaturanGaleriFormProps {
  globalConfig: Record<string, string>;
}

export function PengaturanGaleriForm({ globalConfig }: PengaturanGaleriFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [headerTitle, setHeaderTitle] = useState(globalConfig["galeri_header_title"] || "Galeri & Dokumentasi");
  const [headerDesc, setHeaderDesc] = useState(globalConfig["galeri_header_desc"] || "Koleksi foto dan dokumentasi visual berbagai kegiatan, keindahan alam, serta momen penting di Dusun Topo Indah.");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        galeri_header_title: headerTitle,
        galeri_header_desc: headerDesc,
      };

      const res = await fetch("/api/pengaturan-galeri", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal menyimpan pengaturan");

      toast.success("Pengaturan halaman galeri berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl pb-20 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Header Galeri</CardTitle>
          <CardDescription>
            Teks yang akan muncul di bagian paling atas halaman Galeri publik.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="headerTitle">Judul Header</Label>
            <Input
              id="headerTitle"
              value={headerTitle}
              onChange={(e) => setHeaderTitle(e.target.value)}
              placeholder="Contoh: Galeri & Dokumentasi"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="headerDesc">Deskripsi Header</Label>
            <Textarea
              id="headerDesc"
              value={headerDesc}
              onChange={(e) => setHeaderDesc(e.target.value)}
              placeholder="Contoh: Koleksi foto dan dokumentasi visual..."
              rows={3}
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={isSubmitting} className="min-w-32">
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Simpan Perubahan
        </Button>
      </div>
    </form>
  );
}
