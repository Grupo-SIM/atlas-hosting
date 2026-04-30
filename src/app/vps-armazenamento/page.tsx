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
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
        <Navbar variant="light" />
        <main className="w-full pt-24">
          <VpsStoragePage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
