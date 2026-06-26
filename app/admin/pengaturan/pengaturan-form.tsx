"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ShieldCheck, User, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { toast } from "sonner";

interface PengaturanFormProps {
  initialUsername: string;
}

interface UpdatePayload {
  newUsername?: string;
  oldPassword?: string;
  newPassword?: string;
}

export function PengaturanForm({ initialUsername }: PengaturanFormProps) {
  const router = useRouter();
  
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [usernameData, setUsernameData] = useState({
    newUsername: initialUsername,
    oldPassword: "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUsernameData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const submitUpdate = async (payload: UpdatePayload, setLoading: (state: boolean) => void) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUsername: initialUsername,
          ...payload
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui pengaturan");
      }

      toast.success(data.message);
      
      // Redirect ke halaman login karena sesi direset jika berhasil
      setTimeout(() => {
        router.push("/login");
        router.refresh();
      }, 1500);
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Terjadi kesalahan. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameData.newUsername || !usernameData.oldPassword) {
      toast.error("Harap isi username dan password saat ini!");
      return;
    }
    await submitUpdate(
      { newUsername: usernameData.newUsername, oldPassword: usernameData.oldPassword },
      setIsUsernameLoading
    );
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }

    await submitUpdate(
      { oldPassword: passwordData.oldPassword, newPassword: passwordData.newPassword },
      setIsPasswordLoading
    );
  };

  return (
    <div className="max-w-3xl space-y-12 pb-20">
      {/* SECTION 1: UPDATE USERNAME */}
      <form onSubmit={handleUsernameSubmit} className="space-y-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" />
            Perbarui Username
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Ganti username yang digunakan untuk login. Anda tetap perlu mengkonfirmasi menggunakan password saat ini.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="newUsername" className="text-sm font-semibold flex items-center gap-2">
              Username Baru <span className="text-red-500">*</span>
            </label>
            <Input
              id="newUsername"
              name="newUsername"
              placeholder="Masukkan username baru"
              value={usernameData.newUsername}
              onChange={handleUsernameChange}
              required
              disabled={isUsernameLoading}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="oldPasswordUsername" className="text-sm font-semibold">
              Password Saat Ini <span className="text-red-500">*</span>
            </label>
            <Input
              id="oldPasswordUsername"
              name="oldPassword"
              type="password"
              placeholder="Masukkan password untuk konfirmasi"
              value={usernameData.oldPassword}
              onChange={handleUsernameChange}
              required
              disabled={isUsernameLoading}
            />
          </div>

          <div className="pt-4 flex md:col-span-2">
            <Button type="submit" disabled={isUsernameLoading} className="w-full text-base h-14">
              <Save className="mr-2 h-5 w-5" />
              {isUsernameLoading ? "Menyimpan..." : "Simpan Username"}
            </Button>
          </div>
        </div>
      </form>

      {/* SECTION 2: UPDATE PASSWORD */}
      <form onSubmit={handlePasswordSubmit} className="space-y-6 pt-6">
        <div className="border-b pb-4">
          <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
            <KeyRound className="h-5 w-5 text-primary" />
            Perbarui Password
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5">
            Ganti password akun Anda untuk menjaga keamanan sistem.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="oldPasswordPass" className="text-sm font-semibold">
              Password Lama <span className="text-red-500">*</span>
            </label>
            <Input
              id="oldPasswordPass"
              name="oldPassword"
              type="password"
              placeholder="Masukkan password saat ini"
              value={passwordData.oldPassword}
              onChange={handlePasswordChange}
              required
              disabled={isPasswordLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="newPassword" className="text-sm font-semibold">
              Password Baru <span className="text-red-500">*</span>
            </label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Minimal 6 karakter"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              disabled={isPasswordLoading}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-semibold">
              Konfirmasi Password <span className="text-red-500">*</span>
            </label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password baru"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              disabled={isPasswordLoading}
            />
          </div>

          <div className="pt-4 flex md:col-span-2">
            <Button type="submit" disabled={isPasswordLoading} className="w-full text-base h-14">
              <Save className="mr-2 h-5 w-5" />
              {isPasswordLoading ? "Menyimpan..." : "Simpan Password"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
