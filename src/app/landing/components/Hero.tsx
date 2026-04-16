"use client";

import { useState } from "react";
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
      className="relative w-full h-auto min-h-[500px] md:h-screen md:min-h-[600px] overflow-hidden bg-[linear-gradient(180deg,#061224_0%,#07182b_36%,#081427_66%,#08091a_100%)]"
    >
      <div
        className="absolute inset-0 pointer-events-none bg-[radial-gradient(74%_46%_at_50%_56%,rgba(1,252,141,0.14)_0%,rgba(1,252,141,0.05)_36%,rgba(1,252,141,0)_74%)]"
      />
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[min(1000px,88vw)] h-14 pointer-events-none bg-[linear-gradient(180deg,rgba(1,252,141,0.14)_0%,rgba(1,252,141,0.05)_38%,rgba(1,252,141,0)_100%)] blur-[10px]"
      />
      
      <div className="relative z-10 flex flex-col items-center pt-24 pb-20 md:pb-12 px-4 md:pt-[min(10vh,6.25rem)] md:px-[clamp(1.25rem,3vw,1.75rem)] w-full">
        <div className="flex flex-col items-center w-full max-w-[2400px] gap-4 md:gap-[0.8rem]">
          
          {/* Barra de busca - Responsive Width */}
          <div className="w-full max-w-2xl px-2 md:px-0">
            <div className="flex items-center gap-2 bg-white/[0.14] border border-white/[0.26] rounded-xl p-1.5 pl-4 backdrop-blur-lg shadow-[0_8px_24px_rgba(0,0,0,0.22),inset_0_1px_0_rgba(255,255,255,0.12)]">
              <Search className="w-4 h-4 text-white/70 shrink-0" />
              <input
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                placeholder="Domínio que você quer conquistar..."
                className={`${roboto.className} w-full bg-transparent border-none outline-none text-white/95 text-[14px] md:text-[15px] h-10`}
              />
              <button
                className={`${roboto.className} bg-[#01FC8D] text-[#0a0e27] border-none rounded-lg px-6 py-2.5 text-[13px] md:text-[14px] font-bold uppercase tracking-wider hover:brightness-110 transition-all shrink-0 cursor-pointer`}
                onClick={handleSearch}
              >
                Buscar
              </button>
            </div>
          </div>

          {/* Video Container - Optimized for mobile aspect ratio */}
          <div className="relative w-full aspect-[4/5] md:aspect-video md:max-h-[68vh] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
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
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#08091a]/80 via-transparent to-transparent pointer-events-none" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-center px-6 md:px-[clamp(1.5rem,6vw,5rem)]">
              <div className="max-w-[580px] w-full text-center md:text-left">
                <h1
                  className={`${roboto.className} text-[2rem] sm:text-[2.5rem] md:text-[3.8rem] font-bold leading-[1.1] text-white mb-4 md:mb-6 text-shadow-xl drop-shadow-2xl`}
                >
                  Seu sucesso online<br />começa agora
                </h1>

                <p
                  className={`${roboto.className} text-[14px] sm:text-[16px] md:text-[1.05rem] text-white/80 mb-8 md:mb-10 leading-relaxed max-w-[440px] mx-auto md:mx-0`}
                >
                  Do domínio ao servidor de alta performance —
                  coloque seu projeto no ar em minutos, com suporte 24/7.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4">
                  <button
                    className={`${roboto.className} bg-white text-[#08091a] border-none rounded-lg px-10 py-4 text-[14px] md:text-[15px] font-bold tracking-wider uppercase shadow-xl hover:bg-gray-100 transition-colors w-full sm:w-auto cursor-pointer`}
                  >
                    Começar agora
                  </button>
                  
                  <div className="flex items-center gap-2 text-[12px] md:text-[13px] text-white/50">
                    <Shield className="w-4 h-4 text-[#01FC8D]" />
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
