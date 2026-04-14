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
      <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0e27]">
        <Navbar />
        <main className="w-full">
          <VpsCloudPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
