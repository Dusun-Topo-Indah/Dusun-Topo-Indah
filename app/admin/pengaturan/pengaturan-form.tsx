"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

interface PengaturanFormProps {
  initialUsername: string;
}

export function PengaturanForm({ initialUsername }: PengaturanFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    newUsername: initialUsername,
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Password baru dan konfirmasi tidak cocok!");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newUsername: formData.newUsername,
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal memperbarui pengaturan");
      }

      toast.success(data.message);
      
      // Redirect ke halaman login karena sesi direset
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
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <Card className="border-muted-foreground/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Keamanan Akun
          </CardTitle>
          <CardDescription>
            Perbarui username dan password Anda. Anda akan diminta untuk login kembali setelah menyimpan perubahan ini.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="newUsername" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Username Baru
            </label>
            <Input
              id="newUsername"
              name="newUsername"
              placeholder="Masukkan username baru"
              value={formData.newUsername}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
            <p className="text-[0.8rem] text-muted-foreground">
              Username yang akan digunakan untuk login berikutnya.
            </p>
          </div>

          <div className="space-y-2 border-t pt-6">
            <label htmlFor="oldPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Password Lama <span className="text-destructive">*</span>
            </label>
            <Input
              id="oldPassword"
              name="oldPassword"
              type="password"
              placeholder="Masukkan password saat ini"
              value={formData.oldPassword}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Password Baru <span className="text-destructive">*</span>
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                placeholder="Minimal 6 karakter"
                value={formData.newPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Konfirmasi Password <span className="text-destructive">*</span>
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Ulangi password baru"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end border-t bg-muted/20 px-6 py-4">
          <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
