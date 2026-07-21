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
  is3D?: boolean;
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

export const petaSchema = z.object({
  nama_fasum: z.string().min(3, { message: "Nama fasilitas minimal 3 karakter." }),
  kategori_ikon: z.string().min(1, { message: "Kategori wajib dipilih." }),
  latitude: z.string().regex(/^-?([0-8]?[0-9]|90)(\.\d+)?$/, { message: "Format latitude tidak valid (contoh: 0.45612)." }),
  longitude: z.string().regex(/^-?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, { message: "Format longitude tidak valid (contoh: 117.51320)." }),
  deskripsi: z.string().optional(),
  foto: z.any().optional(),
  warna_pin: z.string().optional(),
});

export type PetaFormValues = z.infer<typeof petaSchema>;
