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
    <>
      {/* Video Background Section */}
      <div className="min-h-screen bg-[#0a0e27] text-white overflow-hidden relative w-full" style={{ width: '100vw', marginLeft: 'calc(50% - 50vw)', marginRight: 'calc(50% - 50vw)' }}>
        <div className="absolute inset-0 z-0 overflow-hidden" style={{ width: '100vw', left: '50%', transform: 'translateX(-50%)' }}>
          <div style={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100vw',
            height: '56.25vw',
            minHeight: '100vh',
            minWidth: '177.77vh',
            transform: 'translate(-50%, -50%)'
          }}>
            <iframe
              className="hidden md:block"
              src="https://www.youtube.com/embed/Z4F3AXvrLKo?controls=0&rel=0&playsinline=1&cc_load_policy=0&enablejsapi=1&autoplay=1&mute=1&loop=1&playlist=Z4F3AXvrLKo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ 
                pointerEvents: 'none', 
                width: '100%', 
                height: '100%',
                border: 'none',
                position: 'absolute',
                top: 0,
                left: 0
              }}
            />
          </div>
          <div className="absolute inset-0 bg-black/50" />
        </div>

        <div className="relative z-10 pt-16">
          <main className="container mx-auto px-6 pt-16 pb-24">
            <div className="flex flex-col items-center justify-center gap-8 max-w-5xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-4 flex-wrap">
                <img 
                  src="https://atlashosting.com.br/wp-content/uploads/2025/04/rating_4.png" 
                  alt="Google Rating" 
                  className="h-auto w-auto max-h-16" 
                />
                <img 
                  src="https://atlashosting.com.br/wp-content/uploads/2025/04/rating_5.png" 
                  alt="Trustpilot" 
                  className="h-auto w-auto max-h-16" 
                />
                <img 
                  src="https://atlashosting.com.br/wp-content/uploads/2025/04/rating_1.png" 
                  alt="Capterra" 
                  className="h-auto w-auto max-h-16" 
                />
              </div>
              <h1 className={`${rajdhani.className} text-5xl md:text-7xl font-black text-center leading-tight max-w-4xl`}>
                Hospede seu site e receba<br />
                <span>100% do valor de volta</span>
              </h1>
              <p className={`${rajdhani.className} text-lg md:text-xl text-gray-300 text-center`}>
                Feito pra quem quer mais do que só<br />
                <span className="text-gray-400">"está no ar"</span>
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button className="bg-emerald-400 hover:bg-emerald-500 text-black font-bold px-8 py-3 text-base uppercase" asChild>
                  <Link href="#planos">VER PLANOS</Link>
                </Button>
                <Button className="border-2 border-cyan-400 text-cyan-400 hover:bg-cyan-400/10 font-bold px-8 py-3 text-base uppercase bg-transparent" asChild>
                  <Link href="/signup">ABRIR CONTA</Link>
                </Button>
              </div>
            </div>
          </main>

          {/* Features Section */}
          <section className="w-full py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div 
          className="border border-white/17 rounded-[15px] py-8 px-12 relative overflow-hidden"
          style={{
            backgroundColor: '#0A1029',
            marginTop: '-5em',
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: '0px',
            alignItems: 'center',
            minHeight: '170px',
          }}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 rounded-[15px]"
            style={{
              backgroundImage: `url('https://atlashosting.com.br/wp-content/uploads/2025/04/bg_img1.png')`,
              zIndex: 0,
            }}
          />
          <div className="relative z-10 w-full">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 w-full">
            {/* Left Section - Title */}
            <div className="flex-shrink-0">
              <h2 className={`${rajdhani.className} text-2xl md:text-3xl font-bold leading-tight text-white`}>
                Hospedagem inteligente,<br />
                retorno garantido
              </h2>
            </div>
            
            {/* Middle Section - 3 Features */}
            <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-6">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-1">
                  <Wifi className="w-10 h-10 text-[#01FC8D]" strokeWidth={2.5} />
                </div>
                <h3 className={`${rajdhani.className} font-semibold text-base text-white leading-snug`}>
                  Velocidade e<br />estabilidade
                </h3>
              </div>
              
              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-1">
                  <Globe className="w-10 h-10 text-[#01FC8D]" strokeWidth={2.5} />
                </div>
                <h3 className={`${rajdhani.className} font-semibold text-base text-white leading-snug`}>
                  Alcance global,<br />estrutura local
                </h3>
              </div>
              
              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="mb-1">
                  <Lock className="w-10 h-10 text-[#01FC8D]" strokeWidth={2.5} />
                </div>
                <h3 className={`${rajdhani.className} font-semibold text-base text-white leading-snug`}>
                  Proteção ativa<br />24h por dia
                </h3>
              </div>
            </div>
            
            {/* Right Section - High Performance */}
            <div className="flex-shrink-0 flex flex-col items-center md:items-end">
              <div className={`${rajdhani.className} text-sm font-thin text-white  uppercase tracking-wider`}>
                ALTA PERFORMANCE
              </div>
              <div className="flex flex-row items-center gap-2">
                <div className="p-3 rounded-full border-2 border-[#01FC8D] bg-transparent">
                  <Building2 className="w-7 h-7 text-[#01FC8D]" strokeWidth={2.5} />
                </div>
                <h3 className={`${rajdhani.className} font-thin text-2xl text-[#01FC8D]`}>
                  Foco em negócios
                </h3>
              </div>
            </div>
          </div>
          </div>
        </div>
      </div>
    </section>
        </div>
      </div>
    </>
  );
}

