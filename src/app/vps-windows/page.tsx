import type { Metadata } from "next";
import { Navbar } from "../landing/components/Navbar";
import { VpsWindowsPage } from "../landing/components/VpsWindowsPage";
import { Footer } from "../landing/components/Footer";
import { SmoothScroll } from "../landing/components/SmoothScroll";

export const metadata: Metadata = {
  title: "VPS Windows | Atlas Hosting",
  description:
    "VPS Windows escalável com ótimo custo-benefício, configuração rápida, recursos dedicados e alta performance para aplicações e ambientes corporativos.",
};

export default function VpsWindowsRoutePage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full overflow-x-hidden bg-atlas-dark-1 selection:bg-sky-500/30">
        <Navbar />
        {/* Background Gradient */}
        <div className="fixed inset-0 z-0 bg-landing-gradient opacity-40 pointer-events-none" />
        <main className="relative z-10 w-full pt-24">
          <VpsWindowsPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
