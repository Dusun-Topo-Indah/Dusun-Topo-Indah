import { db } from "../index";
import { pengaduanWarga } from "../schema";
import { and, count, desc, eq, like, or } from "drizzle-orm";
import { cacheTag, cacheLife } from "next/cache";

export type PengaduanRow = typeof pengaduanWarga.$inferSelect;
export type InsertPengaduan = typeof pengaduanWarga.$inferInsert;

export async function getPengaduanList(): Promise<PengaduanRow[]> {
  "use cache";
  cacheTag("pengaduan");
  cacheLife("hours");
  
  try {
    return await db
      .select()
      .from(pengaduanWarga)
      .orderBy(desc(pengaduanWarga.created_at))
      .all();
  } catch (error) {
    console.error("Failed to fetch pengaduan:", error);
    return [];
  }
}

export async function getPengaduanById(id: string): Promise<PengaduanRow | undefined> {
  "use cache";
  cacheTag("pengaduan", `pengaduan-${id}`);
  cacheLife("hours");
  
  try {
    const result = await db
      .select()
      .from(pengaduanWarga)
      .where(eq(pengaduanWarga.id, id))
      .limit(1)
      .all();
      
    return result[0];
  } catch (error) {
    console.error("Failed to fetch pengaduan by id:", error);
    return undefined;
  }
}

export async function insertPengaduan(data: InsertPengaduan): Promise<void> {
  await db.insert(pengaduanWarga).values(data).execute();
}

export async function updatePengaduanStatus(id: string, status: string): Promise<boolean> {
  const result = await db
    .update(pengaduanWarga)
    .set({ status })
    .where(eq(pengaduanWarga.id, id));

  return result.rowsAffected > 0;
}

export async function getPengaduanListing(params: {
  q?: string;
  filter?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const categoriesResult = await db
    .selectDistinct({ kategori: pengaduanWarga.kategori })
    .from(pengaduanWarga);

  const categories = categoriesResult
    .map((r) => r.kategori)
    .filter((c): c is string => !!c)
    .sort((a, b) => a.localeCompare(b, "id"));

  const conditions = [];

  if (params.q) {
    const searchTerm = `%${params.q}%`;
    conditions.push(
      or(
        like(pengaduanWarga.nama_lengkap, searchTerm),
        like(pengaduanWarga.nik, searchTerm),
        like(pengaduanWarga.isi_laporan, searchTerm)
      )
    );
  }

  if (params.filter && params.filter !== "all") {
    conditions.push(eq(pengaduanWarga.kategori, params.filter));
  }

  if (params.status && params.status !== "all") {
    conditions.push(eq(pengaduanWarga.status, params.status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const page = params.page || 1;
  const limit = params.limit || 10;

  const countResult = await db
    .select({ value: count() })
    .from(pengaduanWarga)
    .where(whereClause);
  const totalItems = countResult[0].value;
  const totalPages = Math.ceil(totalItems / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));

  const items = await db
    .select()
    .from(pengaduanWarga)
    .where(whereClause)
    .orderBy(desc(pengaduanWarga.created_at))
    .limit(limit)
    .offset((currentPage - 1) * limit);

  return {
    items,
    page: currentPage,
    totalPages,
    totalItems,
    categories,
  };
}

