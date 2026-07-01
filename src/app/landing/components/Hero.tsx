"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Shield } from "lucide-react";
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-roboto"
});

export function Hero() {
  const [domain, setDomain] = useState("");
  const handleSearch = () => {
    const query = domain.trim();
    if (!query) return;
    window.location.href = `/domains/search?q=${encodeURIComponent(query)}`;
  };

  return (
    <section
      className="relative w-full h-auto min-h-[500px] overflow-hidden bg-transparent"
    >
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(74%_46%_at_50%_56%,rgba(0,163,255,0.08)_0%,rgba(0,163,255,0.03)_36%,rgba(0,163,255,0)_74%)]"
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,88vw)] h-14 pointer-events-none bg-[linear-gradient(180deg,rgba(0,163,255,0.08)_0%,rgba(0,163,255,0.03)_38%,rgba(0,163,255,0)_100%)] blur-[10px]"
      />

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <img
          src="/Camada_landing.svg"
          alt=""
          className="w-full h-full object-cover opacity-100"
        />
      </div>

      <div className="relative z-10 flex flex-col items-center pt-28 md:pt-32 lg:pt-36 pb-8 md:pb-12 px-4 md:px-[clamp(1.25rem,3vw,1.75rem)] w-full">
        <div className="flex flex-col items-center w-full max-w-[2400px] gap-8 md:gap-12">

          {/* Barra de busca - Responsive Width */}
          <div className="w-full max-w-2xl px-2 md:px-0">
            <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1.5 pl-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Encontre um domínio"
                className={`${roboto.className} w-full bg-transparent border-none outline-none text-slate-700 text-[14px] md:text-[15px] h-10 placeholder:text-slate-400`}
              />
              <button
                className={`${roboto.className} bg-[#00A3FF] text-white border-none rounded-lg px-6 py-2.5 text-[13px] md:text-[14px] font-bold uppercase tracking-wider hover:bg-[#0091E6] transition-all shrink-0 cursor-pointer shadow-lg shadow-sky-500/20`}
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Video Container - Optimized for mobile aspect ratio */}
          <div className="relative w-full aspect-[4/5] md:aspect-video md:max-h-[68vh] rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-100">
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/vecteezy_powerful-server-room-in-modern-data-center-cloud-computing_7999282.mp4" type="video/mp4" />
              <source src="/vecteezy_powerful-server-room-in-modern-data-center-cloud-computing_7999282.mov" type="video/quicktime" />
            </video>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center px-6 md:px-[clamp(1.5rem,6vw,5rem)]">
              <div className="max-w-[580px] w-full text-center md:text-left">
                <h1
                  className={`${roboto.className} text-[2rem] sm:text-[2.5rem] md:text-[3.8rem] font-bold leading-[1.1] text-white mb-4 md:mb-6 drop-shadow-2xl`}
                >
                  Receba R$250,00 de volta!
                </h1>

                <p
                  className={`${roboto.className} text-[14px] sm:text-[16px] md:text-[1.05rem] text-white/90 mb-8 md:mb-10 leading-relaxed max-w-[440px] mx-auto md:mx-0`}
                >
                  A única hospedagem do Brasil com 100% de Cashback
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                  <Link
                    href="#plans"
                    className={`${roboto.className} bg-transparent border-2 border-white text-white rounded-[12px] px-12 py-4 text-[14px] md:text-[15px] font-bold tracking-wider uppercase hover:bg-white/10 transition-colors w-fit sm:w-auto cursor-pointer`}
                  >
                    Resgatar minha oferta
                  </Link>

                  <div className="flex items-center gap-2 text-[12px] md:text-[13px] text-white/70">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Garantia de 30 dias — sem risco</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
