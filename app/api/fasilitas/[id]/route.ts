import { NextResponse } from "next/server";
import { updateFasilitasById, deleteFasilitasById } from "@/lib/google-sheets";
import { revalidateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { nama_fasum, kategori_ikon, latitude, longitude, deskripsi, url_foto, warna_pin } = body;

    if (!nama_fasum || !kategori_ikon || !latitude || !longitude) {
      return NextResponse.json(
        { success: false, message: "Nama fasilitas, kategori, latitude, dan longitude wajib diisi." },
        { status: 400 }
      );
    }

    const success = await updateFasilitasById(id, {
      nama_fasum,
      kategori_ikon,
      latitude: `'${String(latitude)}`,
      longitude: `'${String(longitude)}`,
      deskripsi: deskripsi || "",
      url_foto: url_foto || "",
      warna_pin: warna_pin || "",
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Fasilitas tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidateTag("fasilitas", "max");

    return NextResponse.json({ success: true, message: "Fasilitas berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update fasilitas:", error);
    return NextResponse.json(
      { success: false, message: `Gagal memperbarui fasilitas: ${error instanceof Error ? error.message : "Error tidak diketahui"}` },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const { id } = await params;
    const success = await deleteFasilitasById(id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Fasilitas tidak ditemukan." },
        { status: 404 }
      );
    }

    revalidateTag("fasilitas", "max");

    return NextResponse.json({ success: true, message: "Fasilitas berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete fasilitas:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus fasilitas." },
      { status: 500 }
    );
  }
}
