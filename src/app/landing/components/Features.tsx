"use client";

import { Bug, CreditCard, Globe, Lock, Mail, Server } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

const features = [
  {
    animDir: -1,
    delay: 0.05,
    description:
      "Alta velocidade, segurança avançada, backups automáticos e um bom relacionamento com o cliente.",
    icon: Globe,
    title: "Qualidade",
  },
  {
    animDir: -1,
    delay: 0.1,
    description:
      "Em todas as compras você receberá imediatamente o seu dinheiro de volta pelo Vale Bônus.",
    icon: Server,
    title: "Cashback",
  },
  {
    animDir: -1,
    delay: 0.15,
    description:
      "Interface fácil e intuitiva. Em poucos cliques você compra seu dominio e configura o seu site.",
    icon: Bug,
    title: "Velocidade",
  },
  {
    animDir: 1,
    delay: 0.2,
    description:
      "Indique amigos e clientes e receba 10% de comissão recorrente, direto na sua conta.",
    icon: Mail,
    title: "Programa de afiliados",
  },
  {
    animDir: 1,
    delay: 0.15,
    description:
      "Todos os nossos clientes tem acesso a uma interface premium e um construtor de sites.",
    icon: CreditCard,
    title: "Exclusividade",
  },
  {
    animDir: 1,
    delay: 0.05,
    description:
      "Fácil contato e linguagem simples, nada de respostas muito técnicas e confusas.",
    icon: Lock,
    title: "Relacionamento",
  },
];

const BIN = "10010011000101110100011010000110100 00110010011110000101";

export function Features() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#0a0e27] px-4 py-28"
      id="beneficios"
    >
      {/* Binary watermark — right side to center, large and sparse */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-[1] h-full w-[55%] select-none overflow-hidden opacity-[0.06]"
      >
        <div className="whitespace-pre-wrap break-all font-mono text-[#01FC8D] text-[28px] leading-[1.4] tracking-[0.3em] md:text-[36px]">
          {`${BIN} `.repeat(80)}
        </div>
      </div>

      <div className="container relative z-10 mx-auto max-w-[1100px]">
        {/* Header */}
        <div className="fade-in slide-in-from-bottom-2 mb-14 flex animate-in flex-col items-center fill-mode-both text-center duration-300">
          <div className="mb-6 inline-flex items-center gap-2 rounded-sm border border-white/5 bg-[#0e132e] px-3 py-1.5">
            <div className="h-4 w-[3px] bg-[#01FC8D]" />
            <span className="font-bold text-[#01FC8D] text-[11px] uppercase tracking-widest">
              Benefícios
            </span>
          </div>

          <h2 className="font-bold text-[2rem] text-white leading-tight md:text-[2.5rem]">
            Por que escolher o Atlas?
          </h2>
        </div>

        {/* 3x2 Card Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                // OUTER container: gradient background — padding creates visible frame
                className="rounded-[16px] p-[10px]"
                initial={{ opacity: 0, x: feature.animDir * 10 }}
                key={index}
                style={{
                  background:
                    "linear-gradient(160deg, rgba(25,35,75,0.9) 0%, rgba(15,22,50,0.95) 50%, rgba(10,14,39,1) 100%)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                }}
                transition={{
                  delay: feature.delay,
                  duration: 0.25,
                  ease: "easeOut",
                }}
                viewport={{ amount: 0, margin: "200px", once: true }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                {/* ─── INNER container: classic solid dark background ───
                    This sits inside the outer frame, creating the "2 within 1" effect */}
                <div
                  className="relative flex h-full flex-col items-center overflow-hidden rounded-[10px] px-6 py-10 text-center"
                  style={{
                    background:
                      "linear-gradient(180deg, #0d1230 0%, #090c22 100%)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  {/* Subtle glow behind icon */}
                  <div className="pointer-events-none absolute top-0 left-1/2 h-36 w-36 -translate-x-1/2 rounded-full bg-[#01FC8D] opacity-[0.04] blur-[55px]" />

                  {/* Icon — stacked circle */}
                  <div
                    className="relative z-10 mb-5 flex h-[72px] w-[72px] flex-shrink-0 items-center justify-center rounded-full bg-[#01FC8D]"
                    style={{ boxShadow: "0 0 30px rgba(1,252,141,0.2)" }}
                  >
                    <Icon className="h-7 w-7 text-[#0a0e27]" strokeWidth={2} />
                  </div>

                  {/* Title */}
                  <h3 className="relative z-10 mb-3 font-semibold text-[16px] text-white">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="relative z-10 mx-auto mb-7 max-w-[230px] flex-grow font-light text-[13px] text-gray-400 leading-[1.75]">
                    {feature.description}
                  </p>

                  {/* Button */}
                  <div className="relative z-10 mt-auto flex w-full justify-center">
                    <Link
                      className="rounded-[3px] bg-[#01FC8D] px-9 py-2.5 font-extrabold text-[#0a0e27] text-[10px] uppercase tracking-widest shadow-[0_4px_16px_rgba(1,252,141,0.15)] transition-all hover:bg-[#01FC8D]/85"
                      href="#planos"
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
