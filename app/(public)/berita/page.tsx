import { PageHeader } from "@/components/public/page-header";
import { BeritaLayout, BeritaItem } from "@/components/public/berita-layout";

export const metadata = {
  title: "Berita — Dusun Topo Indah",
  description: "Kumpulan berita, pengumuman, dan artikel terbaru seputar kegiatan di Dusun Topo Indah.",
};

export default function BeritaPage() {
  // Dummy data
  const dummyCategories = ["Pemerintahan", "Pembangunan", "Kemasyarakatan", "Pemberdayaan"];
  
  const dummyItems: BeritaItem[] = [
    {
      id: "1",
      title: "Pembangunan Jalan Desa Tahap 2 Telah Selesai 100%",
      summary: "Program pembangunan infrastruktur jalan desa yang dibiayai oleh dana desa tahap dua telah rampung sesuai target. Warga kini dapat menikmati akses jalan yang lebih mulus dan memperlancar distribusi hasil pertanian.",
      date: "24 Okt 2023",
      image: "/images/hero_bg_desa.png",
      category: "Pembangunan"
    },
    {
      id: "2",
      title: "Penyaluran Bantuan Langsung Tunai (BLT) Periode Kuartal 4",
      summary: "Pemerintah dusun sukses menyalurkan Bantuan Langsung Tunai (BLT) kepada warga yang berhak menerima. Penyaluran dilakukan di balai desa dengan tetap memperhatikan protokol kesehatan.",
      date: "15 Okt 2023",
      image: "/images/hero_bg_desa_2.png",
      category: "Pemerintahan"
    },
    {
      id: "3",
      title: "Pelatihan Keterampilan Tani Organik Bersama Dinas Pertanian",
      summary: "Dalam rangka meningkatkan hasil panen dan kualitas tanah, diadakan pelatihan sistem pertanian organik bagi kelompok tani Dusun Topo Indah yang diisi langsung oleh pakar dari Dinas Pertanian Kabupaten.",
      date: "02 Okt 2023",
      image: "/images/hero_bg_desa_3.png",
      category: "Pemberdayaan"
    },
    {
      id: "4",
      title: "Kerja Bakti Massal Persiapan Menyambut Musim Hujan",
      summary: "Antisipasi banjir dan genangan air, seluruh warga bergotong royong membersihkan saluran air dan gorong-gorong utama dusun pada akhir pekan lalu. Kekompakan warga sangat patut diapresiasi.",
      date: "28 Sep 2023",
      image: "/images/hero_bg_desa.png",
      category: "Kemasyarakatan"
    },
    {
      id: "5",
      title: "Kunjungan Studi Banding dari Desa Tetangga Terkait Ekowisata",
      summary: "Dusun Topo Indah menerima kunjungan studi banding dari perangkat desa tetangga yang ingin mempelajari keberhasilan pengelolaan ekowisata alam mandiri yang dikelola oleh pemuda setempat.",
      date: "10 Sep 2023",
      image: "/images/hero_bg_desa_2.png",
      category: "Pemerintahan"
    }
  ];

  return (
    <main className="w-full bg-white min-h-screen">
      <PageHeader 
        title="Berita & Pengumuman" 
        description="Dapatkan informasi terkini, artikel, dan pengumuman resmi seputar aktivitas masyarakat di Dusun Topo Indah."
      />
      <BeritaLayout items={dummyItems} categories={dummyCategories} />
    </main>
  );
}
