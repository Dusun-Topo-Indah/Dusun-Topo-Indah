import { normalizeText, paginateItems, stripHtml } from "@/lib/listing";
import type { BeritaRow, FasilitasRow, GaleriRow, PengaduanRow, PerangkatRow } from "@/types";
import type { sheets_v4 } from "googleapis";
import { google } from "googleapis";

let globalConfigCache: Record<string, string> | null = null;
let globalConfigCacheTime = 0;

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
  cacheLife("max");
  
  try {
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
    }));
  } catch (error) {
    console.error("Failed to fetch berita list:", error);
    return [];
  }
}

export async function getRecentBerita(limit = 3): Promise<BeritaRow[]> {
  "use cache";
  cacheTag("berita", "berita-recent");
  cacheLife("max");
  
  const allBerita = await getBeritaList();
  const publicBerita = allBerita.filter(b => b.status_publikasi === "Publik" || !b.status_publikasi);
  return publicBerita.slice(0, limit);
}

export async function getDashboardStats(): Promise<{ totalBerita: number; totalGaleri: number }> {
  "use cache";
  cacheTag("dashboard-stats", "berita-total", "galeri-total");
  cacheLife("max");
  try {
    const sheets = await getGoogleSheetsInstance();
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ["Berita_Dusun!A:A", "Galeri_Dusun!A:A"],
    });

    const valueRanges = res.data.valueRanges;
    if (!valueRanges || valueRanges.length < 2) return { totalBerita: 0, totalGaleri: 0 };

    const beritaTotal = valueRanges[0].values?.length || 0;
    const galeriTotal = valueRanges[1].values?.length || 0;

    return {
      totalBerita: beritaTotal > 1 ? beritaTotal - 1 : 0,
      totalGaleri: galeriTotal > 1 ? galeriTotal - 1 : 0,
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    return { totalBerita: 0, totalGaleri: 0 };
  }
}

export async function getHomepageData(): Promise<{ 
  globalConfig: Record<string, string>;
  galeriList: GaleriRow[];
  beritaList: BeritaRow[];
}> {
  "use cache";
  cacheTag("homepage-data", "global-config", "berita", "galeri");
  cacheLife("max");

  try {
    const sheets = await getGoogleSheetsInstance();
    const res = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ["Global_Config!A:B", "Galeri_Dusun!A:F", "Berita_Dusun!A:I"],
    });

    const valueRanges = res.data.valueRanges;
    if (!valueRanges || valueRanges.length < 3) return { globalConfig: {}, galeriList: [], beritaList: [] };

    const configRows = valueRanges[0].values || [];
    const configDataRows = (configRows[0]?.[0]?.toLowerCase() === "key" || configRows[0]?.[1]?.toLowerCase() === "value") ? configRows.slice(1) : configRows;
    const globalConfig: Record<string, string> = {};
    for (const row of configDataRows) {
      if (row[0]) globalConfig[row[0]] = row[1] || "";
    }

    const galeriRows = valueRanges[1].values || [];
    const galeriDataRows = (galeriRows[0]?.[0]?.toLowerCase() === "id" || galeriRows[0]?.[1]?.toLowerCase() === "judul") ? galeriRows.slice(1) : galeriRows;
    const galeriList = galeriDataRows.map((row) => ({
      id: row[0] || "",
      judul: row[1] || "",
      kategori: row[2] || "",
      deskripsi: row[3] || "",
      tanggal_upload: row[4] || "",
      url_foto: row[5] || "",
    }));

    const beritaRows = valueRanges[2].values || [];
    const beritaDataRows = (beritaRows[0]?.[0]?.toLowerCase() === "id" || beritaRows[0]?.[1]?.toLowerCase() === "judul") ? beritaRows.slice(1) : beritaRows;
    const beritaList = beritaDataRows.map((row) => ({
      id: row[0] || "",
      judul: row[1] || "",
      tanggal: row[2] || "",
      ringkasan: row[3] || "",
      isi_berita: row[4] || "",
      url_foto: row[5] || "",
      kategori: row[6] || "",
      media_assets: row[7] || "",
      status_publikasi: row[8] || "Publik",
    }));

    return { globalConfig, galeriList, beritaList };
  } catch (error) {
    console.error("Failed to fetch homepage data:", error);
    return { globalConfig: {}, galeriList: [], beritaList: [] };
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
async function insertRowAtTop(sheetName: string, values: string[]): Promise<void> {
  const sheets = await getGoogleSheetsInstance();
  
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = spreadsheet.data.sheets?.find((s: sheets_v4.Schema$Sheet) => s.properties?.title === sheetName);
  const sheetId = sheet?.properties?.sheetId;

  if (sheetId === undefined) throw new Error(`Sheet ${sheetName} not found`);

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          insertDimension: {
            range: {
              sheetId: sheetId,
              dimension: "ROWS",
              startIndex: 1,
              endIndex: 2,
            },
            inheritFromBefore: false,
          },
        },
      ],
    },
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${sheetName}!A2`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [values],
    },
  });
}

export async function appendBerita(data: BeritaRow): Promise<void> {
  await insertRowAtTop("Berita_Dusun", [
    data.id, 
    data.judul, 
    data.tanggal, 
    data.ringkasan, 
    data.isi_berita, 
    data.url_foto, 
    data.kategori, 
    data.media_assets || "", 
    data.status_publikasi || "Publik"
  ]);
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
  cacheLife("max");
  
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

    return dataRows.map((row) => ({
      id: row[0] || "",
      judul: row[1] || "",
      kategori: row[2] || "",
      deskripsi: row[3] || "",
      tanggal_upload: row[4] || "",
      url_foto: row[5] || "",
    })); 
  } catch (error) {
    console.error("Failed to fetch galeri list:", error);
    return [];
  }
}

export async function getFasilitasList(): Promise<FasilitasRow[]> {
  "use cache";
  cacheTag("fasilitas");
  cacheLife("max");
  
  try {
    const sheets = await getGoogleSheetsInstance();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Fasilitas_Dusun!A:G",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];
    const isHeader = rows[0][0]?.toLowerCase() === "id" || rows[0][1]?.toLowerCase() === "nama_fasum";
    const dataRows = isHeader ? rows.slice(1) : rows;

    return dataRows.map((row) => ({
      id: row[0] || "",
      nama_fasum: row[1] || "",
      kategori_ikon: row[2] || "",
      latitude: row[3] || "",
      longitude: row[4] || "",
      deskripsi: row[5] || "",
      url_foto: row[6] || "",
    }));
  } catch (error) {
    console.error("Failed to fetch fasilitas list:", error);
    return [];
  }
}

export async function getPerangkatList(): Promise<PerangkatRow[]> {
  "use cache";
  cacheTag("perangkat");
  cacheLife("max");
  
  try {
    const sheets = await getGoogleSheetsInstance();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Perangkat_Dusun!A:E",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];
    const isHeader = rows[0][0]?.toLowerCase() === "id" || rows[0][1]?.toLowerCase() === "urutan";
    const dataRows = isHeader ? rows.slice(1) : rows;

    return dataRows.map((row) => ({
      id: row[0] || "",
      urutan: row[1] || "",
      nama: row[2] || "",
      jabatan: row[3] || "",
      url_foto: row[4] || "",
    }));
  } catch (error) {
    console.error("Failed to fetch perangkat list:", error);
    return [];
  }
}

export async function appendGaleri(data: GaleriRow): Promise<void> {
  await insertRowAtTop("Galeri_Dusun", [
    data.id, 
    data.judul, 
    data.kategori, 
    data.deskripsi, 
    data.tanggal_upload, 
    data.url_foto
  ]);
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
  cacheLife("max");

  // Mencegah Spam API Limit di environment development (karena hot-reload / 404 spam)
  if (process.env.NODE_ENV === "development" && globalConfigCache && Date.now() - globalConfigCacheTime < 60000) {
    return globalConfigCache;
  }
  
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
    
    if (process.env.NODE_ENV === "development") {
      globalConfigCache = config;
      globalConfigCacheTime = Date.now();
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

export async function getPengaduanList(): Promise<PengaduanRow[]> {
  "use cache";
  cacheTag("pengaduan");
  cacheLife("max");
  
  try {
    const sheets = await getGoogleSheetsInstance();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Pengaduan_Warga!A:J",
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) return [];

    const dataRows = (rows[0]?.[0]?.toLowerCase() === "id" || rows[0]?.[1]?.toLowerCase() === "nama_lengkap") ? rows.slice(1) : rows;

    return dataRows.map((row) => ({
      id: row[0] || "",
      nama_lengkap: row[1] || "",
      nik: row[2] || "",
      status_warga: row[3] || "",
      no_hp: row[4] || "",
      kategori: row[5] || "",
      isi_laporan: row[6] || "",
      url_foto: row[7] || "",
      status: row[8] || "Menunggu",
      tanggal: row[9] || "",
    }));
  } catch (error) {
    console.error("Failed to fetch pengaduan list:", error);
    return [];
  }
}

export async function getPengaduanById(id: string): Promise<PengaduanRow | null> {
  "use cache";
  cacheTag("pengaduan");
  cacheLife("max");
  
  try {
    const list = await getPengaduanList();
    const item = list.find((p) => p.id === id);
    return item || null;
  } catch (error) {
    console.error("Failed to fetch pengaduan by id:", error);
    return null;
  }
}

export async function appendPengaduan(data: PengaduanRow): Promise<boolean> {
  const values = [
    data.id, data.nama_lengkap, data.nik, data.status_warga, data.no_hp, data.kategori, data.isi_laporan, data.url_foto, data.status, data.tanggal
  ];
  try {
    await insertRowAtTop("Pengaduan_Warga", values);
    return true;
  } catch (error) {
    console.error("Failed to append pengaduan:", error);
    return false;
  }
}

export async function updatePengaduanStatus(id: string, newStatus: string): Promise<boolean> {
  try {
    const sheets = await getGoogleSheetsInstance();
    
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Pengaduan_Warga!A:I",
    });

    const rows = res.data.values;
    if (!rows) return false;

    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === id) {
        rowIndex = i + 1;
        break;
      }
    }

    if (rowIndex === -1) {
      console.warn("Pengaduan ID not found:", id);
      return false;
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `Pengaduan_Warga!I${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[newStatus]],
      },
    });

    return true;
  } catch (error) {
    console.error("Failed to update pengaduan status:", error);
    return false;
  }
}

interface PengaduanListingArgs {
  q: string;
  filter: string;
  status: string;
  page: number;
  limit: number;
}

export async function getPengaduanListing(args: PengaduanListingArgs) {
  const list = await getPengaduanList();
  const query = normalizeText(args.q);
  const filter = normalizeText(args.filter);
  const statusFilter = normalizeText(args.status);
  
  const categories = Array.from(new Set(list.map((item) => item.kategori).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b, "id")
  );

  let filtered = list;

  if (query) {
    filtered = filtered.filter(
      (item) =>
        normalizeText(item.isi_laporan).includes(query) ||
        normalizeText(item.nama_lengkap).includes(query) ||
        normalizeText(item.nik).includes(query)
    );
  }

  if (filter && filter !== "all") {
    filtered = filtered.filter((item) => normalizeText(item.kategori) === filter);
  }

  if (statusFilter && statusFilter !== "all") {
    filtered = filtered.filter((item) => normalizeText(item.status) === statusFilter);
  }

  // Sort by newest based on ID (which contains timestamp)
  filtered.sort((a, b) => {
    const timeA = parseInt(a.id.split("-")[1] || "0");
    const timeB = parseInt(b.id.split("-")[1] || "0");
    return timeB - timeA;
  });

  const pagination = paginateItems(filtered, args.page, args.limit);

  return {
    items: pagination.items,
    totalItems: pagination.totalItems,
    totalPages: pagination.totalPages,
    page: pagination.page,
    categories,
  };
}

export async function appendFasilitas(data: FasilitasRow): Promise<void> {
  await insertRowAtTop("Fasilitas_Dusun", [
    data.id,
    data.nama_fasum,
    data.kategori_ikon,
    data.latitude,
    data.longitude,
    data.deskripsi,
    data.url_foto,
  ]);
}

export async function updateFasilitasById(id: string, updatedData: Partial<FasilitasRow>): Promise<boolean> {
  const sheets = await getGoogleSheetsInstance();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Fasilitas_Dusun!A:G",
  });

  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  const existingRow = rows[rowIndex];
  const newRow = [
    existingRow[0] || "",
    updatedData.nama_fasum !== undefined ? updatedData.nama_fasum : (existingRow[1] || ""),
    updatedData.kategori_ikon !== undefined ? updatedData.kategori_ikon : (existingRow[2] || ""),
    updatedData.latitude !== undefined ? updatedData.latitude : (existingRow[3] || ""),
    updatedData.longitude !== undefined ? updatedData.longitude : (existingRow[4] || ""),
    updatedData.deskripsi !== undefined ? updatedData.deskripsi : (existingRow[5] || ""),
    updatedData.url_foto !== undefined ? updatedData.url_foto : (existingRow[6] || ""),
  ];

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Fasilitas_Dusun!A${rowIndex + 1}:G${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [newRow],
    },
  });

  return true;
}

export async function deleteFasilitasById(id: string): Promise<boolean> {
  const sheets = await getGoogleSheetsInstance();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: "Fasilitas_Dusun!A:A",
  });
  const rows = res.data.values;
  if (!rows) return false;

  const rowIndex = rows.findIndex((row) => row[0] === id);
  if (rowIndex === -1) return false;

  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
  });
  const sheet = spreadsheet.data.sheets?.find(s => s.properties?.title === "Fasilitas_Dusun");
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
