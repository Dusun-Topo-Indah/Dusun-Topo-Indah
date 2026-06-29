import { normalizeText, paginateItems, stripHtml } from "@/lib/listing";
import type { BeritaRow, GaleriRow } from "@/types";
import type { sheets_v4 } from "googleapis";
import { google } from "googleapis";

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

import { cacheLife, cacheTag } from "next/cache";

export async function getBeritaList(): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita");
  cacheLife("hours");
  
  const sheets = await getGoogleSheetsInstance();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Berita_Dusun!A:I",
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
    kategori: row[6] || "",
    media_assets: row[7] || "",
    status_publikasi: row[8] || "Publik",
  })).reverse(); 
}

export async function getRecentBerita(limit = 3): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita", "berita-recent");
  cacheLife("hours");
  
  const allBerita = await getBeritaList();
  const publicBerita = allBerita.filter(b => b.status_publikasi === "Publik" || !b.status_publikasi);
  return publicBerita.slice(0, limit);
}

export async function getTotalBerita(): Promise<number> {
  "use cache";
  cacheTag("berita", "berita-total");
  cacheLife("hours");
  try {
    const sheets = await getGoogleSheetsInstance();
    const idRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Berita_Dusun!A:A",
    });
    const total = idRes.data.values?.length || 0;
    return total > 1 ? total - 1 : 0;
  } catch {
    return 0;
  }
}

export async function getTotalGaleri(): Promise<number> {
  "use cache";
  cacheTag("galeri", "galeri-total");
  cacheLife("hours");
  try {
    const sheets = await getGoogleSheetsInstance();
    const idRes = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Galeri_Dusun!A:A",
    });
    const total = idRes.data.values?.length || 0;
    return total > 1 ? total - 1 : 0;
  } catch {
    return 0;
  }
}

export async function checkSystemStatus(): Promise<{ status: "Online" | "Offline"; message: string }> {
  "use cache";
  cacheTag("system-status");
  cacheLife("minutes");
  
  try {
    const sheets = await getGoogleSheetsInstance();
    await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
      fields: "properties.title",
    });
    return { status: "Online", message: "Koneksi ke Database Terhubung" };
  } catch (error) {
    console.error("System Status Check Error:", error);
    return { status: "Offline", message: "Koneksi ke Database Terputus" };
  }
}
export async function appendBerita(data: BeritaRow): Promise<void> {
  const sheets = await getGoogleSheetsInstance();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Berita_Dusun!A:I",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[data.id, data.judul, data.tanggal, data.ringkasan, data.isi_berita, data.url_foto, data.kategori, data.media_assets || "", data.status_publikasi || "Publik"]],
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
    range: "Berita_Dusun!A:I",
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
    updatedData.kategori !== undefined ? updatedData.kategori : (existingRow[6] || ""),
    updatedData.media_assets !== undefined ? updatedData.media_assets : (existingRow[7] || ""),
    updatedData.status_publikasi !== undefined ? updatedData.status_publikasi : (existingRow[8] || "Publik"),
  ];

  const sheetRowIndex = rowIndex + 1;

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Berita_Dusun!A${sheetRowIndex}:I${sheetRowIndex}`,
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
  
  try {
    const sheets = await getGoogleSheetsInstance();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Galeri_Dusun!A:F",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];
    const isHeader = rows[0][0]?.toLowerCase() === "id" || rows[0][1]?.toLowerCase() === "judul";
    const dataRows = isHeader ? rows.slice(1) : rows;

    if (dataRows.length === 0) return [];

    return dataRows.map((row) => ({
      id: row[0] || "",
      judul: row[1] || "",
      kategori: row[2] || "",
      deskripsi: row[3] || "",
      tanggal_upload: row[4] || "",
      url_foto: row[5] || "",
    })).reverse(); 
  } catch (error) {
    console.error("Failed to fetch GaleriList:", error);
    return [];
  }
}

export async function appendGaleri(data: GaleriRow): Promise<void> {
  const sheets = await getGoogleSheetsInstance();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: "Galeri_Dusun!A:F",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [[data.id, data.judul, data.kategori, data.deskripsi, data.tanggal_upload, data.url_foto]],
    },
  });
}

export async function updateGaleriById(id: string, updatedData: Partial<GaleriRow>): Promise<boolean> {
  const sheets = await getGoogleSheetsInstance();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Galeri_Dusun!A:F",
  });

  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  const existingRow = rows[rowIndex];
  const newRow = [
    existingRow[0] || "",
    updatedData.judul !== undefined ? updatedData.judul : (existingRow[1] || ""),
    updatedData.kategori !== undefined ? updatedData.kategori : (existingRow[2] || ""),
    updatedData.deskripsi !== undefined ? updatedData.deskripsi : (existingRow[3] || ""),
    updatedData.tanggal_upload !== undefined ? updatedData.tanggal_upload : (existingRow[4] || ""),
    updatedData.url_foto !== undefined ? updatedData.url_foto : (existingRow[5] || ""),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Galeri_Dusun!A${rowIndex + 1}:F${rowIndex + 1}`,
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
  status?: string;
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
  const categoryFilter = normalizeText(args.filter);
  const categories = Array.from(new Set(beritaList.map((item) => item.kategori).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "id")
  );

  const filtered = beritaList.filter((item) => {
    const searchable = normalizeText(`${item.judul} ${item.ringkasan} ${stripHtml(item.isi_berita)} ${item.kategori}`);
    const matchesSearch = query === "" || searchable.includes(query);
    const hasCover = Boolean(item.url_foto);
    const isSpecialFilter = args.filter === "all" || args.filter === "with-cover" || args.filter === "without-cover";
    
    let matchesFilter = true;
    if (isSpecialFilter) {
      matchesFilter = 
        args.filter === "all" ||
        (args.filter === "with-cover" && hasCover) ||
        (args.filter === "without-cover" && !hasCover);
    } else {
      matchesFilter = normalizeText(item.kategori) === categoryFilter;
    }
    
    const statusFilter = args.status && args.status !== "all" ? args.status : "all";
    const matchesStatus = statusFilter === "all" || item.status_publikasi === statusFilter;
    
    return matchesSearch && matchesFilter && matchesStatus;
  });

  const paginated = paginateItems(filtered, args.page, args.limit);
  return {
    ...paginated,
    categories,
  };
}

export async function getGaleriListing(args: GaleriListingArgs) {
  const galeriList = await getGaleriList();
  const query = normalizeText(args.q);
  const categoryFilter = normalizeText(args.filter);
  const categories = Array.from(new Set(galeriList.map((item) => item.kategori).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "id")
  );

  const filtered = galeriList.filter((item) => {
    const searchable = normalizeText(`${item.judul} ${item.kategori} ${item.deskripsi}`);
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

export async function getGlobalConfig(): Promise<Record<string, string>> {
  "use cache";
  cacheTag("global-config");
  cacheLife("hours");
  
  try {
    const sheets = await getGoogleSheetsInstance();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Global_Config!A:B",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return {};
    
    const isHeader = rows[0][0]?.toLowerCase() === "key" || rows[0][1]?.toLowerCase() === "value";
    const dataRows = isHeader ? rows.slice(1) : rows;

    const config: Record<string, string> = {};
    for (const row of dataRows) {
      if (row[0]) {
        config[row[0]] = row[1] || "";
      }
    }
    
    return config;
  } catch (error) {
    console.error("Failed to fetch GlobalConfig:", error);
    return {};
  }
}

export async function updateGlobalConfig(updates: Record<string, string>): Promise<boolean> {
  const sheets = await getGoogleSheetsInstance();
  
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Global_Config!A:B",
  });
  
  const rows = res.data.values || [];
  
  const currentKeys = new Map<string, number>();
  rows.forEach((row, index) => {
    if (row[0]) currentKeys.set(row[0], index);
  });
  
  for (const [key, value] of Object.entries(updates)) {
    if (currentKeys.has(key)) {
      const rowIndex = currentKeys.get(key)!;
      // Ensure the row has enough columns
      while (rows[rowIndex].length < 2) {
        rows[rowIndex].push("");
      }
      rows[rowIndex][1] = value;
    } else {
      rows.push([key, value]);
    }
  }
  
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: "Global_Config!A:B",
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: rows,
    },
  });

  return true;
}
