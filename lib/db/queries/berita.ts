import type { BeritaRow } from "@/types";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { db } from "../index";
import { beritaDusun } from "../schema";

export async function getBeritaList(): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita");
  cacheLife("hours");

  try {
    const result = await db.select().from(beritaDusun).orderBy(desc(beritaDusun.created_at));
    return result.map(r => ({
      id: r.id,
      judul: r.judul,
      tanggal: r.tanggal,
      ringkasan: r.ringkasan || "",
      isi_berita: r.isi_berita,
      url_foto: r.url_foto || "",
      kategori: r.kategori || "",
      media_assets: r.media_assets || "",
      status_publikasi: r.status_publikasi || "Publik",
    }));
  } catch (error) {
    console.error("Failed to fetch berita:", error);
    return [];
  }
}

export async function getBeritaById(id: string): Promise<BeritaRow | undefined> {
  const result = await db.select().from(beritaDusun).where(eq(beritaDusun.id, id));
  if (result.length === 0) return undefined;
  const r = result[0];
  return {
    id: r.id,
    judul: r.judul,
    tanggal: r.tanggal,
    ringkasan: r.ringkasan || "",
    isi_berita: r.isi_berita,
    url_foto: r.url_foto || "",
    kategori: r.kategori || "",
    media_assets: r.media_assets || "",
    status_publikasi: r.status_publikasi || "Publik",
  };
}

export async function getRecentBerita(limit = 3): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita", "berita-recent");
  cacheLife("hours");

  try {
    const result = await db.select()
      .from(beritaDusun)
      .where(eq(beritaDusun.status_publikasi, "Publik"))
      .orderBy(desc(beritaDusun.created_at))
      .limit(limit);
    return result.map(r => ({
      id: r.id,
      judul: r.judul,
      tanggal: r.tanggal,
      ringkasan: r.ringkasan || "",
      isi_berita: r.isi_berita,
      url_foto: r.url_foto || "",
      kategori: r.kategori || "",
      media_assets: r.media_assets || "",
      status_publikasi: r.status_publikasi || "Publik",
    }));
  } catch (error) {
    console.error("Failed to fetch recent berita:", error);
    return [];
  }
}

export async function getTotalBerita(): Promise<number> {
  "use cache";
  cacheTag("berita", "berita-total");
  cacheLife("hours");

  try {
    const result = await db.select({ value: count() }).from(beritaDusun);
    return result[0].value;
  } catch (error) {
    console.error("Failed to get total berita:", error);
    return 0;
  }
}

export async function appendBerita(data: BeritaRow): Promise<void> {
  await db.insert(beritaDusun).values({
    id: data.id,
    judul: data.judul,
    tanggal: data.tanggal,
    ringkasan: data.ringkasan || "",
    isi_berita: data.isi_berita,
    url_foto: data.url_foto || "",
    kategori: data.kategori || "",
    media_assets: data.media_assets || "",
    status_publikasi: data.status_publikasi || "Publik",
  });
}

export async function updateBeritaById(id: string, updatedData: Partial<BeritaRow>): Promise<boolean> {
  const cleanData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updatedData)) {
    if (value !== undefined && key !== "id") {
      cleanData[key] = value;
    }
  }
  if (Object.keys(cleanData).length === 0) return false;
  
  const result = await db.update(beritaDusun).set({
    ...cleanData,
    updated_at: new Date().toISOString(),
  }).where(eq(beritaDusun.id, id));
  return result.rowsAffected > 0;
}

export async function deleteBeritaById(id: string): Promise<boolean> {
  const result = await db.delete(beritaDusun).where(eq(beritaDusun.id, id));
  return result.rowsAffected > 0;
}

interface BeritaListingArgs {
  q: string;
  filter: string;
  status?: string;
  page: number;
  limit: number;
}

export async function getBeritaListing(args: BeritaListingArgs) {

  const categoriesResult = await db
    .selectDistinct({ kategori: beritaDusun.kategori })
    .from(beritaDusun);
  
  const categories = categoriesResult
    .map((r) => r.kategori)
    .filter(Boolean)
    .sort((a, b) => a!.localeCompare(b!, "id")) as string[];

  const conditions = [];
  
  if (args.q) {
    const searchTerm = `%${args.q}%`;
    conditions.push(
      or(
        like(beritaDusun.judul, searchTerm),
        like(beritaDusun.ringkasan, searchTerm),
        like(beritaDusun.kategori, searchTerm)
      )
    );
  }

  const isSpecialFilter = args.filter === "all" || args.filter === "with-cover" || args.filter === "without-cover";
  if (isSpecialFilter) {
    if (args.filter === "with-cover") {
      conditions.push(like(beritaDusun.url_foto, "http%")); // Has a URL
    } else if (args.filter === "without-cover") {
      conditions.push(eq(beritaDusun.url_foto, "")); // Empty URL
    }
  } else if (args.filter) {
    conditions.push(eq(beritaDusun.kategori, args.filter));
  }

  const statusFilter = args.status && args.status !== "all" ? args.status : "all";
  if (statusFilter !== "all") {
    conditions.push(eq(beritaDusun.status_publikasi, statusFilter));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // 3. Get total count matching the filter for pagination
  const countResult = await db
    .select({ value: count() })
    .from(beritaDusun)
    .where(whereClause);
  const totalItems = countResult[0].value;
  const totalPages = Math.ceil(totalItems / args.limit) || 1;
  const currentPage = Math.max(1, Math.min(args.page, totalPages));

  // 4. Fetch paginated data
  const data = await db
    .select()
    .from(beritaDusun)
    .where(whereClause)
    .orderBy(desc(beritaDusun.created_at))
    .limit(args.limit)
    .offset((currentPage - 1) * args.limit);

  const mappedData = data.map((r) => ({
    id: r.id,
    judul: r.judul,
    tanggal: r.tanggal,
    ringkasan: r.ringkasan || "",
    isi_berita: r.isi_berita,
    url_foto: r.url_foto || "",
    kategori: r.kategori || "",
    media_assets: r.media_assets || "",
    status_publikasi: r.status_publikasi || "Publik",
  }));

  return {
    items: mappedData,
    totalItems,
    totalPages,
    page: currentPage,
    categories,
  };
}
