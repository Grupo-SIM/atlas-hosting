"use client";

import { motion } from "motion/react";
import Image from "next/image";

const projects = [
  {
    image: "/landing/projects/construtor.jpg",
    tag: "UM SITE, UM CLIQUE",
    title: "Construtor de sites inteligente",
    desc: "Defina o padrão de sites que desejar, seja uma página de vendas, institucional ou outro, e, com um único clique, ele estará pronto. Basta substituir textos e imagens e seu site estará no ar.",
  },
  {
    image: "/landing/projects/engenharia.jpg",
    tag: "OTIMIZAÇÃO DA EXPERIÊNCIA",
    title: "Ferramentas Exclusivas",
    desc: "Trazer recursos avançados e mais poder para o seu site — sem custos adicionais. Nosso objetivo é fornecer ferramentas práticas para otimizar o tempo de todos que trabalham com alguma estrutura digital.",
  },
  {
    image: "/landing/projects/hacking.jpg",
    tag: "NETWORK",
    title: "Parcerias Estratégicas",
    desc: "Estamos sempre em busca das melhores ferramentas do mercado para integrar diretamente à nossa plataforma. Uma boa parceria abre portas, fortalece o branding e melhora a experiência dos usuários.",
  },
  {
    image: "/landing/projects/academia.jpg",
    tag: "CONHECIMENTO",
    title: "Academia Atlas",
    desc: "Uma seção de cursos e tutoriais exclusivos para nossos clientes, cobrindo desde como criar seu primeiro site até estratégias avançadas de marketing digital.",
  },
  {
    image: "/landing/projects/infra.jpg",
    tag: "TECNOLOGIA",
    title: "Infraestrutura pra sistemas",
    desc: "Estamos preparando uma estrutura robusta, segura e escalável para quem precisa hospedar sistemas web, APIs e aplicações mais exigentes. sem as complicações dos servidores tradicionais.",
  },
  {
    image: "/landing/projects/servidores.jpg",
    tag: "EXPANSÃO",
    title: "Servidores no mundo todo",
    desc: "Servidores em diferentes regiões do planeta. Isso garante mais velocidade e estabilidade. Não importa onde seu público esteja, seu site carregando rápido em qualquer lugar do mundo.",
  }
];

export function Projects() {
  return (
    <section id="projetos" className="py-24 px-4 relative bg-[#0a0e27] w-full">
      <div className="container mx-auto max-w-[1200px] relative z-10">
        
        {/* Header Section */}
        <div className="text-center mb-16 flex flex-col items-center animate-in fade-in slide-in-from-bottom-2 duration-300 fill-mode-both">
          <div className="inline-flex flex-row items-center gap-3 mb-6 bg-[#0e132e] py-1.5 px-3 rounded border border-white/5">
            <div className="w-1 h-4 bg-[#01FC8D]"></div>
            <span className="text-xs font-semibold tracking-wider text-[#01FC8D] uppercase">
              NOSSOS PROJETOS
            </span>
          </div>
          
          <h2 className="text-3xl md:text-[2.5rem] font-bold text-white mb-6 tracking-normal">
            Mais que hospedagem: somos <br className="hidden md:block"/> Tecnologia em movimento
          </h2>
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {projects.map((project, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "200px" }}
              transition={{ duration: 0.35, delay: index * 0.05 }}
              className="relative p-[1px] rounded-[10px] bg-[#1d233c] hover:bg-[#01FC8D]/50 transition-colors group flex flex-col overflow-visible shadow-xl"
            >
              {/* This inner container mimics the Elementor styled card box */}
              <div className="w-full h-full bg-[#12172f] rounded-[9px] flex flex-col overflow-hidden">
                
                {/* Visual "cyber" frame cut at the top-left using background blocks overlay */}
                <div className="relative shrink-0 overflow-hidden group h-[220px]">
                  {/* Top-left angled overlay */}
                  <div 
                    className="absolute top-0 left-0 z-10 w-[50px] h-[30px] bg-[#12172f]" 
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }} 
                  />
                  {/* Top-right angled overlay */}
                  <div 
                    className="absolute top-0 right-0 z-10 w-[80px] h-[15px] bg-[#12172f]" 
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }} 
                  />
                  
                  <img 
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    style={{
                      clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)"
                    }}
                    {...({ fetchPriority: "low" } as any)}
                    loading="lazy"
                  />
                </div>

                <div className="flex-1 flex flex-col z-20 -mt-[1px]">
                  {/* Stripes Header */}
                  <div className="relative py-4 px-6 bg-[#1b223c] border-b border-white/5 border-t border-[#12172f]">
                    <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(-45deg,#000_0,#000_10px,transparent_10px,transparent_20px)] pointer-events-none" />
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#01FC8D]" />
                    
                    <div className="relative z-10 flex flex-col gap-1.5">
                      <span className="text-[#01FC8D] text-[10px] uppercase font-bold tracking-widest leading-none">
                        {project.tag}
                      </span>
                      <h3 className="text-gray-100 text-[18px] md:text-[19px] font-semibold leading-tight capitalize">
                        {project.title.toLowerCase()}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 bg-[#161c33] flex-1 flex flex-col justify-between items-start pt-5">
                    <p className="text-gray-400 text-[13px] leading-[1.65] font-light mb-8">
                      {project.desc}
                    </p>
                    
                    <span className="inline-block bg-[#01FC8D] text-[#0a0e27] font-extrabold text-[10px] uppercase tracking-widest px-4 py-2 rounded-[4px] shadow-[0_2px_10px_0_rgba(1,252,141,0.2)]">
                      EM BREVE
                    </span>
                  </div>
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

