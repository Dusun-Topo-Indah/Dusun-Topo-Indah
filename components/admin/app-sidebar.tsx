"use client";

import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  Newspaper, 
  Image as ImageIcon, 
  Map, 
  MessageSquareWarning, 
  Settings,
  LogOut,
  MapPin,
  ChevronsUpDown
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const menuItems = [
  { title: "Beranda", icon: Home, href: "/admin" },
  { title: "Berita", icon: Newspaper, href: "/admin/berita" },
  { title: "Galeri", icon: ImageIcon, href: "/admin/galeri" },
  { title: "Peta", icon: Map, href: "/admin/peta" },
  { title: "Pengaduan", icon: MessageSquareWarning, href: "/admin/pengaduan" },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/admin" onClick={() => setOpenMobile(false)} />}>
              <div className="flex aspect-square size-8 items-center justify-center bg-transparent">
                <div className="grid grid-cols-2 gap-0.5">
                  <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-primary/70 rounded-full"></span>
                  <span className="w-2.5 h-2.5 bg-primary/50 rounded-full col-span-2 mx-auto"></span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-bold text-slate-900 tracking-tight text-lg">TOPO INDAH</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {/* Beranda */}
            {menuItems.slice(0, 1).map((item) => {
              const isActive = item.href === "/admin" 
                ? pathname === "/admin" 
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title} render={<Link href={item.href} onClick={() => setOpenMobile(false)} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarSeparator className="mx-4" />

        <SidebarGroup>
          <SidebarMenu>
            {/* Konten */}
            {menuItems.slice(1, 3).map((item) => {
              const isActive = item.href === "/admin" 
                ? pathname === "/admin" 
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title} render={<Link href={item.href} onClick={() => setOpenMobile(false)} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarSeparator className="mx-4" />

        <SidebarGroup>
          <SidebarMenu>
            {/* Pelayanan/Informasi */}
            {menuItems.slice(3, 5).map((item) => {
              const isActive = item.href === "/admin" 
                ? pathname === "/admin" 
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton isActive={isActive} tooltip={item.title} render={<Link href={item.href} onClick={() => setOpenMobile(false)} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
