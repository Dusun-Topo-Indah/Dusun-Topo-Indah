import { NextResponse } from "next/server";
import { getGoogleSheetsInstance, SPREADSHEET_ID } from "@/lib/google-sheets";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_for_dev_only"
);

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { message: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    const sheets = await getGoogleSheetsInstance();
    
    // Ambil data dari sheet Admin_Auth
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Admin_Auth!A:B", // Kolom A: Username, Kolom B: Password
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Data admin kosong, silakan hubungi developer." },
        { status: 401 }
      );
    }

    // Cek apakah username dan password cocok (mengabaikan baris pertama jika itu header, tapi aman menggunakan .some)
    const isValidUser = rows.some(
      (row) => row[0] === username && row[1] === password
    );

    if (!isValidUser) {
      return NextResponse.json(
        { message: "Username atau password salah" },
        { status: 401 }
      );
    }

    // Buat token JWT
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h") // Token berlaku 24 jam
      .sign(JWT_SECRET);

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 jam
      path: "/",
    });

    return NextResponse.json({ success: true, message: "Login berhasil" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Login error:", error.message);
    } else {
      console.error("Login error:", error);
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
