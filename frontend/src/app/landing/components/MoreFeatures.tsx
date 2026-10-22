"use client";

import { BarChart3, Gem, Settings, Trophy } from "lucide-react";
import { motion } from "motion/react";

const leftFeatures = [
  {
    delay: 0.2,
    description:
      "Já tem site em outro provedor? Nosso sistema facilitado resolve, sem dor de cabeça.",
    direction: -50, // fadeInLeft
    icon: Gem,
    title: "Migração gratuita",
  },
  {
    delay: 0.3,
    description:
      "Hospedagem preparada para lojas virtuais, funis, blogs e páginas de alta conversão.",
    direction: 0,
    icon: BarChart3,
    title: "Pronto para negócios online",
    y: 50, // fadeInUp
  },
];

const rightFeatures = [
  {
    delay: 0.2,
    description:
      "Recuperação fácil e rápida em caso de imprevistos — sem perder nada.",
    direction: 50, // fadeInRight
    icon: Settings,
    title: "Backups diários automáticos",
  },
  {
    delay: 0.3,
    description:
      "Estamos em constante desenvolvimento de novas ferramentas e melhorias baseadas no feedback dos nossos clientes.",
    direction: 0,
    icon: Trophy,
    title: "Desenvolvimento de melhorias",
    y: 50, // fadeInUp
  },
];

export function MoreFeatures() {
  return (
    <section
      className="relative overflow-hidden bg-[#00050A] px-4 py-24"
      id="beneficios"
    >
      <div className="container mx-auto max-w-[1100px]">
        {/* Badge e Título */}
        <div className="mb-16 flex flex-col items-center text-center">
          <motion.div
            className="mb-6 inline-flex flex-row items-center gap-3 rounded border border-white/10 bg-white/5 px-3 py-1.5 shadow-sm"
            initial={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="h-4 w-1 bg-sky-500" />
            <span className="font-semibold text-sky-400 text-xs uppercase tracking-wider">
              ACHOU QUE ERA SÓ ISSO?
            </span>
          </motion.div>
          <motion.h2
            className="mx-auto mb-6 max-w-2xl font-bold text-3xl text-white uppercase leading-[1.15] md:text-4xl lg:text-[2.6rem]"
            initial={{ opacity: 0, y: 30 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            A cada mês, sua hospedagem fica mais completa, moderna e eficiente
          </motion.h2>
        </div>

        {/* Grid com 5 cards: 2 esquerda, 1 centro, 2 direita */}
        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
          {/* Cards da esquerda */}
          <div className="flex flex-col gap-6">
            {leftFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  className="relative flex flex-1 flex-col rounded-[24px] bg-white/5 p-[1px] shadow-sm"
                  initial={{
                    opacity: 0,
                    x: feature.direction,
                    y: feature.y || 0,
                  }}
                  key={index}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                  viewport={{ margin: "-50px", once: true }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                >
                  <div className="relative flex h-full w-full flex-1 flex-col items-center overflow-hidden rounded-[23px] border border-white/10 bg-[#00050A] p-8 text-center backdrop-blur-md">
                    <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-sky-500 opacity-[0.05] blur-[40px]" />
                    <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-500 shadow-lg shadow-sky-500/20 md:h-16 md:w-16">
                      <Icon
                        className="h-6 w-6 text-white md:h-7 md:w-7"
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className="mb-3 font-bold text-lg text-white uppercase">
                      {feature.title}
                    </h3>
                    <p className="px-2 font-medium text-[13px] text-slate-400 leading-relaxed md:text-[14px]">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Card central maior */}
          <motion.div
            className="relative flex h-full flex-col rounded-[24px] bg-white/5 p-[1px] shadow-sm md:col-span-full lg:col-span-1"
            initial={{ opacity: 0, y: 50 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ margin: "-50px", once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            <div className="relative flex h-full w-full flex-1 flex-col items-center overflow-hidden rounded-[23px] border border-white/10 bg-[#00050A] px-6 pt-10 backdrop-blur-md">
              <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-sky-500 opacity-[0.05] blur-[40px]" />

              <div className="relative z-10 mb-8 shrink-0 text-center">
                <h3 className="mb-4 font-bold text-lg text-white uppercase md:text-xl">
                  CDN global incluso
                </h3>
                <p className="mx-auto max-w-xs font-medium text-[13px] text-slate-400 leading-relaxed md:text-[14px]">
                  Seu site carrega rápido em qualquer lugar do mundo, com
                  distribuição inteligente de conteúdo.
                </p>
              </div>

              <div className="relative mt-auto flex min-h-[250px] w-full flex-grow items-end justify-center md:min-h-0">
                <img
                  alt="CDN Global Console App"
                  className="w-[75%] max-w-[280px] translate-y-2 object-cover object-top brightness-90 grayscale-[20%] filter lg:w-[90%] lg:translate-y-4"
                  src="/landing/features/phone.webp"
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
                  className="relative flex flex-1 flex-col rounded-[24px] bg-white/5 p-[1px] shadow-sm"
                  initial={{
                    opacity: 0,
                    x: feature.direction,
                    y: feature.y || 0,
                  }}
                  key={index}
                  transition={{ delay: feature.delay, duration: 0.5 }}
                  viewport={{ margin: "-50px", once: true }}
                  whileInView={{ opacity: 1, x: 0, y: 0 }}
                >
                  <div className="relative flex h-full w-full flex-1 flex-col items-center overflow-hidden rounded-[23px] border border-white/10 bg-[#00050A] p-8 text-center backdrop-blur-md">
                    <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-sky-500 opacity-[0.05] blur-[40px]" />
                    <div className="mb-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-sky-500 shadow-lg shadow-sky-500/20 md:h-16 md:w-16">
                      <Icon
                        className="h-6 w-6 text-white md:h-7 md:w-7"
                        strokeWidth={2.5}
                      />
                    </div>
                    <h3 className="mb-3 font-bold text-lg text-white uppercase">
                      {feature.title}
                    </h3>
                    <p className="px-2 font-medium text-[13px] text-slate-400 leading-relaxed md:text-[14px]">
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
