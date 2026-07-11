import { NextResponse } from "next/server";
import { appendFasilitas } from "@/lib/google-sheets";
import { revalidateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nama_fasum, kategori_ikon, latitude, longitude, deskripsi, url_foto, warna_pin } = body;

    if (!nama_fasum || !kategori_ikon || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: "Nama fasilitas, kategori, latitude, dan longitude wajib diisi." },
        { status: 400 }
      );
    }

    const id = `FAS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await appendFasilitas({
      id,
      nama_fasum,
      kategori_ikon,
      latitude: String(latitude),
      longitude: String(longitude),
      deskripsi: deskripsi || "",
      url_foto: url_foto || "",
      warna_pin: warna_pin || "",
    });

    revalidateTag("fasilitas", "max");

    return NextResponse.json({ success: true, message: "Fasilitas berhasil ditambahkan." });
  } catch (error) {
    console.error("Failed to append fasilitas:", error);
    return NextResponse.json(
      { success: false, message: `Gagal menyimpan fasilitas: ${error instanceof Error ? error.message : "Error tidak diketahui"}` },
      { status: 500 }
    );
  }
}
