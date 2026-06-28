import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";
import type { BeritaRow } from "@/types";

interface UseBeritaFormProps {
  initialData?: BeritaRow;
  existingCategories: string[];
}

export function useBeritaForm({ initialData, existingCategories }: UseBeritaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState(initialData?.kategori || "");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const allCategories = Array.from(new Set([...existingCategories, ...customCategories]));

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
    if (!judul || !isiBerita || !kategori) {
      alert("Judul, isi berita, dan kategori wajib diisi.");
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
          kategori: kategori.trim(),
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

  return {
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
  };
}
