import { db } from "../index";
import { beritaDusun } from "../schema";
import { eq, count, desc } from "drizzle-orm";
import type { BeritaRow } from "@/types";
import { normalizeText, stripHtml, paginateItems } from "@/lib/listing";
import { cacheLife, cacheTag } from "next/cache";

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
  const result = await db.update(beritaDusun).set({
    ...updatedData,
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
  const allBerita = await getBeritaList();
  const query = normalizeText(args.q);
  const categoryFilter = normalizeText(args.filter);
  const categories = Array.from(new Set(allBerita.map((item) => item.kategori).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "id")
  );

  const filtered = allBerita.filter((item) => {
    const searchable = normalizeText(`${item.judul} ${item.ringkasan} ${stripHtml(item.isi_berita)} ${item.kategori}`);
    const matchesSearch = query === "" || searchable.includes(query);
    const hasCover = Boolean(item.url_foto);
    const isSpecialFilter = args.filter === "all" || args.filter === "with-cover" || args.filter === "without-cover";
    
    let matchesFilter = true;
    if (isSpecialFilter) {
      matchesFilter = 
        args.filter === "all" ||
        (args.filter === "with-cover" && hasCover) ||
        (args.filter === "without-cover" && !hasCover);
    } else {
      matchesFilter = normalizeText(item.kategori) === categoryFilter;
    }
    
    const statusFilter = args.status && args.status !== "all" ? args.status : "all";
    const matchesStatus = statusFilter === "all" || item.status_publikasi === statusFilter;
    
    return matchesSearch && matchesFilter && matchesStatus;
  });

  const paginated = paginateItems(filtered, args.page, args.limit);
  return {
    ...paginated,
    categories,
  };
}
