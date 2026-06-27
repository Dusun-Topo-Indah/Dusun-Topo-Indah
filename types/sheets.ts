export interface BeritaRow {
  id: string;
  judul: string;
  tanggal: string;
  ringkasan: string;
  isi_berita: string;
  url_foto: string;
  kategori: string;
}

export interface GaleriRow {
  id: string;
  kategori: string;
  caption: string;
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
