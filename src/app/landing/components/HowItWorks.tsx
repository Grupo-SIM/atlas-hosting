"use client";

import Link from "next/link";
import { CircleCheck, ArrowRight } from "lucide-react";
import Image from "next/image";

const features = [
  "SERVIDORES NO BRASIL",
  "CASHBACK TODOS OS MESES",
  "PROGRAMA DE AFILIADOS",
  "ALTA VELOCIDADE",
  "BENEFÍCIOS EXCLUSIVOS",
  "ATENDIMENTO NO WHATSAPP",
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#000319' }}>
      {/* Gradiente suave do canto inferior direito */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at bottom right, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.05) 40%, transparent 70%)'
        }}
      />
      
      {/* Background com estrelas/pontos */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Lado Esquerdo - Imagem */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden">
              <div className="relative w-full">
                <Image
                  src="/hosting2.png"
                  alt="Hospedagem de sites"
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Lado Direito - Conteúdo */}
          <div className="space-y-8">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 border border-white/30 px-4 py-1 bg-white/10 backdrop-blur-md rounded-2xl mb-6">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm font-bold text-white">COMO FUNCIONA?</span>
              </div>
              
              {/* Título */}
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Hospedar seu site
                <br />
                nunca foi tão{" "}
                <span className="text-green-400">fácil</span>
              </h2>

              {/* Descrição */}
              <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
                Nossa interface é altamente simples e intuitiva para que você com
                pouquíssimos cliques coloque seu site rapidamente no ar.
              </p>
            </div>

            {/* Lista de Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-2xl border border-white/30 bg-white/10 backdrop-blur-md hover:bg-white/15 transition-colors"
                >
                  <CircleCheck className="flex-shrink-0 w-5 h-5 text-green-500" />
                  <span className="text-white font-medium text-sm md:text-base">
                    {feature}
                  </span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <Link
                href="#plans"
                className="custom-animated-button inline-flex items-center gap-2"
              >
                VER PLANOS
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/signup"
                className="cta"
              >
                <span className="hover-underline-animation">Comece agora</span>
                <ArrowRight className="h-5 w-5 text-white" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

