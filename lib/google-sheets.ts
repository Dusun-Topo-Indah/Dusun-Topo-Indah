import { google } from "googleapis";
import type { sheets_v4 } from "googleapis";

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

