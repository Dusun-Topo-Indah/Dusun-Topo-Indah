import { db } from "../index";
import { galeriDusun } from "../schema";
import { eq, count, desc } from "drizzle-orm";
import type { GaleriRow } from "@/types";
import { normalizeText, paginateItems } from "@/lib/listing";
import { cacheLife, cacheTag } from "next/cache";

export async function getGaleriList(): Promise<GaleriRow[]> {
  "use cache";
  cacheTag("galeri");
  cacheLife("hours");

  try {
    const result = await db.select().from(galeriDusun).orderBy(desc(galeriDusun.created_at));
    return result.map(r => ({
      id: r.id,
      judul: r.judul || "",
      kategori: r.kategori,
      deskripsi: r.deskripsi || "",
      tanggal_upload: r.tanggal_upload,
      url_foto: r.url_foto,
    }));
  } catch (error) {
    console.error("Failed to fetch galeri:", error);
    return [];
  }
}

export async function getGaleriById(id: string): Promise<GaleriRow | undefined> {
  const result = await db.select().from(galeriDusun).where(eq(galeriDusun.id, id));
  if (result.length === 0) return undefined;
  const r = result[0];
  return {
    id: r.id,
    judul: r.judul || "",
    kategori: r.kategori,
    deskripsi: r.deskripsi || "",
    tanggal_upload: r.tanggal_upload,
    url_foto: r.url_foto,
  };
}

export async function getTotalGaleri(): Promise<number> {
  "use cache";
  cacheTag("galeri", "galeri-total");
  cacheLife("hours");

  try {
    const result = await db.select({ value: count() }).from(galeriDusun);
    return result[0].value;
  } catch (error) {
    console.error("Failed to get total galeri:", error);
    return 0;
  }
}

export async function appendGaleri(data: GaleriRow): Promise<void> {
  await db.insert(galeriDusun).values({
    id: data.id,
    judul: data.judul,
    kategori: data.kategori,
    deskripsi: data.deskripsi,
    tanggal_upload: data.tanggal_upload,
    url_foto: data.url_foto,
  });
}

export async function updateGaleriById(id: string, updatedData: Partial<GaleriRow>): Promise<boolean> {
  const { id: _id, ...rest } = updatedData;
  const cleanData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    if (value !== undefined) {
      cleanData[key] = value;
    }
  }
  if (Object.keys(cleanData).length === 0) return false;
  const result = await db.update(galeriDusun).set(cleanData).where(eq(galeriDusun.id, id));
  return result.rowsAffected > 0;
}

export async function deleteGaleriById(id: string): Promise<boolean> {
  const result = await db.delete(galeriDusun).where(eq(galeriDusun.id, id));
  return result.rowsAffected > 0;
}

interface GaleriListingArgs {
  q: string;
  filter: string;
  page: number;
  limit: number;
}

export async function getGaleriListing(args: GaleriListingArgs) {
  const galeriList = await getGaleriList();
  const query = normalizeText(args.q);
  const categoryFilter = normalizeText(args.filter);
  const categories = Array.from(new Set(galeriList.map((item) => item.kategori).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "id")
  );

  const filtered = galeriList.filter((item) => {
    const searchable = normalizeText(`${item.judul} ${item.kategori} ${item.deskripsi}`);
    const matchesSearch = query === "" || searchable.includes(query);
    const matchesFilter = categoryFilter === "all" || normalizeText(item.kategori) === categoryFilter;
    return matchesSearch && matchesFilter;
  });

  const paginated = paginateItems(filtered, args.page, args.limit);
  return {
    ...paginated,
    categories,
  };
}
