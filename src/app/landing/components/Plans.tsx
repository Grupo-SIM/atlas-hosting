"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { motion } from "motion/react";

const plans = [
  {
    name: "START",
    monthlyPrice: "R$49,90",
    yearlyPrice: "R$499,00",
    delay: 0.1,
    isPopular: false,
    features: [
      { text: "1 site", included: true },
      { text: "Até 10.000 visitas mensais", included: true },
      { text: "Armazenamento: 10gb", included: true },
      { text: "WordPress + Elementor PRO", included: true },
      { text: "SSL grátis e ilimitado", included: true },
      { text: "Backups diários", included: true },
      { text: "CDN grátis", included: false },
      { text: "Prioridade no suporte", included: false },
    ],
  },
  {
    name: "PREMIUM",
    monthlyPrice: "R$79,90",
    yearlyPrice: "R$799,00",
    delay: 0.2,
    isPopular: true,
    features: [
      { text: "5 sites", included: true },
      { text: "Até 25.000 visitas mensais", included: true },
      { text: "Armazenamento: 20gb", included: true },
      { text: "WordPress + Elementor PRO", included: true },
      { text: "SSL grátis e ilimitado", included: true },
      { text: "Backups diários", included: true },
      { text: "CDN grátis", included: false },
      { text: "Prioridade no suporte", included: false },
    ],
  },
  {
    name: "BUSINESS",
    monthlyPrice: "R$109,90",
    yearlyPrice: "R$1.099,00",
    delay: 0.3,
    isPopular: false,
    features: [
      { text: "10 sites", included: true },
      { text: "Até 50.000 visitas mensais", included: true },
      { text: "Armazenamento: 40gb", included: true },
      { text: "WordPress + Elementor PRO", included: true },
      { text: "SSL grátis e ilimitado", included: true },
      { text: "Backups diários", included: true },
      { text: "CDN grátis", included: true },
      { text: "Prioridade no suporte", included: false },
    ],
  },
  {
    name: "ELITE",
    monthlyPrice: "R$159,90",
    yearlyPrice: "R$1.599,00",
    delay: 0.4,
    isPopular: false,
    features: [
      { text: "15 sites", included: true },
      { text: "Até 100.000 visitas mensais", included: true },
      { text: "Armazenamento: 60gb", included: true },
      { text: "WordPress + Elementor PRO", included: true },
      { text: "SSL grátis e ilimitado", included: true },
      { text: "Backups diários", included: true },
      { text: "CDN grátis", included: true },
      { text: "Prioridade no suporte", included: true },
    ],
  },
];

export function Plans() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="planos" className="py-24 px-4 relative bg-[#0a0e27]">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="container mx-auto max-w-[1240px] relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          <div className="inline-flex flex-row items-center gap-3 mb-6 bg-[#0e132e] py-1.5 px-3 rounded border border-white/5">
            <div className="w-1 h-4 bg-[#01FC8D]"></div>
            <span className="text-xs font-semibold tracking-wider text-[#01FC8D] uppercase">
              Planos
            </span>
          </div>
          
          <h2 className="text-4xl md:text-[2.75rem] font-medium text-white mb-6 leading-tight tracking-normal max-w-2xl">
            Escolha o plano ideal para você
          </h2>

          <p className="text-gray-400 text-sm md:text-[15px] max-w-xl mx-auto mb-10 leading-relaxed font-light delay-75">
            Comece com o pé direito. Oferecemos 30 dias para pedir reembolso, ou seja, risco zero para você.
          </p>
          
          {/* Toggle Mensal/Anual */}
          <div className="flex items-center justify-center gap-4 delay-150">
            <span className={`text-[13px] ${!isYearly ? 'text-white font-medium' : 'text-gray-500'}`}>
              Mensal
            </span>
            <div 
              className="relative inline-flex h-[22px] w-10 cursor-pointer items-center rounded-full bg-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 border border-white/10"
              onClick={() => setIsYearly(!isYearly)}
            >
              <div
                className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${isYearly ? 'translate-x-[20px]' : 'translate-x-1'}`}
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[13px] ${isYearly ? 'text-white font-medium' : 'text-gray-500'}`}>
                Anual
              </span>
              <span className="bg-[#ff4d4d] text-white px-2 py-[2px] rounded text-[10px] font-bold tracking-wide">
                -20%
              </span>
            </div>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch mb-16">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "200px" }}
              transition={{ duration: 0.35, delay: plan.delay }}
              className="relative rounded-2xl p-[6px] md:p-2 bg-[#10152b] flex flex-col group overflow-hidden border border-white/5 shadow-2xl"
            >
              {/* Header Box */}
              <div className={`relative h-[48px] rounded-[10px] flex items-center justify-center overflow-hidden mb-2 shrink-0 ${
                plan.isPopular ? 'bg-[#01FC8D]' : 'bg-[#212845]'
              }`}>
                {/* Stripe Pattern */}
                <div className={`absolute inset-0 opacity-20 bg-[repeating-linear-gradient(-45deg,#000_0,#000_10px,transparent_10px,transparent_20px)]`} />
                
                {/* Left accent bar (only on non-popular) */}
                {!plan.isPopular && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#01FC8D] z-10 rounded-l-md shadow-[0_0_10px_rgba(1,252,141,0.5)]" />
                )}
                
                <span className={`relative z-10 text-[13px] font-extrabold tracking-[0.15em] uppercase drop-shadow-md ${
                  plan.isPopular ? 'text-white' : 'text-[#01FC8D]'
                }`}>
                  {plan.name}
                </span>
              </div>

              {/* Inner Content Box */}
              <div className="flex-1 rounded-[10px] bg-[#1a2139] p-5 md:p-5 flex flex-col border border-white/5">
                
                {/* Price */}
                <div className="text-center mt-2 mb-6">
                  <div className="text-[2.2rem] lg:text-[2.4rem] font-bold text-[#01FC8D] leading-none mb-1 tracking-tight">
                    {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </div>
                </div>

                {/* Incluso divider */}
                <div className="text-center mb-6">
                  <p className="text-[13px] text-white font-medium tracking-wide">Incluso:</p>
                </div>

                {/* Features List */}
                <ul className="mb-8 flex-1">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 py-3 border-b border-white/5 last:border-0 border-solid">
                      {/* Check icon (solid green rounded full w/ check inside) */}
                      <div className="bg-[#01FC8D] rounded-full w-[14px] h-[14px] flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 text-[#171d37] stroke-[4]" />
                      </div>
                      <span className={`text-[12px] md:text-[13px] leading-snug font-light tracking-wide ${
                        feature.included 
                          ? 'text-[#e0e0e0]' 
                          : 'text-gray-500 line-through decoration-gray-500/50'
                      }`}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Button & CTA Footer */}
                <div className="mt-auto w-full flex flex-col items-center pt-2">
                  <Link 
                    href="https://wa.me/5547997801802"
                    target="_blank"
                    rel="noopener"
                    className="w-full bg-[#01FC8D] hover:bg-[#01FC8D]/90 transition-colors text-black font-extrabold uppercase text-[11px] py-[14px] rounded-[6px] text-center tracking-widest mb-4 shadow-[0_4px_14px_0_rgba(1,252,141,0.2)]"
                  >
                    ADQUIRIR AGORA
                  </Link>
                  <p className="text-[10px] text-gray-500 font-medium">
                    Pagamento 100% Seguro.
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-center gap-4 text-center mt-8"
        >
          <span className="text-sm md:text-[15px] font-light text-gray-300">
            Caso deseje um plano maior entre em contato agora mesmo:
          </span>
          <Link 
            href="https://wa.me/5547997801802" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block bg-[#01FC8D] hover:bg-[#01FC8D]/90 text-black font-extrabold text-[11px] uppercase tracking-widest px-5 py-2.5 rounded-[4px] transition-colors"
          >
            Clique aqui
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

