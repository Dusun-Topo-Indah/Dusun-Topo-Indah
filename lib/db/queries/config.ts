import { db } from "../index";
import { globalConfig } from "../schema";
import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

// getGlobalConfig dipakai di footer (layout publik). Hasil sukses di-cache
// "hours"; saat Turso error, fallback {} di-cache "minutes" (conditional
// cacheLife) — tidak dilempar agar layout/situs tidak crash & tidak ter-poison.
// "minutes" (bukan "seconds") penting: profil "seconds" dianggap dinamis saat
// prerender sehingga read di layout yang tanpa <Suspense> menggagalkan build.

export async function getGlobalConfig(): Promise<Record<string, string>> {
  "use cache";
  cacheTag("global-config");

  try {
    const result = await db.select().from(globalConfig);
    const config: Record<string, string> = {};
    for (const row of result) {
      config[row.key] = row.value || "";
    }
    cacheLife("hours");
    return config;
  } catch (error) {
    cacheLife("minutes");
    console.error("Failed to fetch global config:", error);
    return {};
  }
}

export async function updateGlobalConfig(updates: Record<string, string>): Promise<boolean> {
  const entries = Object.entries(updates).map(([key, value]) => ({ key, value }));
  if (entries.length === 0) return true;

  await db.insert(globalConfig)
    .values(entries)
    .onConflictDoUpdate({
      target: globalConfig.key,
      set: { value: sql`excluded.value` }
    });

  return true;
}
