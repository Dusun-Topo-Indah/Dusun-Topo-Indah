import { db } from "../index";
import { pengaduanWarga } from "../schema";
import { eq, desc } from "drizzle-orm";
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
  await db
    .update(pengaduanWarga)
    .set({ status })
    .where(eq(pengaduanWarga.id, id))
    .execute();
    
  return true;
}

export async function getPengaduanListing(params: {
  q?: string;
  filter?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const allData = await getPengaduanList();
  
  let filtered = allData;
  if (params.q) {
    const q = params.q.toLowerCase();
    filtered = filtered.filter(p => 
      p.nama_lengkap.toLowerCase().includes(q) || 
      p.nik.toLowerCase().includes(q) || 
      p.isi_laporan.toLowerCase().includes(q)
    );
  }
  if (params.filter && params.filter !== "all") {
    filtered = filtered.filter(p => p.kategori === params.filter);
  }
  if (params.status && params.status !== "all") {
    filtered = filtered.filter(p => p.status === params.status);
  }
  
  const page = params.page || 1;
  const limit = params.limit || 10;
  
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);
  
  const categories = Array.from(new Set(allData.map(d => d.kategori).filter((c): c is string => !!c)));
  
  return {
    items,
    page,
    totalPages,
    totalItems,
    categories
  };
}
