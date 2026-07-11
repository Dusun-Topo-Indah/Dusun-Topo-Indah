import { Navbar } from "@/components/public/layout/navbar";
import { Footer } from "@/components/public/layout/footer";
import { ScrollToTop } from "@/components/public/layout/scroll-to-top";
import { FooterWrapper } from "@/components/public/layout/footer-wrapper";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen overflow-x-clip">
      <Navbar />
      <main className="flex-1">{children}</main>
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
      <ScrollToTop />
    </div>
  );
}
