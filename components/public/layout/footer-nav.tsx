"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const footerNavItems = [
  { label: "Beranda", href: "/" },
  { label: "Profil Dusun", href: "/profil" },
  { label: "Berita & Artikel", href: "/berita" },
  { label: "Galeri Foto", href: "/galeri" },
  { label: "Lapor / Pengaduan", href: "/pengaduan" },
];

export function FooterNav() {
  const pathname = usePathname();
  const safePathname = pathname || "/";

  return (
    <div className="lg:col-span-3 lg:col-start-7">
      <h4 className="font-bold text-slate-900 mb-6">Platform</h4>
      <ul className="space-y-4 text-sm font-medium text-slate-500">
        {footerNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? safePathname === item.href
              : safePathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`transition-colors ${
                  isActive
                    ? "text-primary font-semibold"
                    : "hover:text-primary"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
