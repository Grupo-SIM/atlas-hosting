import type { Metadata } from "next";
import { Footer } from "../landing/components/Footer";
import { Navbar } from "../landing/components/Navbar";
import { SmoothScroll } from "../landing/components/SmoothScroll";
import { VpsStoragePage } from "../landing/components/VpsStoragePage";

export const metadata: Metadata = {
  description:
    "Planos VPS de armazenamento com SSD de alta capacidade, tráfego ilimitado e melhor custo-benefício para aplicações que exigem espaço e performance.",
  title: "VPS de Armazenamento | Atlas Hosting",
};

export default function VpsStorageRoutePage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#00050A] selection:bg-sky-500/30">
        <Navbar />
        {/* Background Gradient - Removed for darker look as requested */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[#00050A] opacity-100" />
        <main className="relative z-10 w-full pt-24">
          <VpsStoragePage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
