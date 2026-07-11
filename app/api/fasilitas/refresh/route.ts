import { NextResponse } from "next/server";
import { getFasilitasList } from "@/lib/google-sheets";
import { verifyAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    if (!(await verifyAdminSession())) {
      return NextResponse.json(
        { success: false, message: "Sesi admin tidak valid." },
        { status: 401 }
      );
    }

    const data = await getFasilitasList();

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Failed to refresh fasilitas:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengambil data fasilitas." },
      { status: 500 }
    );
  }
}
