import { deleteUploadedCloudinaryImage, uploadToCloudinary } from "@/lib/cloudinary-client";
import type { BeritaRow } from "@/types";
import { beritaSchema, type BeritaFormValues } from "@/types/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface UseBeritaFormProps {
  initialData?: BeritaRow;
  existingCategories: string[];
}

export function useBeritaForm({ initialData, existingCategories }: UseBeritaFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [customCategories, setCustomCategories] = useState<string[]>([]);
  const allCategories = Array.from(new Set([...existingCategories, ...customCategories]));
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedInThisSession, setUploadedInThisSession] = useState<string[]>([]);

  const isEdit = !!initialData;

  let initialMediaAssets: string[] = [];
  if (initialData?.media_assets) {
    try {
      initialMediaAssets = JSON.parse(initialData.media_assets);
      if (!Array.isArray(initialMediaAssets)) initialMediaAssets = [];
    } catch {
      initialMediaAssets = [];
    }
  }
  const [mediaAssets, setMediaAssets] = useState<string[]>(initialMediaAssets);

  const form = useForm<BeritaFormValues>({
    resolver: zodResolver(beritaSchema),
    values: {
      judul: initialData?.judul || "",
      kategori: initialData?.kategori || "",
      ringkasan: initialData?.ringkasan || "",
      isi_berita: initialData?.isi_berita || "",
      status_publikasi: (initialData?.status_publikasi as BeritaFormValues["status_publikasi"]) || "Publik",
    },
  });

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty || uploadedInThisSession.length > 0) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty, uploadedInThisSession]);

  const handleMediaUploadSuccess = (url: string) => {
    setUploadedInThisSession((prev) => [...prev, url]);
  };

  const handleCancel = async () => {
    if (uploadedInThisSession.length > 0) {
      toast.info("Menghapus media sementara...");
      await Promise.allSettled(uploadedInThisSession.map(url => deleteUploadedCloudinaryImage(url)));
    }
    form.reset();
    setMediaAssets([]);
    setUploadedInThisSession([]);
    router.push("/admin/berita");
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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      if (f.type.startsWith("image/")) {
        form.setValue("foto", f, { shouldValidate: true });
      } else {
        toast.error("Harap unggah file gambar.");
      }
    }
  };

  const onSubmit = async (values: BeritaFormValues) => {
    setIsSubmitting(true);
    let uploadedCoverUrl = "";
    try {
      let urlFoto = initialData?.url_foto || "";
      if (values.foto) {
        urlFoto = await uploadToCloudinary(values.foto);
        uploadedCoverUrl = urlFoto;
      }

      if (!isEdit && !urlFoto) {
        toast.error("Harap unggah gambar sampul untuk berita baru.");
        setIsSubmitting(false);
        return;
      }

      const method = isEdit ? "PUT" : "POST";
      const endpoint = isEdit ? `/api/berita/${initialData.id}` : "/api/berita";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: values.judul,
          ringkasan: values.ringkasan,
          isi_berita: values.isi_berita,
          url_foto: urlFoto,
          kategori: values.kategori.trim(),
          media_assets: JSON.stringify(mediaAssets),
          status_publikasi: values.status_publikasi || "Publik",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || `Gagal ${isEdit ? "memperbarui" : "menyimpan"} berita.`);
      }

      // Bersihkan tracking karena sudah disave
      setUploadedInThisSession([]);
      
      toast.success(`Berita berhasil ${isEdit ? "diperbarui" : "disimpan"}!`);
      
      form.reset();
      setMediaAssets([]);
      setUploadedInThisSession([]);

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
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    isSubmitting,
    comboboxOpen,
    setComboboxOpen,
    search,
    setSearch,
    customCategories,
    setCustomCategories,
    allCategories,
    isDragging,
    isEdit,
    mediaAssets,
    setMediaAssets,
    handleMediaUploadSuccess,
    handleCancel,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    onSubmit,
  };
}
