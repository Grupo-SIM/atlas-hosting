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
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
        <Navbar variant="light" />
        <main className="w-full pt-24">
          <VpsCloudPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
