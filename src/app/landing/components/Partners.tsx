"use client";

import { motion } from "motion/react";

const partners = [
  "http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/elementor/thumbs/jbmidia-logo-atlas-r4sb2xa2358bv0cza4swhz1p8dr49850m3ffnhtc74.webp",
  "http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/elementor/thumbs/simint-logo-atlas-r4sb5tm55r75nq5fcvwhoqpv65guzmn80fubx7in0g.webp",
  "http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/elementor/thumbs/dooki-logo-atlas-r4sbv6bfhvwkt3bobcf8fuefzai9lqal5xaswvxd6o.webp",
  "http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/elementor/thumbs/LOGO-r4sc8o9zn8dtjhpshohcqxrr3hz158vtcqku0xwtts.png",
  "http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/elementor/thumbs/LOGO-PRINCIPAL-scaled-r4scc4copd3o40pkd643w2gliczhdakdtsoxdgsv0g.png",
  "http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/elementor/thumbs/01-Logo-Cor-01-Horizontal-Sem-fundo-r4scdnt5wl7l50h0dc33h6gsk3e4zfojpf6kosimtc.png",
  "http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/elementor/thumbs/Fundacao-logo-atlas-r4scktcxx705i62wlfevgdh3bo4pki300txm6lwrgg.webp",
  "http://177.154.190.249/plesk-site-preview/atlashosting.com.br/https/177.154.190.249/wp-content/uploads/elementor/thumbs/Logomarca-absoluthub-r4sd12ye6z9sf8galyjg3rp9epydrxnrxcd45zshs0.png",
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

