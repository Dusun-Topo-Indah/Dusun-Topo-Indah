import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";
import type { BeritaRow, GaleriRow } from "@/types";
import { normalizeText, paginateItems, stripHtml } from "@/lib/listing";

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

export async function getGaleriList(): Promise<GaleriRow[]> {
  "use cache";
  cacheTag("galeri");
  cacheLife("hours");
  
  const sheets = await getGoogleSheetsInstance();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Galeri_Dusun!A:E",
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];
  const isHeader = rows[0][0]?.toLowerCase() === "id" || rows[0][1]?.toLowerCase() === "kategori";
  const dataRows = isHeader ? rows.slice(1) : rows;

  if (dataRows.length === 0) return [];

  return dataRows.map((row) => ({
    id: row[0] || "",
    kategori: row[1] || "",
    caption: row[2] || "",
    tanggal_upload: row[3] || "",
    url_foto: row[4] || "",
  })).reverse(); 
}

export async function appendGaleri(data: GaleriRow): Promise<void> {
  const sheets = await getGoogleSheetsInstance();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Galeri_Dusun!A:E",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[data.id, data.kategori, data.caption, data.tanggal_upload, data.url_foto]],
    },
  });
}

export async function updateGaleriById(id: string, updatedData: Partial<GaleriRow>): Promise<boolean> {
  const sheets = await getGoogleSheetsInstance();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Galeri_Dusun!A:E",
  });

  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  const existingRow = rows[rowIndex];
  const newRow = [
    existingRow[0] || "",
    updatedData.kategori !== undefined ? updatedData.kategori : (existingRow[1] || ""),
    updatedData.caption !== undefined ? updatedData.caption : (existingRow[2] || ""),
    updatedData.tanggal_upload !== undefined ? updatedData.tanggal_upload : (existingRow[3] || ""),
    updatedData.url_foto !== undefined ? updatedData.url_foto : (existingRow[4] || ""),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Galeri_Dusun!A${rowIndex + 1}:E${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [newRow],
    },
  });

  return true;
}

interface BeritaListingArgs {
  q: string;
  filter: string;
  page: number;
  limit: number;
}

interface GaleriListingArgs {
  q: string;
  filter: string;
  page: number;
  limit: number;
}

export async function getBeritaListing(args: BeritaListingArgs) {
  const beritaList = await getBeritaList();
  const query = normalizeText(args.q);
  const filtered = beritaList.filter((item) => {
    const searchable = normalizeText(`${item.judul} ${item.ringkasan} ${stripHtml(item.isi_berita)}`);
    const matchesSearch = query === "" || searchable.includes(query);
    const hasCover = Boolean(item.url_foto);
    const matchesFilter =
      args.filter === "all" ||
      (args.filter === "with-cover" && hasCover) ||
      (args.filter === "without-cover" && !hasCover);
    return matchesSearch && matchesFilter;
  });

  return paginateItems(filtered, args.page, args.limit);
}

export async function getGaleriListing(args: GaleriListingArgs) {
  const galeriList = await getGaleriList();
  const query = normalizeText(args.q);
  const categoryFilter = normalizeText(args.filter);
  const categories = Array.from(new Set(galeriList.map((item) => item.kategori).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "id")
  );

  const filtered = galeriList.filter((item) => {
    const searchable = normalizeText(`${item.kategori} ${item.caption}`);
    const matchesSearch = query === "" || searchable.includes(query);
    const matchesFilter = categoryFilter === "all" || normalizeText(item.kategori) === categoryFilter;
    return matchesSearch && matchesFilter;
  });

  const paginated = paginateItems(filtered, args.page, args.limit);
  return {
    ...paginated,
    categories,
  };
}

export async function deleteGaleriById(id: string): Promise<boolean> {
  const sheets = await getGoogleSheetsInstance();
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Galeri_Dusun!A:A",
  });
  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === "Galeri_Dusun");
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
