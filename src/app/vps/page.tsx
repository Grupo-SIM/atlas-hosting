import type { Metadata } from "next";
import { Navbar } from "../landing/components/Navbar";
import { VpsCloudPage } from "../landing/components/VpsCloudPage";
import { Footer } from "../landing/components/Footer";
import { SmoothScroll } from "../landing/components/SmoothScroll";

export const metadata: Metadata = {
  title: "VPS em nuvem | Atlas Hosting",
  description:
    "Planos Cloud VPS com ótimo custo-benefício: vCPU, RAM NVMe, instantâneos, tráfego e proteção DDoS. Compare e comece em minutos.",
};

export default function VpsPage() {
  return (
    <SmoothScroll>
      <div className="min-h-screen w-full overflow-x-hidden bg-atlas-dark-1 selection:bg-sky-500/30">
        <Navbar />
        
        {/* Background Gradient */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-landing-gradient" />
        </div>

        <main className="relative z-10 w-full pt-24">
          <VpsCloudPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
