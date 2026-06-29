import { Footer } from "@/components/public/layout/footer";
import { Navbar } from "@/components/public/layout/navbar";
import { ScrollToTop } from "@/components/public/layout/scroll-to-top";
import { buttonVariants } from "@/components/ui/button";
import { FadeIn } from "@/components/ui/fade-in";
import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] overflow-x-clip">
      <Navbar />
      
      <main className="flex-1 relative flex flex-col items-center justify-center mt-20 overflow-hidden min-h-[calc(100dvh-5rem)]">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0">
           <span className="text-[35vw] md:text-[28vw] font-bold text-primary/10 leading-none tracking-tighter select-none">
             404
           </span>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 flex flex-col items-center justify-center text-center">
          <FadeIn direction="up" delay={0.1}>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-5 tracking-tight">
              Halaman tidak ditemukan
            </h1>
          </FadeIn>
          
          <FadeIn direction="up" delay={0.2} className="max-w-md mx-auto">
            <p className="text-slate-500 text-base md:text-lg mb-8 leading-relaxed">
              Maaf, sepertinya Anda tersesat. Halaman yang Anda cari telah dipindahkan atau memang tidak pernah ada.
            </p>
          </FadeIn>

          <FadeIn direction="up" delay={0.3}>
            <Link 
              href="/" 
              className={buttonVariants({ 
                variant: "default", 
                size: "lg", 
                className: "rounded-full shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 hover:-translate-y-1 px-8 h-12 md:h-14 text-sm md:text-base group" 
              })}
            >
              <Home className="mr-2 w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform duration-300" />
              Kembali ke Beranda
            </Link>
          </FadeIn>
        </div>
      </main>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
