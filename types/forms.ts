export type SlideData = {
  id: string;
  judul: string;
  linkText: string;
  linkHref: string;
  foto: File | null;
  currentFotoUrl: string;
};

export type ParsedSlide = {
  id?: string;
  title?: string;
  linkText?: string;
  linkHref?: string;
  image?: string;
};

export type ProfileSection = {
  id: string;
  title: string;
  description: string;
  foto: File | null;
  currentFotoUrl: string;
};

import * as z from "zod";

export const beritaSchema = z.object({
  judul: z.string().min(3, { message: "Judul berita minimal 3 karakter." }),
  kategori: z.string().min(1, { message: "Kategori wajib dipilih atau diisi." }),
  ringkasan: z.string().max(200, { message: "Ringkasan maksimal 200 karakter." }).optional(),
  isi_berita: z.string().min(10, { message: "Isi berita minimal 10 karakter." }),
  status_publikasi: z.enum(["Publik", "Draf", "Arsip"]),
  foto: z.any().optional(),
});

export type BeritaFormValues = z.infer<typeof beritaSchema>;

export const galeriSchema = z.object({
  judul: z.string().min(3, { message: "Judul galeri minimal 3 karakter." }).max(100, { message: "Judul maksimal 100 karakter." }),
  kategori: z.string().min(1, { message: "Kategori wajib diisi." }),
  deskripsi: z.string().max(200, { message: "Deskripsi maksimal 200 karakter." }).optional(),
  foto: z.any().optional(),
});

export type GaleriFormValues = z.infer<typeof galeriSchema>;
