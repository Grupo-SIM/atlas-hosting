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
      <div className="min-h-screen w-full overflow-x-hidden bg-[#0a0e27]">
        <Navbar />
        <main className="w-full">
          <VdsPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
