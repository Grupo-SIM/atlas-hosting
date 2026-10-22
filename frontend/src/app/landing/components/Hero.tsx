"use client";

import { Search, Shield } from "lucide-react";
import { Roboto } from "next/font/google";
import { useState } from "react";

import { OfferModal } from "./OfferModal";

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
  weight: ["100", "300", "400", "500", "700", "900"],
});

export function Hero() {
  const [domain, setDomain] = useState("");
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const handleSearch = () => {
    const query = domain.trim();
    if (!query) return;
    window.location.href = `/domains/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <section className="relative h-auto min-h-[500px] w-full overflow-hidden bg-transparent">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(74%_46%_at_50%_56%,rgba(0,163,255,0.08)_0%,rgba(0,163,255,0.03)_36%,rgba(0,163,255,0)_74%)]" />
      <div className="pointer-events-none absolute top-0 left-1/2 h-14 w-[min(1000px,88vw)] -translate-x-1/2 bg-[linear-gradient(180deg,rgba(0,163,255,0.08)_0%,rgba(0,163,255,0.03)_38%,rgba(0,163,255,0)_100%)] blur-[10px]" />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          alt=""
          className="h-full w-full object-cover opacity-100"
          src="/Camada_landing.svg"
        />
      </div>

      <div className="relative z-10 flex w-full flex-col items-center px-4 pt-28 pb-8 md:px-[clamp(1.25rem,3vw,1.75rem)] md:pt-32 md:pb-12 lg:pt-36">
        <div className="flex w-full max-w-[2400px] flex-col items-center gap-8 md:gap-12">
          {/* Barra de busca - Responsive Width */}
          <div className="w-full max-w-2xl px-2 md:px-0">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <Search className="h-4 w-4 shrink-0 text-slate-400" />
              <input
                className={`${roboto.className} h-10 w-full border-none bg-transparent text-[14px] text-slate-700 outline-none placeholder:text-slate-400 md:text-[15px]`}
                onChange={e => setDomain(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Encontre um domínio"
                type="text"
                value={domain}
              />
              <button
                className={`${roboto.className} shrink-0 cursor-pointer rounded-lg border-none bg-[#00A3FF] px-6 py-2.5 font-bold text-[13px] text-white uppercase tracking-wider shadow-lg shadow-sky-500/20 transition-all hover:bg-[#0091E6] md:text-[14px]`}
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Video Container - Optimized for mobile aspect ratio */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.1)] md:aspect-video md:max-h-[68vh]">
            <video
              autoPlay
              className="absolute inset-0 h-full w-full object-cover"
              loop
              muted
              playsInline
              preload="metadata"
            >
              <source
                src="/vecteezy_powerful-server-room-in-modern-data-center-cloud-computing_7999282.mp4"
                type="video/mp4"
              />
              <source
                src="/vecteezy_powerful-server-room-in-modern-data-center-cloud-computing_7999282.mov"
                type="video/quicktime"
              />
            </video>

            {/* Overlays */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center px-6 md:px-[clamp(1.5rem,6vw,5rem)]">
              <div className="w-full max-w-[580px] text-center md:text-left">
                <h1
                  className={`${roboto.className} mb-4 font-bold text-[2rem] text-white leading-[1.1] drop-shadow-2xl sm:text-[2.5rem] md:mb-6 md:text-[3.8rem]`}
                >
                  Receba até R$250,00 de volta!
                </h1>

                <p
                  className={`${roboto.className} mx-auto mb-8 max-w-[440px] text-[14px] text-white/90 leading-relaxed sm:text-[16px] md:mx-0 md:mb-10 md:text-[1.05rem]`}
                >
                  A única hospedagem do Brasil com cashback
                </p>

                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row md:justify-start">
                  <button
                    className={`${roboto.className} w-fit cursor-pointer rounded-[12px] border-2 border-white bg-transparent px-12 py-4 font-bold text-[14px] text-white uppercase tracking-wider transition-colors hover:bg-white/10 sm:w-auto md:text-[15px]`}
                    onClick={() => setIsOfferModalOpen(true)}
                    type="button"
                  >
                    Ganhar agora
                  </button>

                  <div className="flex items-center gap-2 text-[12px] text-white/70 md:text-[13px]">
                    <Shield className="h-4 w-4 text-emerald-400" />
                    <span>Garantia de 30 dias</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OfferModal onOpenChange={setIsOfferModalOpen} open={isOfferModalOpen} />
    </section>
  );
}
