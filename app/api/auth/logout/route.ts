import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    
    return NextResponse.json({ success: true, message: "Berhasil logout" });
  } catch (error: unknown) {
    console.error("Logout error:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { message: "Terjadi kesalahan saat logout" },
      { status: 500 }
    );
  }
}
