import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { FasilitasRow } from "@/types";
import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { petaSchema, type PetaFormValues } from "@/types/forms";

interface UsePetaFormProps {
  existingCategories: string[];
  initialData?: FasilitasRow;
  onSuccess?: () => void;
}

const MAX_IMAGE_SIZE_MB = 4;

export function usePetaForm({ existingCategories, initialData, onSuccess }: UsePetaFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [search, setSearch] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [isPhotoRemoved, setIsPhotoRemoved] = useState(false);

  const mode: "create" | "edit" = initialData ? "edit" : "create";
  const selectedPreview = preview || (isPhotoRemoved ? null : initialData?.url_foto) || null;
  const allCategories = useMemo(
    () => Array.from(new Set([...existingCategories, ...customCategories])),
    [existingCategories, customCategories]
  );

  const form = useForm<PetaFormValues>({
    resolver: zodResolver(petaSchema),
    values: {
      nama_fasum: initialData?.nama_fasum || "",
      kategori_ikon: initialData?.kategori_ikon || "",
      latitude: initialData?.latitude || "",
      longitude: initialData?.longitude || "",
      deskripsi: initialData?.deskripsi || "",
      warna_pin: initialData?.warna_pin || "",
    },
  });

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
      toast.error("Harap unggah file gambar.");
      return;
    }

    if (nextFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 4 MB.");
      return;
    }

    resetPreview();
    setIsPhotoRemoved(false);
    form.setValue("foto", nextFile, { shouldValidate: true });
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
      toast.error("Harap unggah file gambar.");
      return;
    }

    if (droppedFile.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      toast.error("Ukuran gambar maksimal 4 MB.");
      return;
    }

    resetPreview();
    setIsPhotoRemoved(false);
    form.setValue("foto", droppedFile, { shouldValidate: true });
    setPreview(URL.createObjectURL(droppedFile));
  };

  const handleRemovePhoto = () => {
    resetPreview();
    setIsPhotoRemoved(true);
    form.setValue("foto", undefined, { shouldValidate: true });
  };

  const handleCancel = () => {
    form.reset();
    resetPreview();
    router.push("/admin/peta");
  };

  const onSubmit = async (values: PetaFormValues) => {
    setIsLoading(true);
    let uploadedImageUrl = "";

    try {
      let url_foto = initialData?.url_foto || "";
      if (isPhotoRemoved) {
        url_foto = "";
      }
      if (values.foto) {
        url_foto = await uploadToCloudinary(values.foto);
        uploadedImageUrl = url_foto;
      }

      const endpoint = mode === "edit" && initialData ? `/api/fasilitas/${initialData.id}` : "/api/fasilitas";
      const method = mode === "edit" ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama_fasum: values.nama_fasum.trim(),
          kategori_ikon: values.kategori_ikon.trim(),
          latitude: values.latitude.trim(),
          longitude: values.longitude.trim(),
          deskripsi: values.deskripsi?.trim() || "",
          warna_pin: values.warna_pin?.trim() || "",
          url_foto,
        }),
      });

      const data = (await response.json().catch(() => null)) as { message?: string } | null;
      if (!response.ok) {
        throw new Error(data?.message || `Gagal ${mode === "edit" ? "memperbarui" : "menyimpan"} fasilitas.`);
      }

      toast.success(`Fasilitas berhasil ${mode === "edit" ? "diperbarui" : "ditambahkan"}!`);

      if (mode === "create") {
        form.reset();
        resetPreview();
      }

      onSuccess?.();
      router.push("/admin/peta");
      router.refresh();
    } catch (error) {
      console.error(error);
      if (uploadedImageUrl) {
        await deleteUploadedCloudinaryImage(uploadedImageUrl).catch((rollbackError: unknown) => {
          console.error(rollbackError);
        });
      }
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    comboboxOpen,
    setComboboxOpen,
    isDragging,
    search,
    setSearch,
    customCategories,
    setCustomCategories,
    mode,
    selectedPreview,
    allCategories,
    handleFileChange,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRemovePhoto,
    handleCancel,
    onSubmit
  };
}
