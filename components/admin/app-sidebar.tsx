"use client";

import {
  BadgeInfo,
  Home,
  Image as ImageIcon,
  Newspaper,
  PanelTop,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar
} from "@/components/ui/sidebar";

const menuGroups = [
  {
    section: "Main",
    items: [
      { title: "Beranda", icon: Home, href: "/admin" },
    ],
  },
  {
    section: "Master Data",
    items: [
      { title: "Berita", icon: Newspaper, href: "/admin/berita" },
      { title: "Galeri", icon: ImageIcon, href: "/admin/galeri" },
      { title: "Informasi Web", icon: BadgeInfo, href: "/admin/informasi-web" },
    ],
  },
  {
    section: "Halaman Web",
    items: [
      { title: "Pengaturan Beranda", icon: PanelTop, href: "/admin/pengaturan-beranda" },
    ],
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

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
        {menuGroups.map((group, index) => (
          <React.Fragment key={group.section}>
            {index > 0 && <SidebarSeparator className="mx-4" />}
            <SidebarGroup>
              {group.section !== "Main" && <SidebarGroupLabel>{group.section}</SidebarGroupLabel>}
              <SidebarMenu>
                {group.items.map((item) => {
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
          </React.Fragment>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
