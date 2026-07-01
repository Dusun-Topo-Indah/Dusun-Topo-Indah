import { db } from "../index";
import { globalConfig } from "../schema";
import { sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getGlobalConfig(): Promise<Record<string, string>> {
  "use cache";
  cacheTag("global-config");
  cacheLife("hours");

  try {
    const result = await db.select().from(globalConfig);
    const config: Record<string, string> = {};
    for (const row of result) {
      config[row.key] = row.value || "";
    }
    return config;
  } catch (error) {
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
