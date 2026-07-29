import type { Metadata } from "next";
import { Footer } from "../landing/components/Footer";
import { Navbar } from "../landing/components/Navbar";
import { SmoothScroll } from "../landing/components/SmoothScroll";
import { VpsCloudPage } from "../landing/components/VpsCloudPage";

export const metadata: Metadata = {
  description:
    "Planos Cloud VPS com ótimo custo-benefício: vCPU, RAM NVMe, instantâneos, tráfego e proteção DDoS. Compare e comece em minutos.",
  title: "VPS em nuvem | Atlas Hosting",
};

export default function VpsPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#00050A] selection:bg-sky-500/30">
        <Navbar />

        {/* Background Gradient - Removed for darker look as requested */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <div className="absolute inset-0 bg-[#00050A]" />
        </div>

        <main className="relative z-10 w-full pt-24">
          <VpsCloudPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
