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
  nama_lengkap: string;
  nik: string;
  status_warga: string;
  no_hp: string;
  kategori: string;
  isi_laporan: string;
  url_foto: string;
  status: string;
  tanggal: string;
}

export interface FasilitasRow {
  id: string;
  nama_fasum: string;
  kategori_ikon: string;
  latitude: string;
  longitude: string;
  deskripsi: string;
  url_foto: string;
}

export interface PerangkatRow {
  id: string;
  urutan: string;
  nama: string;
  jabatan: string;
  url_foto: string;
}
