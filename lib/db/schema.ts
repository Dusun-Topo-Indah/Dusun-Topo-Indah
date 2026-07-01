import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const adminAuth = sqliteTable("admin_auth", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const beritaDusun = sqliteTable("berita_dusun", {
  id: text("id").primaryKey(),
  judul: text("judul").notNull(),
  tanggal: text("tanggal").notNull(),
  ringkasan: text("ringkasan").default(""),
  isi_berita: text("isi_berita").notNull(),
  url_foto: text("url_foto").default(""),
  kategori: text("kategori").default(""),
  media_assets: text("media_assets").default(""),
  status_publikasi: text("status_publikasi").default("Publik"),
  created_at: text("created_at").default(sql`(datetime('now'))`),
  updated_at: text("updated_at").default(sql`(datetime('now'))`),
});

export const galeriDusun = sqliteTable("galeri_dusun", {
  id: text("id").primaryKey(),
  judul: text("judul").default(""),
  kategori: text("kategori").notNull(),
  deskripsi: text("deskripsi").default(""),
  tanggal_upload: text("tanggal_upload").notNull(),
  url_foto: text("url_foto").notNull(),
  created_at: text("created_at").default(sql`(datetime('now'))`),
});

export const globalConfig = sqliteTable("global_config", {
  key: text("key").primaryKey(),
  value: text("value").default(""),
});

export const mapsData = sqliteTable("maps_data", {
  id: text("id").primaryKey(),
  nama_fasum: text("nama_fasum").notNull(),
  kategori_ikon: text("kategori_ikon").default(""),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  deskripsi: text("deskripsi").default(""),
  url_foto: text("url_foto").default(""),
});

export const pengaduanWarga = sqliteTable("pengaduan_warga", {
  id: text("id").primaryKey(),
  tanggal: text("tanggal").notNull(),
  nama: text("nama").notNull(),
  no_hp: text("no_hp").default(""),
  kategori: text("kategori").default(""),
  isi_pesan: text("isi_pesan").notNull(),
  status: text("status").default("Pending"),
  created_at: text("created_at").default(sql`(datetime('now'))`),
});

export const perangkatDusun = sqliteTable("perangkat_dusun", {
  id: text("id").primaryKey(),
  urutan: integer("urutan").notNull(),
  nama: text("nama").notNull(),
  jabatan: text("jabatan").notNull(),
  url_foto: text("url_foto").default(""),
});
