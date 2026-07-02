import type { GaleriRow } from "@/types";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "../index";
import { galeriDusun } from "../schema";

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
  const cleanData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updatedData)) {
    if (value !== undefined && key !== "id") {
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
  const categoriesResult = await db
    .selectDistinct({ kategori: galeriDusun.kategori })
    .from(galeriDusun);
  
  const categories = categoriesResult
    .map((r) => r.kategori)
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, "id")) as string[];

  // 2. Build WHERE conditions
  const conditions = [];

  if (args.q) {
    const searchTerm = `%${args.q}%`;
    conditions.push(
      or(
        like(galeriDusun.judul, searchTerm),
        like(galeriDusun.deskripsi, searchTerm),
        like(galeriDusun.kategori, searchTerm)
      )
    );
  }

  if (args.filter && args.filter !== "all") {
    conditions.push(eq(galeriDusun.kategori, args.filter));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 3. Count total matching items
  const countResult = await db
    .select({ value: count() })
    .from(galeriDusun)
    .where(whereClause);
  const totalItems = countResult[0].value;
  const totalPages = Math.ceil(totalItems / args.limit) || 1;
  const currentPage = Math.max(1, Math.min(args.page, totalPages));

  // 4. Fetch paginated data
  const data = await db
    .select()
    .from(galeriDusun)
    .where(whereClause)
    .orderBy(desc(galeriDusun.created_at))
    .limit(args.limit)
    .offset((currentPage - 1) * args.limit);

  const mappedData = data.map((r) => ({
    id: r.id,
    judul: r.judul || "",
    kategori: r.kategori,
    deskripsi: r.deskripsi || "",
    tanggal_upload: r.tanggal_upload,
    url_foto: r.url_foto,
  }));

  return {
    items: mappedData,
    totalItems,
    totalPages,
    page: currentPage,
    categories,
  };
}
