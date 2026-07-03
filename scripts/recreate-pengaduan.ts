import "dotenv/config";
import { db } from "../lib/db/index";
import { sql } from "drizzle-orm";

async function main() {
  console.log("Dropping existing pengaduan_warga table...");
  await db.run(sql`DROP TABLE IF EXISTS pengaduan_warga`);
  
  console.log("Creating new pengaduan_warga table...");
  await db.run(sql`
    CREATE TABLE pengaduan_warga (
      id TEXT PRIMARY KEY NOT NULL,
      tanggal TEXT NOT NULL,
      nama_lengkap TEXT NOT NULL,
      nik TEXT NOT NULL,
      status_warga TEXT NOT NULL,
      no_hp TEXT DEFAULT '',
      kategori TEXT DEFAULT '',
      isi_laporan TEXT NOT NULL,
      url_foto TEXT DEFAULT '',
      status TEXT DEFAULT 'Menunggu',
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  
  console.log("Table pengaduan_warga recreated successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error recreating table:", err);
  process.exit(1);
});
