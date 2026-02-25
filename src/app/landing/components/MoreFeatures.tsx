"use client";

import { Gem, Settings, BarChart3, Trophy, Globe } from "lucide-react";
import { Iphone } from "@/registry/magicui/iphone";

const leftFeatures = [
  {
    icon: Gem,
    title: "Migração gratuita",
    description:
      "Já tem site em outro provedor? Nosso sistema facilitado resolve, sem dor de cabeça.",
  },
  {
    icon: BarChart3,
    title: "Pronto para negócios online",
    description:
      "Hospedagem preparada para lojas virtuais, funis, blogs e páginas de alta conversão.",
  },
  {
    icon: Globe,
    title: "CDN global incluso",
    description:
      "Seu site carrega rápido em qualquer lugar do mundo, com distribuição inteligente de conteúdo.",
  },
];

const rightFeatures = [
  {
    icon: Globe,
    title: "CDN global incluso",
    description:
      "Seu site carrega rápido em qualquer lugar do mundo, com distribuição inteligente de conteúdo.",
  },
  {
    icon: Settings,
    title: "Backups diários automáticos",
    description:
      "Recuperação fácil e rápida em caso de imprevistos — sem perder nada.",
  },
  {
    icon: Trophy,
    title: "Desenvolvimento de melhorias",
    description:
      "Estamos em constante desenvolvimento de novas ferramentas e melhorias baseadas no feedback dos nossos clientes.",
  },
];

export function MoreFeatures() {
  return (
    <section className="py-20 px-4 relative overflow-hidden bg-[#0a0a0a]">
      <div className="container mx-auto max-w-7xl">
        {/* Badge e Título */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <span className="text-green-400 text-sm font-semibold uppercase tracking-wide">
              ACHOU QUE ERA SÓ ISSO?
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            A cada mês, sua hospedagem fica mais completa, moderna e eficiente
          </h2>
        </div>

        {/* Grid com 5 cards: 2 esquerda, 1 centro, 2 direita */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-6xl mx-auto items-stretch">
          {/* Cards da esquerda */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {leftFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 flex flex-col items-center text-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-green-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }} />
                </div>
              );
            })}
          </div>

          {/* Card central menor com celular */}
          <div className="md:col-span-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center relative overflow-hidden">
            {/* Gradiente de baixo para cima no card */}
            <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-green-500/20 via-green-500/10 to-transparent pointer-events-none rounded-b-2xl" />
            
            {/* Texto acima do celular */}
            <div className="text-center mb-4 relative z-10">
              <div className="w-10 h-10 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center mb-3 mx-auto">
                <Globe className="h-5 w-5 text-green-400" strokeWidth={2} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Interface Intuitiva
              </h3>
              <p className="text-white/80 text-xs leading-relaxed max-w-md">
                Painel de controle moderno e fácil de usar, desenvolvido para simplificar o gerenciamento do seu site.
              </p>
            </div>

            {/* Smartphone com gradiente no final */}
            <div className="relative w-full max-w-[180px] mt-auto mx-auto z-10">
              <div className="relative">
                <Iphone 
                  className="h-full"
                  src={`data:image/svg+xml,${encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="389.5" height="843.5" viewBox="0 0 389.5 843.5" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="bottomGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="60%" style="stop-color:#0a0a0a;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#0a0a0a;stop-opacity:0" />
                        </linearGradient>
                      </defs>
                      <!-- Background -->
                      <rect fill="#0a0a0a" width="389.5" height="843.5"/>
                      
                      <!-- Status Bar -->
                      <rect fill="#111" x="0" y="0" width="389.5" height="40"/>
                      <text x="194.75" y="25" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">9:41</text>
                      <circle cx="355" cy="20" r="4" fill="#fff"/>
                      <circle cx="370" cy="20" r="4" fill="#fff"/>
                      <circle cx="380" cy="20" r="4" fill="#fff"/>
                      <rect x="345" y="18" width="8" height="6" rx="1" fill="#22c55e"/>
                      
                      <!-- Header -->
                      <rect fill="#111" x="0" y="40" width="389.5" height="70"/>
                      <text x="194.75" y="70" dominant-baseline="middle" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-size="20" font-weight="bold">Atlas Hosting</text>
                      <text x="194.75" y="95" dominant-baseline="middle" text-anchor="middle" fill="#888" font-family="Arial, sans-serif" font-size="11">Dashboard</text>
                      
                      <!-- Stats Cards -->
                      <rect x="15" y="120" width="170" height="80" rx="8" fill="#111" stroke="#22c55e" stroke-width="1" opacity="0.3"/>
                      <text x="100" y="150" dominant-baseline="middle" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-size="24" font-weight="bold">12</text>
                      <text x="100" y="175" dominant-baseline="middle" text-anchor="middle" fill="#888" font-family="Arial, sans-serif" font-size="11">Sites Ativos</text>
                      
                      <rect x="204.5" y="120" width="170" height="80" rx="8" fill="#111" stroke="#22c55e" stroke-width="1" opacity="0.3"/>
                      <text x="289.5" y="150" dominant-baseline="middle" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-size="24" font-weight="bold">8</text>
                      <text x="289.5" y="175" dominant-baseline="middle" text-anchor="middle" fill="#888" font-family="Arial, sans-serif" font-size="11">Domínios</text>
                      
                      <!-- Site List -->
                      <rect x="15" y="220" width="359.5" height="120" rx="8" fill="#111" stroke="#22c55e" stroke-width="1" opacity="0.2"/>
                      <text x="194.75" y="245" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Meus Sites</text>
                      
                      <!-- Site Item 1 -->
                      <rect x="25" y="260" width="339.5" height="35" rx="6" fill="#1a1a1a"/>
                      <circle cx="45" cy="277.5" r="10" fill="#22c55e" opacity="0.3"/>
                      <circle cx="45" cy="277.5" r="5" fill="#22c55e"/>
                      <text x="65" y="270" fill="#fff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">meusite.com.br</text>
                      <text x="65" y="285" fill="#888" font-family="Arial, sans-serif" font-size="9">Online • 99.9%</text>
                      <rect x="330" y="265" width="30" height="20" rx="4" fill="#22c55e" opacity="0.2"/>
                      <text x="345" y="275" dominant-baseline="middle" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-size="9" font-weight="bold">Ativo</text>
                      
                      <!-- Site Item 2 -->
                      <rect x="25" y="300" width="339.5" height="35" rx="6" fill="#1a1a1a"/>
                      <circle cx="45" cy="317.5" r="10" fill="#22c55e" opacity="0.3"/>
                      <circle cx="45" cy="317.5" r="5" fill="#22c55e"/>
                      <text x="65" y="310" fill="#fff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">loja.com.br</text>
                      <text x="65" y="325" fill="#888" font-family="Arial, sans-serif" font-size="9">Online • 99.8%</text>
                      <rect x="330" y="305" width="30" height="20" rx="4" fill="#22c55e" opacity="0.2"/>
                      <text x="345" y="315" dominant-baseline="middle" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-size="9" font-weight="bold">Ativo</text>
                      
                      <!-- Usage Chart -->
                      <rect x="15" y="360" width="359.5" height="130" rx="8" fill="#111" stroke="#22c55e" stroke-width="1" opacity="0.2"/>
                      <text x="194.75" y="385" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="14" font-weight="bold">Uso de Recursos</text>
                      
                      <!-- Storage Bar -->
                      <text x="25" y="410" fill="#888" font-family="Arial, sans-serif" font-size="10">Armazenamento</text>
                      <rect x="25" y="415" width="339.5" height="12" rx="6" fill="#1a1a1a"/>
                      <rect x="25" y="415" width="169.75" height="12" rx="6" fill="#22c55e"/>
                      <text x="355" y="421" dominant-baseline="middle" text-anchor="end" fill="#22c55e" font-family="Arial, sans-serif" font-size="9" font-weight="bold">50%</text>
                      
                      <!-- Bandwidth Bar -->
                      <text x="25" y="445" fill="#888" font-family="Arial, sans-serif" font-size="10">Largura de Banda</text>
                      <rect x="25" y="450" width="339.5" height="12" rx="6" fill="#1a1a1a"/>
                      <rect x="25" y="450" width="101.85" height="12" rx="6" fill="#22c55e"/>
                      <text x="355" y="456" dominant-baseline="middle" text-anchor="end" fill="#22c55e" font-family="Arial, sans-serif" font-size="9" font-weight="bold">30%</text>
                      
                      <!-- Quick Actions -->
                      <rect x="15" y="510" width="170" height="70" rx="8" fill="#111" stroke="#22c55e" stroke-width="1" opacity="0.2"/>
                      <text x="100" y="535" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Novo Site</text>
                      <rect x="60" y="545" width="80" height="28" rx="6" fill="#22c55e" opacity="0.3"/>
                      <text x="100" y="559" dominant-baseline="middle" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Criar</text>
                      
                      <rect x="204.5" y="510" width="170" height="70" rx="8" fill="#111" stroke="#22c55e" stroke-width="1" opacity="0.2"/>
                      <text x="289.5" y="535" dominant-baseline="middle" text-anchor="middle" fill="#fff" font-family="Arial, sans-serif" font-size="12" font-weight="bold">Domínios</text>
                      <rect x="249.5" y="545" width="80" height="28" rx="6" fill="#22c55e" opacity="0.3"/>
                      <text x="289.5" y="559" dominant-baseline="middle" text-anchor="middle" fill="#22c55e" font-family="Arial, sans-serif" font-size="10" font-weight="bold">Ver</text>
                      
                      <!-- Gradient at bottom -->
                      <rect x="0" y="600" width="389.5" height="243.5" fill="url(#bottomGradient)"/>
                    </svg>
                  `)}`}
                />
                {/* Gradiente adicional sobreposto no final do celular */}
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none rounded-b-[2.5rem]" />
              </div>
            </div>
          </div>

          {/* Cards da direita */}
          <div className="md:col-span-4 flex flex-col gap-6">
            {rightFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex-1 flex flex-col items-center text-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center mb-3">
                    <Icon className="h-5 w-5 text-green-400" strokeWidth={2} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-white/80 text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: feature.description }} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

