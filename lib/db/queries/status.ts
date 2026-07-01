import { db } from "../index";
import { adminAuth } from "../schema";
import { cacheLife, cacheTag } from "next/cache";

export async function checkSystemStatus(): Promise<{ status: "Online" | "Offline"; message: string }> {
  "use cache";
  cacheTag("system-status");
  cacheLife("minutes");
  
  try {
    await db.select().from(adminAuth).limit(1);
    return { status: "Online", message: "Koneksi ke Database Terhubung" };
  } catch (error) {
    console.error("System Status Check Error:", error);
    return { status: "Offline", message: "Koneksi ke Database Terputus" };
  }
}
