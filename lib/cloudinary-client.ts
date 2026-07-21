const CLOUDINARY_UPLOAD_ENDPOINT = "https://api.cloudinary.com/v1_1";
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

interface CloudinaryUploadSuccessResponse {
  secure_url?: string;
}

interface CloudinaryUploadErrorResponse {
  error?: {
    message?: string;
  };
}

async function readCloudinaryError(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    const errorData = (await response.json()) as CloudinaryUploadErrorResponse;
    return errorData.error?.message || "Gagal mengunggah gambar ke Cloudinary";
  }

  return "Gagal mengunggah gambar ke Cloudinary";
}

export async function uploadToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Konfigurasi Cloudinary belum diset di .env");
  }

  if (!file.type.startsWith("image/") && !file.name.endsWith(".glb") && !file.name.endsWith(".gltf")) {
    throw new Error("File yang diunggah harus berupa gambar atau model 3D (.glb/.gltf).");
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("Ukuran file maksimal 10 MB.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`${CLOUDINARY_UPLOAD_ENDPOINT}/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(await readCloudinaryError(response));
  }

  const data = (await response.json()) as CloudinaryUploadSuccessResponse;
  if (!data.secure_url) {
    throw new Error("Cloudinary tidak mengembalikan URL gambar.");
  }

  return data.secure_url;
}

export async function deleteUploadedCloudinaryImage(secureUrl: string): Promise<void> {
  if (!secureUrl || !secureUrl.includes("cloudinary.com")) {
    return;
  }

  const response = await fetch("/api/cloudinary/delete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ secure_url: secureUrl }),
  });

  if (!response.ok) {
    throw new Error("Gagal menghapus file sementara dari Cloudinary.");
  }
}
