import type { Metadata } from "next";
import { Navbar } from "../landing/components/Navbar";
import { VpsStoragePage } from "../landing/components/VpsStoragePage";
import { Footer } from "../landing/components/Footer";
import { SmoothScroll } from "../landing/components/SmoothScroll";

export const metadata: Metadata = {
  title: "VPS de Armazenamento | Atlas Hosting",
  description:
    "Planos VPS de armazenamento com SSD de alta capacidade, tráfego ilimitado e melhor custo-benefício para aplicações que exigem espaço e performance.",
};

export default function VpsStorageRoutePage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full overflow-x-hidden bg-atlas-dark-1 selection:bg-sky-500/30">
        <Navbar />
        {/* Background Gradient */}
        <div className="fixed inset-0 z-0 bg-landing-gradient opacity-40 pointer-events-none" />
        <main className="relative z-10 w-full pt-24">
          <VpsStoragePage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
