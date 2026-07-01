export interface BeritaRow {
  id: string;
  judul: string;
  tanggal: string;
  ringkasan: string;
  isi_berita: string;
  url_foto: string;
  kategori: string;
  media_assets?: string;
  status_publikasi?: string;
}

export interface GaleriRow {
  id: string;
  judul: string;
  kategori: string;
  deskripsi: string;
  tanggal_upload: string;
  url_foto: string;
}

export interface PengaduanRow {
  id: string;
  tanggal: string;
  nama: string;
  no_hp: string;
  kategori: string;
  isi_pesan: string;
  status: string;
}

export interface FasilitasRow {
  id: string;
  nama_fasum: string;
  kategori_ikon: string;
  latitude: number;
  longitude: number;
  deskripsi: string;
  url_foto: string;
}

export interface PerangkatRow {
  id: string;
  urutan: number;
  nama: string;
  jabatan: string;
  url_foto: string;
}
