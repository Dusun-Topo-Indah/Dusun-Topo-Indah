import { BeritaDetail } from "@/components/public/berita-detail";

export const metadata = {
  title: "Detail Berita — Dusun Topo Indah",
  description: "Baca artikel dan pengumuman selengkapnya mengenai Dusun Topo Indah.",
};

export default async function BeritaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const dummyDetail = {
    id: id,
    title: "Pembangunan Jalan Desa Tahap 2 Telah Selesai 100% dan Siap Digunakan",
    date: "24 Okt 2023",
    image: "/images/hero_bg_desa.png",
    category: "Pembangunan",
    content: `
      <p>Pemerintah Dusun Topo Indah dengan bangga mengumumkan bahwa proyek pembangunan jalan desa tahap kedua telah rampung sepenuhnya. Proyek yang didanai melalui alokasi dana desa tahun anggaran 2023 ini menelan biaya yang tidak sedikit, namun hasilnya sangat memuaskan dan diharapkan dapat segera memberikan dampak positif bagi roda perekonomian warga.</p>
      
      <h2 id="latar-belakang">Latar Belakang Pembangunan</h2>
      <p>Kondisi jalan utama menuju lahan pertanian warga sebelumnya sering kali mengalami kerusakan berat, terutama saat musim penghujan tiba. Hal ini menyebabkan terhambatnya proses distribusi hasil panen seperti sayur-mayur dan padi organik yang menjadi komoditas utama dusun kita.</p>
      <p>Berangkat dari keluhan warga tersebut, melalui musyawarah dusun (Musdus) yang digelar awal tahun lalu, disepakati bahwa perbaikan infrastruktur jalan menjadi prioritas utama pembangunan desa.</p>
      
      <h2 id="proses-pengerjaan">Proses Pengerjaan</h2>
      <p>Pengerjaan jalan sepanjang 2,5 kilometer ini memakan waktu kurang lebih tiga bulan. Menariknya, proyek ini tidak sepenuhnya diserahkan kepada pihak ketiga (kontraktor luar), melainkan memberdayakan sistem padat karya tunai (PKT).</p>
      <ul>
        <li>Keterlibatan puluhan pemuda dan warga setempat.</li>
        <li>Penggunaan material lokal yang berkualitas.</li>
        <li>Pengawasan langsung oleh tim dari kecamatan.</li>
      </ul>
      <p>Dengan gotong royong, pengerjaan justru bisa diselesaikan dua minggu lebih cepat dari target waktu yang direncanakan.</p>

      <h2 id="dampak-ekonomi">Dampak Ekonomi Kedepan</h2>
      <p>Dengan akses jalan yang sudah diaspal mulus, diharapkan biaya transportasi angkut hasil panen bisa ditekan hingga 30%. Selain itu, akses menuju lokasi ekowisata bukit juga menjadi jauh lebih mudah dijangkau oleh wisatawan dari luar daerah.</p>
      <blockquote>"Jalan ini adalah urat nadi perekonomian kita. Mari kita jaga bersama agar awet dan membawa berkah bagi seluruh warga Topo Indah," ujar Kepala Dusun saat acara peresmian kemarin.</blockquote>

      <h3 id="langkah-selanjutnya">Langkah Pemeliharaan Selanjutnya</h3>
      <p>Pemerintah dusun mengimbau kepada seluruh warga, khususnya yang memiliki kendaraan bermuatan berat (seperti truk pasir), untuk mematuhi batas tonase yang telah ditetapkan demi menjaga keawetan aspal.</p>
      <p>Ke depan, sisa anggaran desa akan dialokasikan untuk pembangunan lampu penerangan jalan umum (PJU) di sepanjang jalan baru ini agar warga merasa aman saat melintas di malam hari.</p>
    `
  };

  return <BeritaDetail berita={dummyDetail} />;
}
