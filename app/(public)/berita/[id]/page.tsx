import { BeritaDetail } from "@/components/public/berita/berita-detail";

import { getBeritaList } from "@/lib/google-sheets";
import { stripHtml } from "@/lib/listing";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = await getBeritaList();
  const berita = list.find((b) => b.id === id && (b.status_publikasi === "Publik" || !b.status_publikasi));
  
  if (!berita) {
    return {
      title: "Berita Tidak Ditemukan — Dusun Topo Indah",
    };
  }

  const title = `${berita.judul} | Dusun Topo Indah`;
  const description = stripHtml(berita.ringkasan || berita.isi_berita).substring(0, 150) + "...";
  let image = berita.url_foto || "/images/hero_bg_desa.png";
  
  if (image.includes('res.cloudinary.com') && image.includes('/upload/')) {
    image = image.replace('/upload/', '/upload/c_fill,w_1200,h_630,q_80,f_jpg/');
  }

  const url = `https://www.dusun-topoindah.my.id/berita/${id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      siteName: "Dusun Topo Indah",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: berita.judul,
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
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
