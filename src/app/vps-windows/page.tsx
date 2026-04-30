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
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
        <Navbar variant="light" />
        <main className="w-full pt-24">
          <VpsWindowsPage />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
