"use client";

import { motion } from "motion/react";

const partners = [
  "/landing/partners/jbmidia.webp",
  "/landing/partners/simint.webp",
  "/landing/partners/dooki.webp",
  "/landing/partners/logo3.png",
  "/landing/partners/logo-principal.png",
  "/landing/partners/logo-cor.png",
  "/landing/partners/fundacao.webp",
  "/landing/partners/absoluthub.png",
];

export function Partners() {
  return (
    <section className="py-24 px-4 bg-[#0a0e27]">
      <div className="container mx-auto max-w-[1000px] text-center">
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-white text-sm md:text-base mb-10 font-medium tracking-wide"
        >
          Empresas que confiam no Atlas
        </motion.h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 justify-center items-center">
          {partners.map((logoUrl, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-[#0e132e] border border-white/5 rounded-md flex items-center justify-center h-[90px] xl:h-[100px] p-6 shadow-sm transition-colors hover:bg-white/5"
            >
              <img 
                src={logoUrl} 
                alt={`Partner ${i + 1}`} 
                className="max-h-full max-w-full object-contain opacity-80 hover:opacity-100 transition-opacity"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

