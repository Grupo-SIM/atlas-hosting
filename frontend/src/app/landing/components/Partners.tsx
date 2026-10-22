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
    <section className="bg-slate-50 px-4 py-24">
      <div className="container mx-auto max-w-[1000px] text-center">
        <motion.h3
          className="mb-10 font-medium text-slate-900 text-sm tracking-wide md:text-base"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          Empresas que confiam no Atlas
        </motion.h3>

        <div className="grid grid-cols-2 items-center justify-center gap-4 md:grid-cols-4 md:gap-6">
          {partners.map((logoUrl, i) => (
            <motion.div
              className="flex h-[90px] items-center justify-center rounded-md border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:bg-slate-50 xl:h-[100px]"
              initial={{ opacity: 0, scale: 0.95 }}
              key={i}
              transition={{ delay: i * 0.05, duration: 0.4 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, scale: 1 }}
            >
              <img
                alt={`Partner ${i + 1}`}
                className="max-h-full max-w-full object-contain opacity-70 grayscale filter transition-opacity hover:opacity-100 hover:grayscale-0"
                loading="lazy"
                src={logoUrl}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
