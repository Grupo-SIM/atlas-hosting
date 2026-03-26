"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "motion/react";

const faqs = [
  {
    question: "Como funciona o sistema de cashback mensal?",
    answer: "Você recebe de volta parte do valor da sua hospedagem em formato de bônus, que pode ser usado dentro da própria plataforma ou transferido para serviços parceiros.",
  },
  {
    question: "Os planos incluem certificado SSL e backups automáticos?",
    answer: "Todos os planos incluem SSL ilimitado e backups automáticos diários, garantindo segurança e recuperação rápida em caso de imprevistos.",
  },
  {
    question: "Qual a diferença entre os planos Start, Premium, Business e Elite?",
    answer: "A diferença está na quantidade de sites, visitas mensais, armazenamento e prioridade no suporte. Você pode comparar cada um na seção de planos.",
  },
  {
    question: "É possível testar a hospedagem antes de decidir?",
    answer: "Claro! Oferecemos 30 dias de garantia de satisfação. Se não curtir, devolvemos 100% do valor.",
  },
  {
    question: "Preciso ter conhecimento técnico para usar o painel?",
    answer: "Não! Nossa interface foi criada para ser extremamente intuitiva, até mesmo para quem está criando um site pela primeira vez.",
  },
  {
    question: "A hospedagem é boa para e-commerces e blogs com tráfego alto?",
    answer: "Sim. Temos estrutura escalável, CDN global e servidores otimizados para alta performance em qualquer tipo de projeto online.",
  },
  {
    question: "Como funciona o programa de afiliados?",
    answer: "Você indica novos clientes e recebe 10% de comissão recorrente por cada assinatura ativa. Tudo direto na sua conta, sem burocracia.",
  },
  {
    question: "O que está incluso no suporte via WhatsApp?",
    answer: "Atendimento humano, direto e rápido para resolver dúvidas, realizar ajustes simples e orientar você no uso da plataforma.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 px-4 relative bg-[#0a0e27] w-full overflow-hidden">
      
      {/* Giant "FAQ" Watermark on the Left */}
      <div className="absolute left-[-110px] top-[250px] -rotate-90 select-none hidden 2xl:block pointer-events-none opacity-20">
        <span 
          className="text-[160px] font-black text-transparent tracking-widest"
          style={{ WebkitTextStroke: '2px #ffffff' }}
        >
          FAQ
        </span>
      </div>

      <div className="container mx-auto max-w-[1200px] relative z-10">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-stretch">
          
          {/* Left Column: FAQ Content */}
          <div className="flex-1 max-w-[700px]">
            
            {/* Header */}
            <div className="mb-10 animate-in fade-in slide-in-from-left-2 duration-300 fill-mode-both">
              <div className="inline-flex flex-row items-center gap-3 mb-5 bg-[#0e132e] py-1.5 px-3 rounded border border-white/5">
                <div className="w-1 h-4 bg-[#01FC8D]"></div>
                <span className="text-xs font-semibold tracking-wider text-[#01FC8D] uppercase">
                  TEM DÚVIDAS?
                </span>
              </div>
              
              <h2 className="text-3xl md:text-[2.2rem] font-bold text-white mb-2 tracking-normal">
                Perguntas Frequentes
              </h2>
            </div>

            {/* Accordion List */}
            <motion.div
               initial={{ opacity: 0, y: 30 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "200px" }}
               transition={{ duration: 0.35, delay: 0.1 }}
            >
              <Accordion type="single" defaultValue="item-0" className="w-full flex-col gap-3 flex">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-none rounded-[6px] overflow-hidden bg-[#11172f] shadow-sm data-[state=open]:shadow-md"
                  >
                    <AccordionTrigger 
                      className="px-5 py-4 hover:no-underline font-semibold text-[13px] md:text-[14px] data-[state=open]:bg-[#01FC8D] data-[state=open]:text-[#0a0e27] text-gray-200 transition-colors duration-300 [&>svg]:w-5 [&>svg]:h-5"
                    >
                      <span className="text-left w-full pr-4">{faq.question}</span>
                    </AccordionTrigger>
                    
                    <AccordionContent 
                      className="bg-[#11172f] px-5 py-5 text-gray-400 text-[13.5px] leading-[1.7] border-t border-black/20"
                    >
                      {/* Subtle diagonal stripe pattern for active content background as seen in the dark panels */}
                      <div className="absolute inset-0 opacity-[0.03] bg-[repeating-linear-gradient(-45deg,#fff_0,#fff_1px,transparent_1px,transparent_6px)] pointer-events-none" />
                      <div className="relative z-10">
                        {faq.answer}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>

          {/* Right Column: Cyber Image */}
          <motion.div             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true, margin: "200px" }}
             transition={{ duration: 0.5 }}
            className="hidden lg:flex flex-[0.7] justify-center items-start pt-[6px]"
          >
            <div className="relative w-full max-w-[420px] aspect-[3/4.5] rounded-[16px] overflow-hidden border-[1px] border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] p-[6px] bg-gradient-to-b from-white/5 to-transparent">
               <div className="w-full h-full rounded-[10px] overflow-hidden">
                  <div 
                    className="w-full h-full bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/imgs/faq.jpg')",
                    }}
                  />
               </div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}

