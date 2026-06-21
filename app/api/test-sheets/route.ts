import { NextResponse } from "next/server";
import { getGoogleSheetsInstance, SPREADSHEET_ID } from "@/lib/google-sheets";

export async function GET() {
  try {
    const sheets = await getGoogleSheetsInstance();
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Admin_Auth!A1:B10",
    });

    const rows = response.data.values;
    
    return NextResponse.json({
      status: "success",
      message: "Berhasil terhubung ke Google Sheets API!",
      data: rows || [],
    });
  } catch (error: unknown) {
    console.error("Error connecting to Google Sheets:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Gagal terhubung ke Google Sheets API.",
        error: error instanceof Error ? error.message : "Terjadi kesalahan yang tidak diketahui",
      },
      { status: 500 }
    );
  }
}
