"use client";

import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Beranda", href: "/" },
  { label: "Profil", href: "/profil" },
  { label: "Berita", href: "/berita" },
  { label: "Galeri", href: "/galeri" },
  { label: "Peta", href: "#peta" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      let isOverTransparentSection = false;
      const galeriEl = document.getElementById("galeri");
      
      if (galeriEl) {
        const rect = galeriEl.getBoundingClientRect();
        // Cek apakah navbar (sekitar 80px tingginya) menimpa section galeri
        if (rect.top <= 80 && rect.bottom >= 80) {
          isOverTransparentSection = true;
        }
      }

      if (window.scrollY > 50 && !isOverTransparentSection) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const isHomePage = pathname === "/";
  const useDarkTheme = !isHomePage || isScrolled;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 border-b-[0.5px] ${
          useDarkTheme
            ? "bg-white/90 backdrop-blur-md shadow-sm border-black/10"
            : "bg-transparent border-white/20"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className={`font-bold text-xl transition-colors duration-300 ${
              useDarkTheme ? "text-[#0D0D0D]" : "text-white"
            }`}
          >
            Dusun Topo Indah
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`relative text-sm font-medium transition-colors ${
                    useDarkTheme ? "text-slate-700" : "text-white/90"
                  } after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:bg-current after:transition-transform after:duration-300 hover:after:origin-bottom-left hover:after:scale-x-100 ${
                    isActive ? "after:origin-bottom-left after:scale-x-100" : "after:origin-bottom-right after:scale-x-0"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* Action Button & Mobile Toggle */}
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(true)}
              className={`transition-colors ${
                useDarkTheme ? "text-slate-900 hover:bg-slate-100" : "text-white hover:bg-white/20"
              }`}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-white transition-transform duration-500 ease-in-out md:hidden flex flex-col ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 h-20 border-b border-slate-100 shrink-0">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-bold text-xl text-[#0D0D0D]"
          >
            Dusun Topo Indah
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-slate-900 hover:bg-slate-100"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex flex-col px-6 py-8 gap-8 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-bold tracking-tight transition-colors ${
                  isActive ? "text-primary" : "text-slate-900 hover:text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
