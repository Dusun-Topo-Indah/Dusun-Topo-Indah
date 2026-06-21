import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import type { BeritaRow } from "@/types";

let sheetsInstance: sheets_v4.Sheets | null = null;

export async function getGoogleSheetsInstance(): Promise<sheets_v4.Sheets> {
  if (sheetsInstance) return sheetsInstance;

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const authClient = await auth.getClient();

  sheetsInstance = google.sheets({
    version: "v4",
    auth: authClient as Parameters<typeof google.sheets>[0]["auth"],
  });

  return sheetsInstance;
}

export const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;

import { cacheTag, cacheLife } from "next/cache";

export async function getBeritaList(): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita");
  cacheLife("hours");
  
  const sheets = await getGoogleSheetsInstance();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Berita_Dusun!A:F",
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];
  const isHeader = rows[0][0]?.toLowerCase() === "id" || rows[0][1]?.toLowerCase() === "judul";
  const dataRows = isHeader ? rows.slice(1) : rows;

  if (dataRows.length === 0) return [];

  return dataRows.map((row) => ({
    id: row[0] || "",
    judul: row[1] || "",
    tanggal: row[2] || "",
    ringkasan: row[3] || "",
    isi_berita: row[4] || "",
    url_foto: row[5] || "",
  })).reverse(); 
}
export async function appendBerita(data: BeritaRow): Promise<void> {
  const sheets = await getGoogleSheetsInstance();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Berita_Dusun!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[data.id, data.judul, data.tanggal, data.ringkasan, data.isi_berita, data.url_foto]],
    },
  });
}
export async function deleteBeritaById(id: string): Promise<boolean> {
  const sheets = await getGoogleSheetsInstance();
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Berita_Dusun!A:A",
  });
  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === "Berita_Dusun");
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined) return false;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  });

  return true;
}

export async function updateBeritaById(id: string, updatedData: Partial<BeritaRow>): Promise<boolean> {
  const sheets = await getGoogleSheetsInstance();
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Berita_Dusun!A:F",
  });
  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  const existingRow = rows[rowIndex];
  
  const newRow = [
    existingRow[0] || "",
    updatedData.judul !== undefined ? updatedData.judul : (existingRow[1] || ""),
    updatedData.tanggal !== undefined ? updatedData.tanggal : (existingRow[2] || ""),
    updatedData.ringkasan !== undefined ? updatedData.ringkasan : (existingRow[3] || ""),
    updatedData.isi_berita !== undefined ? updatedData.isi_berita : (existingRow[4] || ""),
    updatedData.url_foto !== undefined ? updatedData.url_foto : (existingRow[5] || ""),
  ];

  const sheetRowIndex = rowIndex + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Berita_Dusun!A${sheetRowIndex}:F${sheetRowIndex}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [newRow],
    },
  });

  return true;
}
