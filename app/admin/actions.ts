"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function refreshStorageCache() {
  revalidateTag("cloudinary-storage", "max");
  revalidatePath("/admin");
}
