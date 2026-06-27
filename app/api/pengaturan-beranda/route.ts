import { verifyAdminSession } from "@/lib/auth";
import { updateGlobalConfig } from "@/lib/google-sheets";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }
    const data = await request.json();
    
    if (typeof data !== "object" || data === null) {
      return NextResponse.json({ error: "Format data tidak valid" }, { status: 400 });
    }
    
    const allowedKeys = [
      "beranda_hero_slides",
      "beranda_tentang_narasi",
      "beranda_tentang_penduduk",
      "beranda_tentang_rw",
      "beranda_tentang_rt",
      "beranda_galeri_ids",
    ];
    
    const updates: Record<string, string> = {};
    for (const key of allowedKeys) {
      if (typeof data[key] === "string") {
        updates[key] = data[key];
      }
    }
    
    if (Object.keys(updates).length > 0) {
      await updateGlobalConfig(updates);
      revalidateTag("global-config", "max");
      revalidateTag("galeri", "max"); 
    }
    
    return NextResponse.json({ success: true, message: "Pengaturan beranda berhasil diperbarui" });
  } catch (error) {
    console.error("Failed to update pengaturan beranda:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui pengaturan" },
      { status: 500 }
    );
  }
}
