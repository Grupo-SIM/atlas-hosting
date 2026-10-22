import type { Metadata } from "next";
import { Footer } from "../landing/components/Footer";
import { Navbar } from "../landing/components/Navbar";
import { SmoothScroll } from "../landing/components/SmoothScroll";
import { VpsWindowsPage } from "../landing/components/VpsWindowsPage";

export const metadata: Metadata = {
  description:
    "VPS Windows escalável com ótimo custo-benefício, configuração rápida, recursos dedicados e alta performance para aplicações e ambientes corporativos.",
  title: "VPS Windows | Atlas Hosting",
};

export default function VpsWindowsRoutePage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#00050A] selection:bg-sky-500/30">
        <Navbar />
        {/* Background Gradient - Removed for darker look as requested */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[#00050A] opacity-100" />
        <main className="relative z-10 w-full pt-24">
          <VpsWindowsPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
