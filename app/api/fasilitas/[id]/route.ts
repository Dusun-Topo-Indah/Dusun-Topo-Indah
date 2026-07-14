import { NextResponse } from "next/server";
import { deleteFasilitasById, getFasilitasById, updateFasilitasById } from "@/lib/db/queries";
import { deleteFromCloudinary } from "@/lib/cloudinary";
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
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID fasilitas tidak valid." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as FasilitasPayload;
    const nama_fasum = body.nama_fasum?.trim();
    const kategori_ikon = body.kategori_ikon?.trim();
    const latitude = Number(body.latitude);
    const longitude = Number(body.longitude);
    const deskripsi = body.deskripsi?.trim() || "";
    const url_foto = body.url_foto?.trim() || "";

    if (!nama_fasum || !kategori_ikon || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return NextResponse.json(
        { success: false, message: "Nama fasilitas, kategori, latitude, dan longitude wajib diisi dengan benar." },
        { status: 400 }
      );
    }

    const oldItem = await getFasilitasById(id);
    if (!oldItem) {
      return NextResponse.json(
        { success: false, message: "Data fasilitas tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await updateFasilitasById(id, {
      nama_fasum,
      kategori_ikon,
      latitude,
      longitude,
      deskripsi,
      url_foto,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Fasilitas gagal diperbarui di database." },
        { status: 500 }
      );
    }

    revalidateTag("fasilitas", "max");

    if (oldItem.url_foto && oldItem.url_foto !== url_foto && oldItem.url_foto.includes("cloudinary.com")) {
      const deleted = await deleteFromCloudinary(oldItem.url_foto);
      if (!deleted) {
        console.warn("Fasilitas updated but old Cloudinary image could not be deleted:", oldItem.url_foto);
      }
    }

    return NextResponse.json({ success: true, message: "Fasilitas berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update fasilitas:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memperbarui fasilitas." },
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

    const item = await getFasilitasById(id);
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Data fasilitas tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await deleteFasilitasById(id);
    if (!success) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus fasilitas dari database." },
        { status: 500 }
      );
    }

    revalidateTag("fasilitas", "max");

    if (item.url_foto && item.url_foto.includes("cloudinary.com")) {
      deleteFromCloudinary(item.url_foto).catch((err) => {
        console.error("Failed to cleanup Cloudinary on fasilitas delete:", err);
      });
    }

    return NextResponse.json({ success: true, message: "Fasilitas berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete fasilitas:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus fasilitas." },
      { status: 500 }
    );
  }
}
