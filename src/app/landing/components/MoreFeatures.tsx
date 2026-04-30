"use client";

import { Gem, Settings, BarChart3, Trophy } from "lucide-react";
import { motion } from "motion/react";

const leftFeatures = [
  {
    icon: Gem,
    title: "Migração gratuita",
    description: "Já tem site em outro provedor? Nosso sistema facilitado resolve, sem dor de cabeça.",
    delay: 0.2,
    direction: -50 // fadeInLeft
  },
  {
    icon: BarChart3,
    title: "Pronto para negócios online",
    description: "Hospedagem preparada para lojas virtuais, funis, blogs e páginas de alta conversão.",
    delay: 0.3,
    direction: 0, 
    y: 50 // fadeInUp
  },
];

const rightFeatures = [
  {
    icon: Settings,
    title: "Backups diários automáticos",
    description: "Recuperação fácil e rápida em caso de imprevistos — sem perder nada.",
    delay: 0.2,
    direction: 50 // fadeInRight
  },
  {
    icon: Trophy,
    title: "Desenvolvimento de melhorias",
    description: "Estamos em constante desenvolvimento de novas ferramentas e melhorias baseadas no feedback dos nossos clientes.",
    delay: 0.3,
    direction: 0,
    y: 50 // fadeInUp
  },
];

export function MoreFeatures() {
  return (
    <section id="beneficios" className="py-24 px-4 relative overflow-hidden bg-slate-50">
      <div className="container mx-auto max-w-[1100px]">
        {/* Badge e Título */}
        <div className="text-center mb-16 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex flex-row items-center gap-3 mb-6 bg-white py-1.5 px-3 rounded border border-slate-200 shadow-sm"
          >
            <div className="w-1 h-4 bg-emerald-500"></div>
            <span className="text-xs font-semibold tracking-wider text-emerald-600 uppercase">
              ACHOU QUE ERA SÓ ISSO?
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl md:text-4xl lg:text-[2.6rem] font-medium text-slate-900 mb-6 leading-[1.15] max-w-2xl mx-auto"
          >
            A cada mês, sua hospedagem fica mais completa, moderna e eficiente
          </motion.h2>
        </div>

        {/* Grid com 5 cards: 2 esquerda, 1 centro, 2 direita */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Cards da esquerda */}
          <div className="flex flex-col gap-6">
            {leftFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: feature.direction, y: feature.y || 0 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  className="relative rounded-[16px] p-[1px] bg-slate-200 shadow-sm flex-1 flex flex-col"
                >
                  <div className="h-full w-full rounded-[15px] bg-white flex flex-col items-center text-center p-8 relative overflow-hidden flex-1 border border-slate-100">
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500 opacity-[0.05] blur-[40px] rounded-full pointer-events-none" />
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 shrink-0">
                      <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-medium mb-3 text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] md:text-[14px] leading-relaxed text-slate-500 font-light px-2">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Card central maior */}
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative rounded-[16px] p-[1px] bg-slate-200 shadow-sm flex flex-col lg:col-span-1 md:col-span-full h-full"
          >
            <div className="h-full w-full rounded-[15px] bg-white flex flex-col items-center pt-10 px-6 relative overflow-hidden flex-1 border border-slate-100">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500 opacity-[0.05] blur-[40px] rounded-full pointer-events-none" />
              
              <div className="text-center mb-8 relative z-10 shrink-0">
                <h3 className="text-lg md:text-xl font-medium mb-4 text-slate-900">
                  CDN global incluso
                </h3>
                <p className="text-[13px] md:text-[14px] leading-relaxed text-slate-500 font-light max-w-xs mx-auto">
                  Seu site carrega rápido em qualquer lugar do mundo, com distribuição inteligente de conteúdo.
                </p>
              </div>

              <div className="relative w-full mt-auto flex justify-center items-end flex-grow min-h-[250px] md:min-h-0">
                <img 
                  src="/landing/features/phone.webp" 
                  alt="CDN Global Console App" 
                  className="w-[75%] lg:w-[90%] max-w-[280px] object-cover object-top translate-y-2 lg:translate-y-4"
                />
              </div>
            </div>
          </motion.div>

          {/* Cards da direita */}
          <div className="flex flex-col gap-6">
            {rightFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: feature.direction, y: feature.y || 0 }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: feature.delay }}
                  className="relative rounded-[16px] p-[1px] bg-slate-200 shadow-sm flex-1 flex flex-col"
                >
                  <div className="h-full w-full rounded-[15px] bg-white flex flex-col items-center text-center p-8 relative overflow-hidden flex-1 border border-slate-100">
                    <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500 opacity-[0.05] blur-[40px] rounded-full pointer-events-none" />
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-emerald-500 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20 shrink-0">
                      <Icon className="h-6 w-6 md:h-7 md:w-7 text-white" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-lg font-medium mb-3 text-slate-900">
                      {feature.title}
                    </h3>
                    <p className="text-[13px] md:text-[14px] leading-relaxed text-slate-500 font-light px-2">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}

