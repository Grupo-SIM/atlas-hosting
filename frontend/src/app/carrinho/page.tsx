import type { Metadata } from "next";
import { Footer } from "@/app/landing/components/Footer";
import { Navbar } from "@/app/landing/components/Navbar";
import { checkIsAuthenticated } from "@/lib/auth";
import { CartView } from "./CartView";

export const metadata: Metadata = {
  description:
    "Revise os domínios e servidores escolhidos e pague tudo de uma vez.",
  title: "Carrinho | Atlas Hosting",
};

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const isAuthenticated = await checkIsAuthenticated();

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#00050A] selection:bg-sky-500/30">
      <Navbar />

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[#00050A]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <main className="relative z-10 w-full pt-20 md:pt-32">
        <div className="mx-auto max-w-6xl px-4 pt-6 pb-16 md:px-8 md:pt-10 md:pb-24">
          <CartView isAuthenticated={isAuthenticated} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
