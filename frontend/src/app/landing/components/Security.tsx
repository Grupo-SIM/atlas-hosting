"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

export function Security() {
  return (
    <section className="relative flex w-full items-center justify-center overflow-hidden py-32 md:py-40">
      {/* Flipped Background Image */}
      <div
        className="absolute inset-0 -scale-x-100 bg-center bg-cover bg-fixed"
        style={{ backgroundImage: "url('/imgs/blindado.jpg')" }}
      />

      {/* Dark Navy Overlay */}
      <div className="absolute inset-0 z-0 bg-[#080d22]/85 mix-blend-multiply md:bg-[#070b1f]/80" />
      <div className="absolute inset-0 z-0 bg-[#0a0e27]/40" />

      <div className="container relative z-10 mx-auto max-w-[700px] px-4 text-center">
        <div className="fade-in slide-in-from-bottom-2 animate-in fill-mode-both duration-300">
          <h2 className="mb-6 font-extrabold text-[2.2rem] text-white leading-tight tracking-tight drop-shadow-lg md:mb-8 md:text-5xl">
            Site blindado, dados protegidos
          </h2>

          <p className="mx-auto mb-10 max-w-[500px] font-light text-sm text-white/90 leading-relaxed drop-shadow-md delay-100 md:text-[15px]">
            Firewall, criptografia, proteção contra malwares e estabilidade
            garantida pra você trabalhar tranquilo.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-[#01FC8D] px-8 py-3.5 font-extrabold text-[11px] text-black uppercase tracking-widest shadow-[0_4px_14px_0_rgba(1,252,141,0.2)] transition-colors hover:bg-[#01FC8D]/90"
            href="#planos"
          >
            ver planos
            <ArrowRight className="h-[14px] w-[14px] stroke-[3]" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
