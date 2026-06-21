import { NextResponse } from "next/server";
import { appendGaleri } from "@/lib/google-sheets";
import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { kategori, caption, url_foto } = body;

    if (!url_foto || !kategori) {
      return NextResponse.json(
        { success: false, message: "Foto dan kategori wajib diisi." },
        { status: 400 }
      );
    }

    const id = `GLR-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const tanggal_upload = new Date().toISOString();
    
    await appendGaleri({
      id,
      kategori,
      caption: caption || "",
      tanggal_upload,
      url_foto,
    });
    
    revalidateTag("galeri", "max");

    return NextResponse.json({ success: true, message: "Foto berhasil diunggah ke galeri." });
  } catch (error) {
    console.error("Failed to append galeri:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan foto ke database." },
      { status: 500 }
    );
  }
}
