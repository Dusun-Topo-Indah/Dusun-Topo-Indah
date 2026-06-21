import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { getGoogleSheetsInstance, SPREADSHEET_ID } from "../lib/google-sheets";
import bcrypt from "bcryptjs";

async function main() {
  const args = process.argv.slice(2);
  const username = args[0] || process.env.ADMIN_USERNAME;
  const password = args[1] || process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    console.error("❌ Error: Username dan password harus disertakan via argumen CLI atau di-set di file .env (ADMIN_USERNAME & ADMIN_PASSWORD)");
    process.exit(1);
  }

  console.log(`Menyiapkan kredensial untuk username: "${username}"`);
  console.log(`Mohon tunggu, sedang menghash password...`);

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const sheets = await getGoogleSheetsInstance();
    
    console.log("Menghubungkan ke Google Sheets...");

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Admin_Auth!A1:B2",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          ["Username", "Password"],
          [username, hashedPassword],
        ],
      },
    });

    console.log("✅ Berhasil menyimpan kredensial (hashed) ke Google Sheets!");
    console.log(`Silakan gunakan password "${password}" untuk login.`);
  } catch (error) {
    console.error("❌ Gagal menyimpan ke Google Sheets:", error);
  }
}

main();
