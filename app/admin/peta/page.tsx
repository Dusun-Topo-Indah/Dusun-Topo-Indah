import { getFasilitasList } from "@/lib/google-sheets";
import { PetaAdminClient } from "@/components/admin/peta/peta-admin-client";
import { connection } from "next/server";

export default async function AdminPetaPage() {
  await connection();
  const fasilitas = await getFasilitasList();

  return <PetaAdminClient initialFasilitas={fasilitas} />;
}
