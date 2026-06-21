import { NextResponse } from "next/server";
import { deleteBeritaById, getBeritaList, updateBeritaById } from "@/lib/google-sheets";
import { revalidateTag } from "next/cache";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { sanitizeHtml } from "@/lib/sanitize";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Berita tidak valid." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { judul, ringkasan, isi_berita, url_foto } = body;

    if (!judul || !isi_berita) {
      return NextResponse.json(
        { success: false, message: "Judul dan isi berita wajib diisi." },
        { status: 400 }
      );
    }

    if (isi_berita.length > 45000) {
      return NextResponse.json(
        { success: false, message: "Isi berita terlalu panjang. Pastikan Anda mengunggah gambar menggunakan URL, bukan dengan melakukan copy-paste gambar secara langsung (Base64) ke dalam editor." },
        { status: 400 }
      );
    }

    const beritaList = await getBeritaList();
    const oldBerita = beritaList.find((b) => b.id === id);

    if (!oldBerita) {
      return NextResponse.json(
        { success: false, message: "Berita tidak ditemukan." },
        { status: 404 }
      );
    }

    // Auto-Delete Algorithm for Orphaned Images
    const oldUrls = new Set<string>();
    if (oldBerita.url_foto && oldBerita.url_foto.includes("cloudinary.com")) {
      oldUrls.add(oldBerita.url_foto);
    }
    const oldImgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = oldImgRegex.exec(oldBerita.isi_berita)) !== null) {
      if (match[1].includes("cloudinary.com")) {
        oldUrls.add(match[1]);
      }
    }

    const newUrls = new Set<string>();
    if (url_foto && url_foto.includes("cloudinary.com")) {
      newUrls.add(url_foto);
    }
    const newImgRegex = /<img[^>]+src="([^">]+)"/g;
    while ((match = newImgRegex.exec(isi_berita)) !== null) {
      if (match[1].includes("cloudinary.com")) {
        newUrls.add(match[1]);
      }
    }

    const urlsToDelete: string[] = [];
    for (const oldUrl of oldUrls) {
      if (!newUrls.has(oldUrl)) {
        urlsToDelete.push(oldUrl);
      }
    }

    if (urlsToDelete.length > 0) {
      await Promise.allSettled(urlsToDelete.map((url) => deleteFromCloudinary(url)));
    }

    const cleanHtml = sanitizeHtml(isi_berita);

    const success = await updateBeritaById(id, {
      judul,
      ringkasan,
      isi_berita: cleanHtml,
      url_foto,
    });

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Berita gagal diperbarui di database." },
        { status: 500 }
      );
    }

    revalidateTag("berita", "max");

    return NextResponse.json({ success: true, message: "Berita berhasil diperbarui." });
  } catch (error) {
    console.error("Failed to update berita:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat memperbarui berita." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Berita tidak valid." },
        { status: 400 }
      );
    }

    const beritaList = await getBeritaList();
    const berita = beritaList.find((b) => b.id === id);

    if (!berita) {
      return NextResponse.json(
        { success: false, message: "Berita tidak ditemukan." },
        { status: 404 }
      );
    }

    const urlsToDelete: string[] = [];
    if (berita.url_foto && berita.url_foto.includes("cloudinary.com")) {
      urlsToDelete.push(berita.url_foto);
    }

    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    let match;
    while ((match = imgRegex.exec(berita.isi_berita)) !== null) {
      if (match[1].includes("cloudinary.com")) {
        urlsToDelete.push(match[1]);
      }
    }

    if (urlsToDelete.length > 0) {
      await Promise.allSettled(urlsToDelete.map((url) => deleteFromCloudinary(url)));
    }

    const success = await deleteBeritaById(id);

    if (!success) {
      return NextResponse.json(
        { success: false, message: "Berita gagal dihapus dari database." },
        { status: 500 }
      );
    }

    // Invalidate cache
    revalidateTag("berita", "max");

    return NextResponse.json({ success: true, message: "Berita dan aset terkait berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete berita:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat menghapus berita." },
      { status: 500 }
    );
  }
}
