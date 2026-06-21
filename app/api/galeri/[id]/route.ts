import { NextResponse } from "next/server";
import { deleteGaleriById, getGaleriList } from "@/lib/google-sheets";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { revalidateTag } from "next/cache";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const galeriList = await getGaleriList();
    const item = galeriList.find(g => g.id === id);
    
    if (!item) {
      return NextResponse.json(
        { success: false, message: "Data foto tidak ditemukan." },
        { status: 404 }
      );
    }

    const success = await deleteGaleriById(id);
    if (!success) {
      throw new Error("Gagal menghapus baris di Google Sheets.");
    }
    
    if (item.url_foto) {
      // Auto-delete dari Cloudinary secara asinkron
      deleteFromCloudinary(item.url_foto).catch(err => {
        console.error("Failed to delete from Cloudinary:", err);
      });
    }

    revalidateTag("galeri", "max");

    return NextResponse.json({ success: true, message: "Foto galeri berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete galeri:", error);
    return NextResponse.json(
      { success: false, message: "Gagal menghapus foto." },
      { status: 500 }
    );
  }
}
