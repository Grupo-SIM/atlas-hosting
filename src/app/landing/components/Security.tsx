"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Security() {
  return (
    <section 
      className="relative w-full py-32 md:py-40 flex items-center justify-center overflow-hidden" 
    >
      {/* Flipped Background Image */}
      <div 
        className="absolute inset-0 bg-fixed bg-center bg-cover -scale-x-100" 
        style={{ backgroundImage: "url('/imgs/blindado.jpg')" }}
      />
      
      {/* Dark Navy Overlay */}
      <div className="absolute inset-0 bg-[#080d22]/85 md:bg-[#070b1f]/80 z-0 mix-blend-multiply" />
      <div className="absolute inset-0 bg-[#0a0e27]/40 z-0" />
      
      <div className="container mx-auto max-w-[700px] relative z-10 text-center px-4">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          <h2 className="text-[2.2rem] md:text-5xl font-extrabold text-white mb-6 md:mb-8 tracking-tight drop-shadow-lg leading-tight">
            Site blindado, dados protegidos
          </h2>

          <p className="text-white/90 text-sm md:text-[15px] mb-10 leading-relaxed font-light drop-shadow-md mx-auto max-w-[500px] delay-100">
            Firewall, criptografia, proteção contra malwares e estabilidade garantida pra você trabalhar tranquilo.
          </p>
        </div>

        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link 
            href="#planos"
            className="inline-flex items-center justify-center gap-2 bg-[#01FC8D] hover:bg-[#01FC8D]/90 transition-colors text-black font-extrabold uppercase text-[11px] px-8 py-3.5 rounded-[4px] tracking-widest shadow-[0_4px_14px_0_rgba(1,252,141,0.2)]"
          >
            ver planos
            <ArrowRight className="w-[14px] h-[14px] stroke-[3]" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

