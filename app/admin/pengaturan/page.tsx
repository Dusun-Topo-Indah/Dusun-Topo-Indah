import { DashboardHeader } from "@/components/admin/layout/dashboard-header";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
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
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader 
        title="Pengaturan" 
        description="Kelola kredensial administrator dan pemeliharaan sistem." 
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <PengaturanForm initialUsername={currentUsername} />
      </div>
    </div>
  );
}
