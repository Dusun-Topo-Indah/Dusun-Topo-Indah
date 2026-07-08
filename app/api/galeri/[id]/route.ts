import { NextResponse } from "next/server";
import { deleteGaleriById, getGaleriList, updateGaleriById } from "@/lib/google-sheets";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { revalidatePath, revalidateTag } from "next/cache";
import { verifyAdminSession } from "@/lib/auth";

interface GaleriPayload {
  judul?: string;
  kategori?: string;
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
        { success: false, message: "ID Galeri tidak valid." },
        { status: 400 }
      );
    }

    const body = (await request.json()) as GaleriPayload;
    const judul = body.judul?.trim() || "";
    const kategori = body.kategori?.trim();
    const deskripsi = body.deskripsi?.trim() || "";
    const url_foto = body.url_foto?.trim();

    if (!kategori || !url_foto) {
      return NextResponse.json(
        { success: false, message: "Kategori dan foto wajib diisi." },
        { status: 400 }
      );
    }

    const galeriList = await getGaleriList();
    const oldItem = galeriList.find((item) => item.id === id);

    if (!oldItem) {
      return NextResponse.json(
        { success: false, message: "Data galeri tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await updateGaleriById(id, {
      judul,
      kategori,
      deskripsi,
      url_foto,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Galeri gagal diperbarui di database." },
        { status: 500 }
      );
    }

    revalidateTag("galeri", "max");
    revalidatePath("/galeri");
    revalidatePath("/");

    if (oldItem.url_foto && oldItem.url_foto !== url_foto) {
      const deleted = await deleteFromCloudinary(oldItem.url_foto);
      if (!deleted) {
        console.warn("Galeri updated but old Cloudinary image could not be deleted:", oldItem.url_foto);
      }
    }

    return NextResponse.json({ success: true, message: "Galeri berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update galeri:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memperbarui galeri." },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    const galeriList = await getGaleriList();
    const item = galeriList.find(g => g.id === id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Data foto tidak ditemukan." },
        { status: 404 }
      );
    }

    if (item.url_foto) {
      const deleted = await deleteFromCloudinary(item.url_foto);
      if (!deleted) {
        return NextResponse.json(
          { success: false, message: "Gagal menghapus foto dari Cloudinary." },
          { status: 500 }
        );
      }
    }

    const success = await deleteGaleriById(id);
    if (!success) {
      throw new Error("Gagal menghapus baris di Google Sheets.");
    }

    revalidateTag("galeri", "max");
    revalidatePath("/galeri");
    revalidatePath("/");

    return NextResponse.json({ success: true, message: "Foto galeri berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete galeri:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus foto." },
      { status: 500 }
    );
  }
}
