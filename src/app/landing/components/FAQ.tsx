"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Como funciona o sistema de cashback mensal?",
    answer:
      "Você recebe de volta parte do valor da sua hospedagem em formato de bônus, que pode ser usado dentro da própria plataforma ou transferido para serviços parceiros.",
  },
  {
    question: "Os planos incluem certificado SSL e backups automáticos?",
    answer:
      "Todos os planos incluem SSL ilimitado e backups automáticos diários, garantindo segurança e recuperação rápida em caso de imprevistos.",
  },
  {
    question: "Qual a diferença entre os planos Start, Premium, Business e Elite?",
    answer:
      "A diferença está na quantidade de sites, visitas mensais, armazenamento e prioridade no suporte. Você pode comparar cada um na seção de planos.",
  },
  {
    question: "É possível testar a hospedagem antes de decidir?",
    answer:
      "Claro! Oferecemos 30 dias de garantia de satisfação. Se não curtir, devolvemos 100% do valor.",
  },
  {
    question: "Preciso ter conhecimento técnico para usar o painel?",
    answer:
      "Não! Nossa interface foi criada para ser extremamente intuitiva, até mesmo para quem está criando um site pela primeira vez.",
  },
  {
    question: "A hospedagem é boa para e-commerces e blogs com tráfego alto?",
    answer:
      "Sim. Temos estrutura escalável, CDN global e servidores otimizados para alta performance em qualquer tipo de projeto online.",
  },
  {
    question: "Como funciona o programa de afiliados?",
    answer:
      "Você indica novos clientes e recebe 10% de comissão recorrente por cada assinatura ativa. Tudo direto na sua conta, sem burocracia.",
  },
  {
    question: "O que está incluso no suporte via WhatsApp?",
    answer:
      "Atendimento humano, direto e rápido para resolver dúvidas, realizar ajustes simples e orientar você no uso da plataforma.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-20 px-4 relative">
      {/* Gradiente verde de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-green-500/5 pointer-events-none" />
      
      <div className="container mx-auto max-w-4xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Perguntas Frequentes
          </h2>
          <p className="text-xl text-white/70">
            Tire suas dúvidas sobre nossos serviços
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-none"
            >
              <div className="bg-white/5 backdrop-blur-md border border-green-500/30 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-300 group data-[state=open]:bg-white/10 data-[state=open]:border-green-500/50">
                <AccordionTrigger className="px-6 py-4 text-white hover:no-underline cursor-pointer [&>svg]:text-green-400 [&>svg]:transition-transform">
                  <span className="text-left font-semibold text-lg group-hover:text-green-400 transition-colors data-[state=open]:text-green-400">
                    {faq.question}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-4 pt-0 data-[state=open]:border-green-500/50">
                  <p className="text-white/80 leading-relaxed">
                    {faq.answer}
                  </p>
                </AccordionContent>
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

