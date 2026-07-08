import { NextResponse } from "next/server";
import { getGoogleSheetsInstance, SPREADSHEET_ID } from "@/lib/google-sheets";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in environment variables.");
  }
  return new TextEncoder().encode(secret);
};
const JWT_SECRET = getJwtSecret();
export async function POST(request: Request) {
  try {
    const { newUsername, oldPassword, newPassword } = await request.json();

    if (!newUsername || !oldPassword) {
      return NextResponse.json(
        { message: "Username dan Password Lama harus diisi" },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) {
      return NextResponse.json({ message: "Tidak ada sesi aktif" }, { status: 401 });
    }

    let payload;
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      payload = verified.payload;
    } catch {
      return NextResponse.json({ message: "Sesi tidak valid" }, { status: 401 });
    }

    const currentUsername = payload.username as string;

    const sheets = await getGoogleSheetsInstance();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Admin_Auth!A:B",
    });

    const rows = response.data.values;

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: "Data admin kosong" },
        { status: 500 }
      );
    }

    const rowIndex = rows.findIndex((row) => row[0] === currentUsername);

    if (rowIndex === -1) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    const storedHashedPassword = rows[rowIndex][1];
    const isPasswordValid = await bcrypt.compare(oldPassword, storedHashedPassword);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Password lama salah" },
        { status: 401 }
      );
    }

    const finalPassword = newPassword 
      ? await bcrypt.hash(newPassword, 10) 
      : storedHashedPassword;

    const sheetRowNumber = rowIndex + 1;
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Admin_Auth!A${sheetRowNumber}:B${sheetRowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[newUsername, finalPassword]],
      },
    });
    cookieStore.delete("admin_session");

    return NextResponse.json({ success: true, message: "Pengaturan akun berhasil diperbarui. Silakan login kembali." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Update auth error:", error.message);
    } else {
      console.error("Update auth error:", error);
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}
