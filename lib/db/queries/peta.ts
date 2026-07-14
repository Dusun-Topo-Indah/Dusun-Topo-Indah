import type { FasilitasRow } from "@/types";
import { and, count, eq, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "../index";
import { mapsData } from "../schema";

function mapFasilitasRow(r: typeof mapsData.$inferSelect): FasilitasRow {
  return {
    id: r.id,
    nama_fasum: r.nama_fasum,
    kategori_ikon: r.kategori_ikon || "",
    latitude: r.latitude,
    longitude: r.longitude,
    deskripsi: r.deskripsi || "",
    url_foto: r.url_foto || "",
  };
}

// Pola caching: hasil sukses di-cache "hours"; saat Turso error, fallback di-cache
// "minutes" (conditional cacheLife) agar tidak ter-poison lama & prerender build
// tetap aman. "minutes" bukan "seconds": profil "seconds" dianggap dinamis saat
// prerender di bawah cacheComponents.

export async function getFasilitasList(): Promise<FasilitasRow[]> {
  "use cache";
  cacheTag("fasilitas");

  try {
    const result = await db.select().from(mapsData).orderBy(mapsData.nama_fasum);
    cacheLife("hours");
    return result.map(mapFasilitasRow);
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch fasilitas:", error);
    return [];
  }
}

export async function getFasilitasById(id: string): Promise<FasilitasRow | undefined> {
  const result = await db.select().from(mapsData).where(eq(mapsData.id, id));
  if (result.length === 0) return undefined;
  return mapFasilitasRow(result[0]);
}

export async function appendFasilitas(data: FasilitasRow): Promise<void> {
  await db.insert(mapsData).values({
    id: data.id,
    nama_fasum: data.nama_fasum,
    kategori_ikon: data.kategori_ikon,
    latitude: data.latitude,
    longitude: data.longitude,
    deskripsi: data.deskripsi || "",
    url_foto: data.url_foto || "",
  });
}

export async function updateFasilitasById(id: string, updatedData: Partial<FasilitasRow>): Promise<boolean> {
  const setData: Partial<typeof mapsData.$inferInsert> = {};

  if (updatedData.nama_fasum !== undefined) setData.nama_fasum = updatedData.nama_fasum;
  if (updatedData.kategori_ikon !== undefined) setData.kategori_ikon = updatedData.kategori_ikon;
  if (updatedData.latitude !== undefined) setData.latitude = updatedData.latitude;
  if (updatedData.longitude !== undefined) setData.longitude = updatedData.longitude;
  if (updatedData.deskripsi !== undefined) setData.deskripsi = updatedData.deskripsi;
  if (updatedData.url_foto !== undefined) setData.url_foto = updatedData.url_foto;

  if (Object.keys(setData).length === 0) return false;
  const result = await db.update(mapsData).set(setData).where(eq(mapsData.id, id));
  return result.rowsAffected > 0;
}

export async function deleteFasilitasById(id: string): Promise<boolean> {
  const result = await db.delete(mapsData).where(eq(mapsData.id, id));
  return result.rowsAffected > 0;
}

interface PetaListingArgs {
  q: string;
  filter: string;
  page: number;
  limit: number;
}

export async function getPetaListing(args: PetaListingArgs) {
  const categoriesResult = await db
    .selectDistinct({ kategori: mapsData.kategori_ikon })
    .from(mapsData);

  const categories = categoriesResult
    .map((r) => r.kategori)
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, "id")) as string[];

  const conditions = [];

  if (args.q) {
    const searchTerm = `%${args.q}%`;
    conditions.push(
      or(
        like(mapsData.nama_fasum, searchTerm),
        like(mapsData.deskripsi, searchTerm),
        like(mapsData.kategori_ikon, searchTerm)
      )
    );
  }

  if (args.filter && args.filter !== "all") {
    conditions.push(eq(mapsData.kategori_ikon, args.filter));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const countResult = await db
    .select({ value: count() })
    .from(mapsData)
    .where(whereClause);
  const totalItems = countResult[0].value;
  const totalPages = Math.ceil(totalItems / args.limit) || 1;
  const currentPage = Math.max(1, Math.min(args.page, totalPages));

  const data = await db
    .select()
    .from(mapsData)
    .where(whereClause)
    .orderBy(mapsData.nama_fasum)
    .limit(args.limit)
    .offset((currentPage - 1) * args.limit);

  return {
    items: data.map(mapFasilitasRow),
    totalItems,
    totalPages,
    page: currentPage,
    categories,
  };
}
