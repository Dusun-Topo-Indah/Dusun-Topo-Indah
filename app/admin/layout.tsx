import { AppSidebar } from "@/components/admin/layout/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { DynamicBreadcrumb } from "@/components/admin/layout/dynamic-breadcrumb";
import { BreadcrumbProvider } from "@/components/admin/layout/breadcrumb-context";
import { Suspense } from "react";

import { UserNav } from "@/components/admin/layout/user-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <BreadcrumbProvider>
      <Suspense fallback={null}>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center justify-between px-4 bg-white sticky top-0 z-10 border-b border-slate-200 shadow-sm">
              <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <DynamicBreadcrumb />
              </div>
              <div className="flex items-center gap-4">
                <UserNav />
              </div>
            </header>
            <main className="flex-1 p-4 tablet:p-6 desktop:p-8 bg-white">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </Suspense>
    </BreadcrumbProvider>
  );
}
