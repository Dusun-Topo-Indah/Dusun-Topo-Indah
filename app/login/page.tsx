"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Gagal login");
      }

      toast.success("Berhasil masuk, mengalihkan ke dashboard...");
      setUsername("");
      setPassword("");
      router.push("/admin");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
        toast.error(err.message);
      } else {
        setError("Terjadi kesalahan yang tidak diketahui");
        toast.error("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] flex items-center justify-center bg-white md:bg-slate-50 md:p-6 overflow-hidden">
      {/* Background Pattern Grid for Desktop */}
      <div
        className="hidden md:block absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        }}
      />

      {/* Main Container */}
      <div className="w-full h-full md:h-auto min-h-[100dvh] md:min-h-[550px] md:max-w-4xl bg-white md:rounded-2xl md:shadow-xl flex flex-col md:flex-row overflow-hidden relative z-10 border border-slate-100">
        
        {/* Left Side: Branding / Illustration (Hidden on Mobile) */}
        <div className="hidden md:flex md:w-[45%] bg-primary relative items-center justify-center p-12 overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center text-white">
            <div className="grid grid-cols-2 gap-1 mb-6">
              <span className="w-4 h-4 bg-white rounded-full"></span>
              <span className="w-4 h-4 bg-white/70 rounded-full"></span>
              <span className="w-4 h-4 bg-white/50 rounded-full col-span-2 mx-auto"></span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-[55%] p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white flex-1">
          <div className="w-full max-w-sm mx-auto">
            <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Link>
            
            <div className="mb-10 text-center md:text-left">
              {/* Mobile Branding (Only visible on mobile) */}
              <div className="flex md:hidden items-center justify-center gap-1.5 mb-8">
                <div className="grid grid-cols-2 gap-0.5">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-primary/70 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-primary/50 rounded-full col-span-2 mx-auto"></span>
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Login Admin</h2>
              <p className="text-slate-500 text-sm">Masuk untuk mengelola konten website</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 mb-6 rounded-lg text-sm text-center border border-red-100">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Username</Label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="Masukkan username"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Password</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-6">
                <Button type="submit" disabled={loading} className="w-full h-12 text-sm md:text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all">
                  {loading ? "Memproses..." : "Masuk"}
                </Button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
