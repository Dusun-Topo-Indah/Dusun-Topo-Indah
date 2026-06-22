import { NextResponse } from "next/server";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { verifyAdminSession } from "@/lib/auth";

interface DeleteCloudinaryBody {
  secure_url?: string;
}

export async function POST(request: Request) {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const body = (await request.json()) as DeleteCloudinaryBody;
    const secureUrl = body.secure_url?.trim();

    if (!secureUrl) {
      return NextResponse.json(
        { success: false, message: "URL gambar tidak valid." },
        { status: 400 }
      );
    }

    const deleted = await deleteFromCloudinary(secureUrl);
    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Gagal menghapus gambar dari Cloudinary." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: "Gambar berhasil dihapus." });
  } catch (error) {
    console.error("Failed to delete Cloudinary image:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan sistem saat menghapus gambar." },
      { status: 500 }
    );
  }
}
