"use client";

import { motion } from "motion/react";

const projects = [
  {
    desc: "Defina o padrão de sites que desejar, seja uma página de vendas, institucional ou outro, e, com um único clique, ele estará pronto. Basta substituir textos e imagens e seu site estará no ar.",
    image: "/landing/projects/construtor.jpg",
    tag: "UM SITE, UM CLIQUE",
    title: "Construtor de sites inteligente",
  },
  {
    desc: "Trazer recursos avançados e mais poder para o seu site — sem custos adicionais. Nosso objetivo é fornecer ferramentas práticas para otimizar o tempo de todos que trabalham com alguma estrutura digital.",
    image: "/landing/projects/engenharia.jpg",
    tag: "OTIMIZAÇÃO DA EXPERIÊNCIA",
    title: "Ferramentas Exclusivas",
  },
  {
    desc: "Estamos sempre em busca das melhores ferramentas do mercado para integrar diretamente à nossa plataforma. Uma boa parceria abre portas, fortalece o branding e melhora a experiência dos usuários.",
    image: "/landing/projects/hacking.jpg",
    tag: "NETWORK",
    title: "Parcerias Estratégicas",
  },
  {
    desc: "Uma seção de cursos e tutoriais exclusivos para nossos clientes, cobrindo desde como criar seu primeiro site até estratégias avançadas de marketing digital.",
    image: "/landing/projects/academia.jpg",
    tag: "CONHECIMENTO",
    title: "Academia Atlas",
  },
  {
    desc: "Estamos preparando uma estrutura robusta, segura e escalável para quem precisa hospedar sistemas web, APIs e aplicações mais exigentes. sem as complicações dos servidores tradicionais.",
    image: "/landing/projects/infra.jpg",
    tag: "TECNOLOGIA",
    title: "Infraestrutura pra sistemas",
  },
  {
    desc: "Servidores em diferentes regiões do planeta. Isso garante mais velocidade e estabilidade. Não importa onde seu público esteja, seu site carregando rápido em qualquer lugar do mundo.",
    image: "/landing/projects/servidores.jpg",
    tag: "EXPANSÃO",
    title: "Servidores no mundo todo",
  },
];

export function Projects() {
  return (
    <section className="relative w-full bg-slate-50 px-4 py-24" id="projetos">
      <div className="container relative z-10 mx-auto max-w-[1200px]">
        {/* Header Section */}
        <div className="fade-in slide-in-from-bottom-2 mb-16 flex animate-in flex-col items-center fill-mode-both text-center duration-300">
          <div className="mb-6 inline-flex flex-row items-center gap-3 rounded border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
            <div className="h-4 w-1 bg-emerald-500" />
            <span className="font-semibold text-emerald-600 text-xs uppercase tracking-wider">
              NOSSOS PROJETOS
            </span>
          </div>

          <h2 className="mb-6 font-bold text-3xl text-slate-900 tracking-normal md:text-[2.5rem]">
            Mais que hospedagem: somos <br className="hidden md:block" />{" "}
            Tecnologia em movimento
          </h2>
        </div>

        {/* Grid Area */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              className="group relative flex flex-col overflow-visible rounded-[10px] bg-slate-200 p-[1px] shadow-sm transition-colors hover:bg-emerald-500/50 hover:shadow-md"
              initial={{ opacity: 0, y: 40 }}
              key={index}
              transition={{ delay: index * 0.05, duration: 0.35 }}
              viewport={{ margin: "200px", once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              {/* This inner container mimics the Elementor styled card box */}
              <div className="flex h-full w-full flex-col overflow-hidden rounded-[9px] bg-white">
                {/* Visual "cyber" frame cut at the top-left using background blocks overlay */}
                <div className="group relative h-[220px] shrink-0 overflow-hidden">
                  {/* Top-left angled overlay */}
                  <div
                    className="absolute top-0 left-0 z-10 h-[30px] w-[50px] bg-white"
                    style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
                  />
                  {/* Top-right angled overlay */}
                  <div
                    className="absolute top-0 right-0 z-10 h-[15px] w-[80px] bg-white"
                    style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%)" }}
                  />

                  <img
                    alt={project.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={project.image}
                    style={{
                      clipPath:
                        "polygon(0 0, 100% 0, 100% calc(100% - 40px), calc(100% - 40px) 100%, 0 100%)",
                    }}
                    {...({ fetchPriority: "low" } as any)}
                    loading="lazy"
                  />
                </div>

                <div className="z-20 -mt-[1px] flex flex-1 flex-col">
                  {/* Stripes Header */}
                  <div className="relative border-slate-100 border-white border-t border-b bg-slate-50 px-6 py-4">
                    <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(-45deg,#000_0,#000_10px,transparent_10px,transparent_20px)] opacity-[0.03]" />
                    <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-emerald-500" />

                    <div className="relative z-10 flex flex-col gap-1.5">
                      <span className="font-bold text-[10px] text-emerald-600 uppercase leading-none tracking-widest">
                        {project.tag}
                      </span>
                      <h3 className="font-semibold text-[18px] text-slate-900 capitalize leading-tight md:text-[19px]">
                        {project.title.toLowerCase()}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col items-start justify-between bg-white p-6 pt-5">
                    <p className="mb-8 font-light text-[13px] text-slate-500 leading-[1.65]">
                      {project.desc}
                    </p>

                    <span className="inline-block rounded-[4px] bg-emerald-500 px-4 py-2 font-extrabold text-[10px] text-white uppercase tracking-widest shadow-[0_2px_10px_0_rgba(16,185,129,0.2)]">
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
