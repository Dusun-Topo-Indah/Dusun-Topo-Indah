import { NextResponse } from "next/server";
import { appendFasilitas } from "@/lib/db/queries";
import { revalidateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";

interface FasilitasPayload {
  nama_fasum?: string;
  kategori_ikon?: string;
  latitude?: number | string;
  longitude?: number | string;
  deskripsi?: string;
  url_foto?: string;
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as FasilitasPayload;
    const nama_fasum = body.nama_fasum?.trim();
    const kategori_ikon = body.kategori_ikon?.trim();
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);

    if (!nama_fasum || !kategori_ikon || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { success: false, message: "Nama fasilitas, kategori, latitude, dan longitude wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    const id = `FAS-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    await appendFasilitas({
      id,
      nama_fasum,
      kategori_ikon,
      latitude,
      longitude,
      deskripsi: body.deskripsi?.trim() || "",
      url_foto: body.url_foto?.trim() || "",
    });

    revalidateTag("fasilitas", "max");

    return NextResponse.json({ success: true, message: "Fasilitas berhasil ditambahkan." });
  } catch (error) {
    console.error("Failed to append fasilitas:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menyimpan fasilitas ke database." },
      { status: 500 }
    );
  }
}
