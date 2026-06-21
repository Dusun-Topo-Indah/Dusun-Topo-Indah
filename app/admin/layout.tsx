import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50/50">
      {/* Desktop Sidebar (Tampil hanya di breakpoint desktop ke atas) */}
      <aside className="hidden desktop:block w-72 shrink-0 h-screen sticky top-0">
        <Sidebar />
      </aside>
      
      {/* Main Content Area */}
      <div className="flex flex-col flex-1 w-full min-w-0">
        <Topbar />
        <main className="flex-1 p-4 tablet:p-6 desktop:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
