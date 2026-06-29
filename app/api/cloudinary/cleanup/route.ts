import { verifyAdminSession } from "@/lib/auth";
import { getCloudinaryResources, deleteFromCloudinary } from "@/lib/cloudinary";
import { getBeritaList, getGaleriList, getGlobalConfig } from "@/lib/google-sheets";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json({ success: false, message: "Sesi tidak valid." }, { status: 401 });
    }

    const startTime = Date.now();
    
    // 1. Concurrent Fetch: Google Sheets and Cloudinary
    const [beritaList, galeriList, globalConfig, cloudinaryResources] = await Promise.all([
      getBeritaList(),
      getGaleriList(),
      getGlobalConfig(),
      getCloudinaryResources(),
    ]);

    // 2. Build Set of Used URLs (O(1) lookup)
    const usedUrls = new Set<string>();
    
    beritaList.forEach(b => {
      if (b.url_foto) usedUrls.add(b.url_foto);
      if (b.media_assets) {
        try {
          const assets = JSON.parse(b.media_assets);
          if (Array.isArray(assets)) {
            assets.forEach(url => usedUrls.add(url));
          }
        } catch {
          // ignore
        }
      }
      // Also extract from isi_berita just in case
      const imgRegex = /<img[^>]+src="([^">]+)"/g;
      let match;
      while ((match = imgRegex.exec(b.isi_berita)) !== null) {
        usedUrls.add(match[1]);
      }
    });

    galeriList.forEach(g => {
      if (g.url_foto) usedUrls.add(g.url_foto);
    });

    if (globalConfig.hero_image) usedUrls.add(globalConfig.hero_image);
    if (globalConfig.struktur_organisasi) usedUrls.add(globalConfig.struktur_organisasi);

    // 3. Find Orphaned Media older than 24 hours
    const oneDayInMs = 24 * 60 * 60 * 1000;
    const now = Date.now();
    const orphanedUrls: string[] = [];

    for (const res of cloudinaryResources) {
      const isUsed = usedUrls.has(res.secure_url) || usedUrls.has(res.secure_url.replace("https://", "http://"));
      if (!isUsed) {
        const createdAtTime = new Date(res.created_at).getTime();
        if (now - createdAtTime > oneDayInMs) {
          orphanedUrls.push(res.secure_url);
        }
      }
    }

    // 4. Delete Orphaned Media concurrently
    if (orphanedUrls.length > 0) {
      await Promise.allSettled(orphanedUrls.map(url => deleteFromCloudinary(url)));
    }

    const executionTimeMs = Date.now() - startTime;

    return NextResponse.json({
      success: true,
      message: `Berhasil memindai. Ditemukan dan dihapus ${orphanedUrls.length} media sampah.`,
      deletedCount: orphanedUrls.length,
      executionTimeMs,
    });
  } catch (error) {
    console.error("Cleanup API Error:", error);
    return NextResponse.json({ success: false, message: "Terjadi kesalahan sistem saat pembersihan." }, { status: 500 });
  }
}
