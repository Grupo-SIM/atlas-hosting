"use client";

import { motion } from "motion/react";
import { Roboto } from "next/font/google";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export function ChatContact() {
  return (
    <section className="py-24 relative overflow-hidden bg-transparent w-full border-t border-white/5">
      <div className="container mx-auto max-w-6xl relative z-10 px-4">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#01FC8D]/10 border border-[#01FC8D]/20 text-[#01FC8D] text-xs font-bold uppercase tracking-widest mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#01FC8D] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#01FC8D]"></span>
              </span>
              Suporte Online agora
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className={`${roboto.className} text-4xl md:text-5xl font-bold text-white mb-6 leading-tight`}
            >
              Ficou com alguma dúvida? <br />
              <span className="text-[#01FC8D]">Converse com nossa IA.</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-lg mb-8 max-w-lg"
            >
              Tire suas dúvidas iniciais sobre planos, domínios e cashback em tempo real com o assistente inteligente Atlas.
            </motion.p>
          </div>

          {/* Real AI Chat iFrame */}
          <div className="flex-1 w-full flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="w-full max-w-[500px] h-[600px] bg-[#0d1225] rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative"
            >
              <iframe 
                src="https://app.dante-ai.com/embed/?kb_id=e6479ec5-8d25-437d-8bdb-9a3606e3b54e&token=b75d931e-c9f0-4460-b81d-5c0a5ba26045" 
                allow="clipboard-write; clipboard-read; *;microphone *" 
                width="100%" 
                height="100%" 
                frameBorder="0"
                className="absolute inset-0"
              ></iframe>
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
