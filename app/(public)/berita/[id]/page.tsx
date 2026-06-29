import { BeritaDetail } from "@/components/public/berita/berita-detail";

import { getBeritaList } from "@/lib/google-sheets";
import { notFound } from "next/navigation";
import { stripHtml } from "@/lib/listing";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await getBeritaList();
  const berita = list.find((b) => b.id === id && (b.status_publikasi === "Publik" || !b.status_publikasi));
  
  if (!berita) {
    return {
      title: "Berita Tidak Ditemukan — SIG-Dusun Topo Indah",
    };
  }

  return {
    title: `${berita.judul} — SIG-Dusun Topo Indah`,
    description: stripHtml(berita.ringkasan || berita.isi_berita).substring(0, 150) + "...",
  };
}

export async function generateStaticParams() {
  const list = await getBeritaList();
  const publicList = list.filter((b) => b.status_publikasi === "Publik" || !b.status_publikasi);
  
  if (publicList.length === 0) {
    return [{ id: "_empty" }];
  }
  
  return publicList.map((b) => ({ id: b.id }));
}

export default async function BeritaDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await getBeritaList();
  const beritaData = list.find((b) => b.id === id && (b.status_publikasi === "Publik" || !b.status_publikasi));

  if (!beritaData) {
    notFound();
  }

  const detail = {
    id: beritaData.id,
    title: beritaData.judul,
    date: beritaData.tanggal,
    image: beritaData.url_foto || "/images/placeholder.jpg",
    category: beritaData.kategori || "Umum",
    content: beritaData.isi_berita,
  };

  return <BeritaDetail berita={detail} />;
}
