"use client";

import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    answer:
      "Você recebe de volta parte do valor da sua hospedagem em formato de bônus, que pode ser usado dentro da própria plataforma ou transferido para serviços parceiros.",
    question: "Como funciona o sistema de cashback mensal?",
  },
  {
    answer:
      "Todos os planos incluem SSL ilimitado e backups automáticos diários, garantindo segurança e recuperação rápida em caso de imprevistos.",
    question: "Os planos incluem certificado SSL e backups automáticos?",
  },
  {
    answer:
      "A diferença está na quantidade de sites, visitas mensais, armazenamento e prioridade no suporte. Você pode comparar cada um na seção de planos.",
    question:
      "Qual a diferença entre os planos Start, Premium, Business e Elite?",
  },
  {
    answer:
      "Claro! Oferecemos 30 dias de garantia de satisfação. Se não curtir, devolvemos 100% do valor.",
    question: "É possível testar a hospedagem antes de decidir?",
  },
  {
    answer:
      "Não! Nossa interface foi criada para ser extremamente intuitiva, até mesmo para quem está criando um site pela primeira vez.",
    question: "Preciso ter conhecimento técnico para usar o painel?",
  },
  {
    answer:
      "Sim. Temos estrutura escalável, CDN global e servidores otimizados para alta performance em qualquer tipo de projeto online.",
    question: "A hospedagem é boa para e-commerces e blogs com tráfego alto?",
  },
  {
    answer:
      "Você indica novos clientes e recebe 10% de comissão recorrente por cada assinatura ativa. Tudo direto na sua conta, sem burocracia.",
    question: "Como funciona o programa de afiliados?",
  },
  {
    answer:
      "Atendimento humano, direto e rápido para resolver dúvidas, realizar ajustes simples e orientar você no uso da plataforma.",
    question: "O que está incluso no suporte via WhatsApp?",
  },
];

export function FAQ() {
  return (
    <section
      className="relative w-full overflow-hidden bg-[#00050A] px-4 py-24"
      id="faq"
    >
      {/* Giant "FAQ" Watermark on the Left */}
      <div className="pointer-events-none absolute top-[250px] left-[-110px] hidden -rotate-90 select-none opacity-[0.05] 2xl:block">
        <span
          className="font-black text-[160px] text-transparent tracking-widest"
          style={{ WebkitTextStroke: "2px #ffffff" }}
        >
          FAQ
        </span>
      </div>

      <div className="container relative z-10 mx-auto max-w-[1200px]">
        <div className="flex flex-col items-stretch gap-12 lg:flex-row lg:gap-20">
          {/* Left Column: FAQ Content */}
          <div className="max-w-[700px] flex-1">
            {/* Header */}
            <div className="fade-in slide-in-from-left-2 mb-10 animate-in fill-mode-both duration-300">
              <div className="mb-5 inline-flex flex-row items-center gap-3 rounded border border-white/10 bg-white/5 px-3 py-1.5 shadow-sm">
                <div className="h-4 w-1 bg-sky-500" />
                <span className="font-semibold text-sky-400 text-xs uppercase tracking-wider">
                  TEM DÚVIDAS?
                </span>
              </div>

              <h2 className="mb-2 font-bold text-3xl text-white uppercase tracking-normal md:text-[2.2rem]">
                Perguntas Frequentes
              </h2>
            </div>

            {/* Accordion List */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              transition={{ delay: 0.1, duration: 0.35 }}
              viewport={{ margin: "200px", once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <Accordion
                className="flex w-full flex-col gap-3"
                defaultValue="item-0"
                type="single"
              >
                {faqs.map((faq, index) => (
                  <AccordionItem
                    className="overflow-hidden rounded-[12px] border border-white/10 border-none bg-white/5 shadow-sm transition-all duration-300 data-[state=open]:shadow-md"
                    key={index}
                    value={`item-${index}`}
                  >
                    <AccordionTrigger className="cursor-pointer px-5 py-5 font-bold text-[13px] text-slate-300 uppercase transition-colors duration-300 hover:no-underline data-[state=open]:bg-sky-500 data-[state=open]:text-white md:text-[14px] [&>svg]:h-5 [&>svg]:w-5">
                      <span className="w-full pr-4 text-left">
                        {faq.question}
                      </span>
                    </AccordionTrigger>

                    <AccordionContent className="border-white/10 border-t bg-transparent px-5 py-6 text-[13.5px] text-slate-400 leading-[1.7]">
                      <div className="relative z-10">{faq.answer}</div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>

          {/* Right Column: Cyber Image */}
          <motion.div
            className="hidden flex-[0.7] items-start justify-center pt-[6px] lg:flex"
            transition={{ duration: 0.5 }}
            viewport={{ margin: "200px", once: true }}
            whileInView={{ opacity: 1, x: 0 }}
          >
            <div className="relative aspect-[3/4.5] w-full max-w-[420px] overflow-hidden rounded-[24px] border-[1px] border-white/10 bg-white/5 p-[6px] shadow-2xl backdrop-blur-md">
              <div className="h-full w-full overflow-hidden rounded-[18px]">
                <div
                  className="h-full w-full bg-center bg-cover"
                  style={{
                    backgroundImage:
                      "url('/man-with-headphones-looking-laptop.jpg')",
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
