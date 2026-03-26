"use client";

import { Globe, Server, Bug, Mail, CreditCard, Lock } from "lucide-react";
import Link from "next/link";
import { motion } from "motion/react";

const features = [
  {
    icon: Globe,
    title: "Qualidade",
    description: "Alta velocidade, segurança avançada, backups automáticos e um bom relacionamento com o cliente.",
    animDir: -1,
    delay: 0.05,
  },
  {
    icon: Server,
    title: "Cashback",
    description: "Em todas as compras você receberá imediatamente o seu dinheiro de volta pelo Vale Bônus.",
    animDir: -1,
    delay: 0.1,
  },
  {
    icon: Bug,
    title: "Velocidade",
    description: "Interface fácil e intuitiva. Em poucos cliques você compra seu dominio e configura o seu site.",
    animDir: -1,
    delay: 0.15,
  },
  {
    icon: Mail,
    title: "Programa de afiliados",
    description: "Indique amigos e clientes e receba 10% de comissão recorrente, direto na sua conta.",
    animDir: 1,
    delay: 0.2,
  },
  {
    icon: CreditCard,
    title: "Exclusividade",
    description: "Todos os nossos clientes tem acesso a uma interface premium e um construtor de sites.",
    animDir: 1,
    delay: 0.15,
  },
  {
    icon: Lock,
    title: "Relacionamento",
    description: "Fácil contato e linguagem simples, nada de respostas muito técnicas e confusas.",
    animDir: 1,
    delay: 0.05,
  },
];

const BIN = "10010011000101110100011010000110100 00110010011110000101";

export function Features() {
  return (
    <section id="beneficios" className="py-28 px-4 bg-[#0a0e27] relative w-full overflow-hidden">
      
      {/* Binary watermark — right side to center, large and sparse */}
      <div className="absolute top-0 right-0 h-full w-[55%] pointer-events-none z-[1] opacity-[0.06] overflow-hidden select-none" aria-hidden>
        <div className="text-[#01FC8D] font-mono text-[28px] md:text-[36px] leading-[1.4] whitespace-pre-wrap break-all tracking-[0.3em]">
          {(BIN + " ").repeat(80)}
        </div>
      </div>

      <div className="container mx-auto max-w-[1100px] relative z-10">
        {/* Header */}
        <div className="text-center mb-14 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          <div className="inline-flex items-center gap-2 mb-6 bg-[#0e132e] border border-white/5 px-3 py-1.5 rounded-sm">
            <div className="w-[3px] h-4 bg-[#01FC8D]" />
            <span className="text-[11px] font-bold tracking-widest text-[#01FC8D] uppercase">Benefícios</span>
          </div>

          <h2 className="text-[2rem] md:text-[2.5rem] font-bold text-white leading-tight">
            Por que escolher o Atlas?
          </h2>
        </div>

        {/* 3x2 Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: feature.animDir * 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0, margin: "200px" }}
                  transition={{ duration: 0.25, delay: feature.delay, ease: "easeOut" }}
                // OUTER container: gradient background — padding creates visible frame
                className="rounded-[16px] p-[10px]"
                style={{
                  background: "linear-gradient(160deg, rgba(25,35,75,0.9) 0%, rgba(15,22,50,0.95) 50%, rgba(10,14,39,1) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.5)"
                }}
              >
                {/* ─── INNER container: classic solid dark background ───
                    This sits inside the outer frame, creating the "2 within 1" effect */}
                <div
                  className="rounded-[10px] flex flex-col items-center text-center relative overflow-hidden h-full py-10 px-6"
                  style={{
                    background: "linear-gradient(180deg, #0d1230 0%, #090c22 100%)",
                    border: "1px solid rgba(255,255,255,0.06)"
                  }}
                >
                  {/* Subtle glow behind icon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-36 bg-[#01FC8D] opacity-[0.04] blur-[55px] rounded-full pointer-events-none" />
                  
                  {/* Icon — stacked circle */}
                  <div
                    className="w-[72px] h-[72px] rounded-full bg-[#01FC8D] flex items-center justify-center mb-5 flex-shrink-0 relative z-10"
                    style={{ boxShadow: "0 0 30px rgba(1,252,141,0.2)" }}
                  >
                    <Icon className="h-7 w-7 text-[#0a0e27]" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="text-[16px] font-semibold text-white mb-3 z-10 relative">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[13px] text-gray-400 leading-[1.75] max-w-[230px] mx-auto font-light z-10 relative mb-7 flex-grow">
                    {feature.description}
                  </p>

                  {/* Button */}
                  <div className="mt-auto w-full flex justify-center z-10 relative">
                    <Link
                      href="#planos"
                      className="bg-[#01FC8D] hover:bg-[#01FC8D]/85 text-[#0a0e27] font-extrabold rounded-[3px] px-9 py-2.5 text-[10px] uppercase tracking-widest transition-all shadow-[0_4px_16px_rgba(1,252,141,0.15)]"
                    >
                      Ver planos
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
