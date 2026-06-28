import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GaleriRow } from "@/types";
import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";

interface UseGaleriFormProps {
  existingCategories: string[];
  initialData?: GaleriRow;
  onSuccess?: () => void;
}

const MAX_IMAGE_SIZE_MB = 4;

export function useGaleriForm({ existingCategories, initialData, onSuccess }: UseGaleriFormProps) {
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

  const mode: "create" | "edit" = initialData ? "edit" : "create";
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

  return {
    isLoading,
    comboboxOpen,
    setComboboxOpen,
    isDragging,
    search,
    setSearch,
    kategori,
    setKategori,
    customCategories,
    setCustomCategories,
    judul,
    setJudul,
    deskripsi,
    setDeskripsi,
    file,
    mode,
    selectedPreview,
    allCategories,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleSubmit
  };
}
