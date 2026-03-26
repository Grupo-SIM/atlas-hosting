"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wifi, Globe, Lock, Building2 } from 'lucide-react';
import { Rajdhani } from 'next/font/google';

const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani"
});

export function Hero() {
  return (
    <section className="relative min-h-screen bg-[#0a0e27] text-white flex flex-col justify-between overflow-hidden">
      
        {/* YouTube Background Video - Lazy loaded to not block image loading */}
        <div id="hero-video-container" className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <iframe
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-30 scale-125 transition-opacity duration-1000"
            src="https://www.youtube.com/embed/Z4F3AXvrLKo?autoplay=1&mute=1&controls=0&loop=1&playlist=Z4F3AXvrLKo&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1"
            allow="autoplay; encrypted-media"
            frameBorder="0"
            loading="lazy"
            {...({ fetchPriority: "low" } as any)}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27]/90 via-[#0a0e27]/40 to-[#0a0e27]" />
        </div>

      {/* Main Hero Content */}
      <div className="relative z-10 flex-grow flex items-center justify-center pt-32 pb-16">
        <div className="container mx-auto px-6 text-center max-w-5xl flex flex-col items-center">
          
          {/* Ratings Grid - Exactly as Print */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center justify-center gap-4 md:gap-8 mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
            <img 
              src="http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/2025/04/rating_4.png" 
              alt="Google Rating" 
              className="h-9 md:h-12 w-auto opacity-100" 
              {...({ fetchPriority: "high" } as any)}
            />
            <img 
              src="http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/2025/04/rating_5.png" 
              alt="Trustpilot" 
              className="h-10 md:h-[50px] w-auto opacity-100" 
              {...({ fetchPriority: "high" } as any)}
            />
            <img 
              src="http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/2025/04/rating_1.png" 
              alt="Capterra" 
              className="h-8 md:h-10 w-auto opacity-100" 
              {...({ fetchPriority: "high" } as any)}
            />
          </div>

          <h1 className={`${rajdhani.className} text-[2.5rem] md:text-7xl font-bold leading-[1.1] mb-6 uppercase tracking-tight text-white animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[40ms] fill-mode-both`}>
            Hospede seu site e receba <br className="hidden md:block" />
            <span className="text-white">100% do valor de volta</span>
          </h1>

          <h4 className={`${rajdhani.className} text-xl md:text-2xl text-gray-400 font-medium mb-12 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[80ms] fill-mode-both`}>
            Feito pra quem quer mais do que só <br className="md:hidden" />
            “está no ar”
          </h4>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[120ms] fill-mode-both">
            <Button className={`${rajdhani.className} w-full sm:w-fit bg-[#01FC8D] hover:bg-[#01FC8D]/90 text-[#0a0e27] font-extrabold px-10 py-7 text-sm rounded-[4px] uppercase tracking-widest shadow-[0_8px_20px_rgba(1,252,141,0.2)] transition-all`} asChild>
              <Link href="#planos">ver planos</Link>
            </Button>
            <Button className={`${rajdhani.className} w-full sm:w-fit border-2 border-[#01FC8D] text-[#01FC8D] hover:bg-[#01FC8D]/5 font-extrabold px-10 py-7 text-sm rounded-[4px] uppercase tracking-widest bg-transparent transition-all`} asChild>
              <Link href="#planos">abrir conta</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Features Bar */}
      <div className="relative z-10 w-full mb-10 px-6">
        <div className="container mx-auto">
          <div className="bg-[#0A1029]/80 backdrop-blur-md border border-white/5 rounded-[15px] p-8 md:p-12 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[160ms] fill-mode-both">
             {/* Subtle Pattern */}
             <div 
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `url('https://atlashosting.com.br/wp-content/uploads/2025/04/bg_img1.png')`,
                backgroundSize: 'cover',
                mixBlendMode: 'overlay'
              }}
            />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-6">
              <div className="text-center lg:text-left animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[200ms] fill-mode-both">
                <h2 className={`${rajdhani.className} text-2xl md:text-3xl font-bold leading-tight uppercase`}>
                  Hospedagem inteligente,<br className="hidden lg:block" />
                  retorno garantido
                </h2>
              </div>
              
              <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
                <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[240ms] fill-mode-both">
                  <Wifi className="w-10 h-10 text-[#01FC8D] mb-3" />
                  <h3 className={`${rajdhani.className} font-bold text-base uppercase leading-snug`}>
                    Velocidade e<br />estabilidade
                  </h3>
                </div>
                <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[280ms] fill-mode-both">
                  <Globe className="w-10 h-10 text-[#01FC8D] mb-3" />
                  <h3 className={`${rajdhani.className} font-bold text-base uppercase leading-snug`}>
                    Alcance global,<br />estrutura local
                  </h3>
                </div>
                <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[320ms] fill-mode-both">
                  <Lock className="w-10 h-10 text-[#01FC8D] mb-3" />
                  <h3 className={`${rajdhani.className} font-bold text-base uppercase leading-snug`}>
                    Proteção ativa<br />24h por dia
                  </h3>
                </div>
              </div>
              
              <div className="flex flex-col items-center lg:items-end animate-in fade-in slide-in-from-bottom-2 duration-300 delay-[360ms] fill-mode-both">
                <span className={`${rajdhani.className} text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-2`}>
                  ALTA PERFORMANCE
                </span>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-full border border-[#01FC8D]/30 bg-[#01FC8D]/5">
                    <Building2 className="w-6 h-6 text-[#01FC8D]" />
                  </div>
                  <h3 className={`${rajdhani.className} font-bold text-xl text-[#01FC8D] uppercase`}>
                    Negócios
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
