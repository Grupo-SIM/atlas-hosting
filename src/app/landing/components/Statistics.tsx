"use client";

import Link from "next/link";
import CountUp from "./CountUp";
import { ArrowRight } from "lucide-react";
import { Rajdhani } from 'next/font/google';
import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-rajdhani"
});

const stats = [
  {
    value: 0,
    suffix: "K+",
    label: "Sites desenvolvidos",
  },
  {
    value: 0,
    suffix: "K+",
    label: "Clientes satisfeitos",
  },
  {
    value: 0,
    suffix: "+",
    label: "Anos de Experiência no mercado",
  },
  {
    value: 0,
    suffix: "",
    label: "Avaliação média",
  },
];

export function Statistics() {
  const bannerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: bannerRef,
    offset: ["start end", "end start"]
  });
  
  // Parallax effect: moves -20% vertically as user scrolls
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section className="bg-[#0a0e27] relative w-full pt-20 overflow-hidden">
      {/* World Map Background Image */}
      <div className="absolute inset-0 z-[1] pointer-events-none flex justify-center items-start pt-8">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/2000px-World_map_-_low_resolution.svg.png"
          alt=""
          className="w-full max-w-5xl opacity-[0.07] select-none pointer-events-none object-contain"
          style={{ filter: "invert(1) brightness(10)" }}
          aria-hidden="true"
        />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10 px-4">
        {/* Texto Principal */}
        <div className="text-center mb-16 pt-10 animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          <h2 className={`${rajdhani.className} text-[2.5rem] md:text-[2.8rem] font-bold text-white mb-6 leading-[1.1] tracking-tight`}>
            Performance Garantida,<br className="hidden md:block" />
            preço justo, retorno real
          </h2>
          <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto mb-8 font-medium delay-100">
            Você trabalha muito, seu negócio merece um lugar que valorize isso!
          </p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="flex flex-col md:flex-row w-full max-w-5xl mx-auto gap-1 md:gap-4 lg:gap-5 justify-center mb-24">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="flex-1 min-w-[200px] relative flex flex-col items-center justify-center text-center px-4 py-12 bg-[#0e132e]/60 border-b-[4px] border-[#01FC8D] rounded-t-[10px] shadow-lg backdrop-blur-sm"
            >
              <div className="mb-2">
                <span className={`${rajdhani.className} text-[40px] md:text-[50px] font-bold text-[#01FC8D] flex items-baseline justify-center`}>
                  <CountUp
                    from={0}
                    to={stat.value}
                    separator=""
                    direction="up"
                    duration={2}
                    decimals={stat.value % 1 !== 0 ? 1 : 0}
                    className="count-up-text"
                  />
                  <span>{stat.suffix}</span>
                </span>
              </div>
              <p className="text-white text-[12px] md:text-[13px] tracking-wide font-medium uppercase opacity-90">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Section - Your Success Digital */}
      <div ref={bannerRef} className="relative w-full h-[550px] md:h-[650px] lg:h-[700px] overflow-hidden mt-10">
        {/* Static Background Image first for instant load, parallax only if JS arrives */}
        <div 
          className="absolute inset-0 z-0 w-full h-full"
        >
          <img 
             src="/imgs/digital_sucess.jpg" 
             alt="Digital Success" 
             className="w-full h-full object-cover object-top opacity-100" 
             {...({ fetchPriority: "high" } as any)}
             loading="eager"
          />
        </div>
        
        {/* Overlays */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-r from-[#0a0e27] via-[#0a0e27]/40 to-transparent"></div>
        <div className="absolute inset-0 z-[1] bg-black/20"></div>

        <div className="container mx-auto max-w-7xl relative z-10 px-6 h-full flex items-center">
          <div className="max-w-xl">
            <h2 
              className={`${rajdhani.className} text-[2.5rem] md:text-[3.2rem] font-bold text-white mb-6 leading-tight tracking-tight uppercase animate-in fade-in slide-in-from-bottom-2 duration-500 delay-[200ms] fill-mode-both`}
            >
              Seu sucesso digital <br/> começa aqui
            </h2>
            
            <p 
              className="text-base md:text-[17px] text-gray-400 mb-10 font-medium leading-relaxed max-w-lg animate-in fade-in slide-in-from-bottom-2 duration-500 delay-[300ms] fill-mode-both"
            >
              Tenha desempenho incomparável para seu site, hospedagem de alta velocidade e segurança em que você pode confiar. Seu crescimento é o nosso objetivo.
            </p>
            
            <div className="animate-in fade-in zoom-in-95 duration-500 delay-[400ms] fill-mode-both">
              <Link href="#planos" className="inline-flex items-center justify-center bg-[#01FC8D] hover:bg-[#01FC8D]/90 text-[#0a0e27] font-extrabold uppercase px-10 py-6 rounded-[4px] text-xs tracking-widest gap-2 shadow-[0_8px_20px_0_rgba(1,252,141,0.2)] transition-all hover:scale-105 group">
                ver planos 
                <svg aria-hidden="true" className="w-4 h-4 fill-current transition-transform group-hover:translate-x-1" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg">
                  <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z"></path>
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

