import { verifyAdminSession } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { getGlobalConfig, updateGlobalConfig } from "@/lib/google-sheets";
import { revalidatePath, revalidateTag } from "next/cache";
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
      "profil_header_title",
      "profil_header_desc",
      "profil_sections",
      "profil_visi",
      "profil_misi",
    ];
    
    const updates: Record<string, string> = {};
    for (const key of allowedKeys) {
      if (typeof data[key] === "string") {
        updates[key] = data[key];
      }
    }
    
    if (Object.keys(updates).length > 0) {
      const urlsToDelete: string[] = [];
      if (updates["profil_sections"]) {
        const oldConfig = await getGlobalConfig();
        const oldSectionsJson = oldConfig["profil_sections"];
        
        if (oldSectionsJson) {
          try {
            const oldSections = JSON.parse(oldSectionsJson);
            const newSections = JSON.parse(updates["profil_sections"]);
            
            const oldUrls = new Set<string>();
            const newUrls = new Set<string>();
            
            if (Array.isArray(oldSections)) {
              oldSections.forEach((sec: { image?: string }) => {
                if (sec.image && sec.image.includes("cloudinary.com")) {
                  oldUrls.add(sec.image);
                }
              });
            }
            
            if (Array.isArray(newSections)) {
              newSections.forEach((sec: { image?: string }) => {
                if (sec.image && sec.image.includes("cloudinary.com")) {
                  newUrls.add(sec.image);
                }
              });
            }
            
            oldUrls.forEach((url) => {
              if (!newUrls.has(url)) {
                urlsToDelete.push(url);
              }
            });
          } catch (e) {
            console.error("Failed to parse profile sections for cleanup:", e);
          }
        }
      }

      await updateGlobalConfig(updates);
      
      if (urlsToDelete.length > 0) {
        await Promise.allSettled(urlsToDelete.map(url => deleteFromCloudinary(url)));
      }
      
      revalidateTag("global-config", "max");
      revalidatePath("/profil");
    }
    
    return NextResponse.json({ success: true, message: "Pengaturan profil berhasil diperbarui" });
  } catch (error) {
    console.error("Failed to update pengaturan profil:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui pengaturan" },
      { status: 500 }
    );
  }
}
