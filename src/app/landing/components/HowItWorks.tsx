"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { motion } from "motion/react";

const features = [
  "Servidores no brasil",
  "Cashback todos os meses",
  "Programa de afiliados",
  "alta velocidade",
  "benefícios exclusivos",
  "Atendimento no WhatsAPP",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-[#0a0e27] relative w-full">
      <div className="container mx-auto px-2 md:px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Lado Esquerdo - Imagem com borda verde e cortes no canto */}
          <div className="relative w-full max-w-[550px] mx-auto animate-in fade-in slide-in-from-left-10 duration-700 fill-mode-both">
            {/* ... image content ... */}
            <div
              className="relative w-full"
              style={{
                padding: "6px",
                background: "#01FC8D",
                clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 80px), calc(100% - 80px) 100%, 0 100%)",
                borderRadius: "20px 20px 0 20px",
              }}
            >
              <div
                className="relative w-full h-[420px] md:h-[560px] overflow-hidden bg-[#0a0e27]"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 76px), calc(100% - 76px) 100%, 0 100%)",
                  borderRadius: "15px 15px 0 15px",
                }}
              >
                <img
                  src="http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/2025/04/cybersecurity-woman-and-writing-global-location-info-with-map-graphic-for-phishing-and-hacker-data.jpg"
                  alt="Como Funciona o Atlas"
                  className="w-full h-full object-cover object-center"
                  {...({ fetchPriority: "high" } as any)}
                />
              </div>
            </div>
          </div>

          {/* Lado Direito - Conteúdo */}
          <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-right-10 duration-700 delay-150 fill-mode-both">
            {/* Badge "Como funciona?" */}
            <div className="inline-flex items-center gap-2 self-start bg-[#0e132e] border border-white/10 px-3 py-1.5 rounded-sm animate-in fade-in slide-in-from-bottom-5 duration-500 delay-300 fill-mode-both">
              <div className="w-[3px] h-4 bg-[#01FC8D] rounded-full" />
              <span className="text-[11px] font-bold tracking-widest text-[#01FC8D] uppercase">
                Como funciona?
              </span>
            </div>

            {/* Título */}
            <h2 className="text-[2rem] md:text-[2.5rem] font-bold text-white leading-tight">
              Hospedar seu site nunca foi tão fácil
            </h2>

            {/* Descrição */}
            <p className="text-[14px] md:text-[15px] text-gray-400 leading-relaxed max-w-md">
              Nossa interface é altamente simples e intuitiva para que você com pouquíssimos cliques coloque seu site rapidamente no ar.
            </p>

            {/* Grid de features — 2 colunas de chips */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 5 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "200px" }}
                  transition={{ duration: 0.2, delay: 0.05 * index }}
                  className="flex items-center gap-2.5 border border-[#01FC8D] rounded-[4px] px-3 py-2.5 bg-transparent"
                >
                  {/* Ícone circular preenchido com check */}
                  <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0 fill-[#01FC8D]" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/>
                  </svg>
                  <span className="text-[#01FC8D] text-[11px] md:text-[12px] font-bold uppercase tracking-wide leading-snug">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            {/* CTA Row */}
            <div className="flex flex-row items-center gap-6 mt-2">
              <Link
                href="#planos"
                className="inline-flex items-center gap-1.5 bg-[#01FC8D] hover:bg-[#01FC8D]/90 text-[#0a0e27] font-extrabold uppercase text-[11px] tracking-widest px-6 py-4 rounded-[4px] transition-all hover:scale-105 shadow-[0_4px_14px_0_rgba(1,252,141,0.2)] group"
              >
                ver planos
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="#planos"
                className="text-white hover:text-[#01FC8D] font-bold text-[15px] transition-colors underline underline-offset-4 decoration-[#01FC8D]/80 hover:decoration-[#01FC8D]"
              >
                Comece agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

