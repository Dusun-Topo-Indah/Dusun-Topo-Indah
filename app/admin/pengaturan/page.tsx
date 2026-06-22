import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { DashboardHeader } from "@/components/admin/dashboard-header";
import { PengaturanForm } from "./pengaturan-form";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "default_secret_key_for_dev_only"
);

export default async function PengaturanPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin_session")?.value;
  let currentUsername = "admin";

  if (token) {
    try {
      const verified = await jwtVerify(token, JWT_SECRET);
      if (verified.payload.username) {
        currentUsername = verified.payload.username as string;
      }
    } catch {
      // Abaikan jika token tidak valid atau expired (sudah di-handle proxy)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan Akun" 
        description="Kelola kredensial login administrator untuk menjaga keamanan sistem." 
      />
      <PengaturanForm initialUsername={currentUsername} />
    </div>
  );
}
