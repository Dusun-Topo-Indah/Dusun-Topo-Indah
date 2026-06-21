"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Newspaper, 
  Image as ImageIcon, 
  Map, 
  MessageSquareWarning, 
  Settings 
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Beranda", icon: Home, href: "/admin" },
  { title: "Berita", icon: Newspaper, href: "/admin/berita" },
  { title: "Galeri", icon: ImageIcon, href: "/admin/galeri" },
  { title: "Peta", icon: Map, href: "/admin/peta" },
  { title: "Pengaduan", icon: MessageSquareWarning, href: "/admin/pengaduan" },
  { title: "Pengaturan", icon: Settings, href: "/admin/pengaturan" },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex flex-col h-full bg-white border-r border-gray-200", className)}>
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">SIG Dusun</h2>
        <p className="text-sm text-gray-500">Topo Indah</p>
      </div>
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Exact match for /admin to avoid highlighting it constantly
          const isActive = item.href === "/admin" 
            ? pathname === "/admin" 
            : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-blue-700" : "text-gray-400")} />
              {item.title}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          Versi 1.0.0
        </p>
      </div>
    </div>
  );
}
