import { getFasilitasList } from "@/lib/google-sheets";
import type { Metadata } from "next";
import { connection } from "next/server";
import { PetaDynamicLoader } from "@/components/public/peta/peta-dynamic-loader";

export const metadata: Metadata = {
  title: "Peta Interaktif — Dusun Topo Indah",
  description:
    "Jelajahi peta interaktif Dusun Topo Indah. Temukan lokasi masjid, musholla, posyandu, tempat wisata, dan fasilitas umum lainnya.",
};

export default async function PetaPage() {
  await connection();
  const fasilitasList = await getFasilitasList();

  return <PetaDynamicLoader fasilitas={fasilitasList} />;
}
