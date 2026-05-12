import type { Metadata } from "next";
import { Navbar } from "../landing/components/Navbar";
import { VdsPage } from "../landing/components/VdsPage";
import { Footer } from "../landing/components/Footer";
import { SmoothScroll } from "../landing/components/SmoothScroll";

export const metadata: Metadata = {
  title: "Cloud VDS | Atlas Hosting",
  description:
    "Servidores Virtuais Dedicados com núcleos físicos, RAM dedicada, NVMe empresarial e alto desempenho por preço competitivo.",
};

export default function CloudVdsPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full overflow-x-hidden bg-atlas-dark-1 selection:bg-sky-500/30">
        <Navbar />
        {/* Background Gradient */}
        <div className="fixed inset-0 z-0 bg-landing-gradient opacity-40 pointer-events-none" />
        <main className="relative z-10 w-full pt-24">
          <VdsPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
