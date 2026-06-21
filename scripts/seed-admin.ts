import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { getGoogleSheetsInstance, SPREADSHEET_ID } from "../lib/google-sheets";
import bcrypt from "bcryptjs";

async function main() {
  const args = process.argv.slice(2);
  const username = args[0] || "admin";
  const password = args[1] || "password123";

  console.log(`Menyiapkan kredensial untuk username: "${username}"`);
  console.log(`Mohon tunggu, sedang menghash password...`);

  // Hash password dengan salt factor 10
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const sheets = await getGoogleSheetsInstance();
    
    console.log("Menghubungkan ke Google Sheets...");

    // Update sheet Admin_Auth dengan header dan akun baru
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
