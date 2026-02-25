"use client";

import { MousePointerClick, Zap, Network, GraduationCap, Code, Globe2 } from "lucide-react";

const projects = [
  {
    icon: MousePointerClick,
    title: "Um site, um clique",
    subtitle: "Construtor de sites inteligente",
    description: "Defina o padrão de sites que desejar, seja uma página de vendas, institucional ou outro, e, com um único clique, ele estará pronto. Basta substituir textos e imagens e seu site estará no ar.",
    status: "EM BREVE",
  },
  {
    icon: Zap,
    title: "Otimização da experiência",
    subtitle: "Ferramentas Exclusivas",
    description: "Trazer recursos avançados e mais poder para o seu site — sem custos adicionais. Nosso objetivo é fornecer ferramentas práticas para otimizar o tempo de todos que trabalham com alguma estrutura digital.",
    status: "EM BREVE",
  },
  {
    icon: Network,
    title: "nETWORK",
    subtitle: "Parcerias Estratégicas",
    description: "Estamos sempre em busca das melhores ferramentas do mercado para integrar diretamente à nossa plataforma. Uma boa parceria abre portas, fortalece o branding e melhora a experiência dos usuários.",
    status: "EM BREVE",
  },
  {
    icon: GraduationCap,
    title: "Conhecimento",
    subtitle: "Academia Atlas",
    description: "Uma seção de cursos e tutoriais exclusivos para nossos clientes, cobrindo desde como criar seu primeiro site até estratégias avançadas de marketing digital.",
    status: "EM BREVE",
  },
  {
    icon: Code,
    title: "Tecnologia",
    subtitle: "Infraestrutura pra sistemas",
    description: "Estamos preparando uma estrutura robusta, segura e escalável para quem precisa hospedar sistemas web, APIs e aplicações mais exigentes. sem as complicações dos servidores tradicionais.",
    status: "EM BREVE",
  },
  {
    icon: Globe2,
    title: "Expansão",
    subtitle: "Servidores no mundo todo",
    description: "Servidores em diferentes regiões do planeta. Isso garante mais velocidade e estabilidade. Não importa onde seu público esteja, seu site carregando rápido em qualquer lugar do mundo.",
    status: "EM BREVE",
  },
];

export function Projects() {
  return (
    <section id="projetos" className="py-20 px-4 relative overflow-hidden" style={{ backgroundColor: '#000319' }}>
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <span className="text-green-400 text-sm font-semibold uppercase tracking-wide">
              Nossos projetos
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Mais que hospedagem: somos Tecnologia em movimento
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => {
            const Icon = project.icon;
            return (
              <div
                key={index}
                className="relative rounded-4xl p-6 text-white overflow-hidden bg-slate-200/10 backdrop-blur-[20px] border border-green-500/30 shadow-[0_8px_32px_0_rgba(34,197,94,0.15)]"
              >
                <div className="absolute inset-0 -z-10 h-full w-full bg-transparent bg-[radial-gradient(rgba(34,197,94,0.2)_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 backdrop-blur-md border border-green-500/30 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-green-400" strokeWidth={2} />
                  </div>
                  <div className="inline-block px-2 py-1 bg-yellow-500/20 text-yellow-300 rounded text-xs font-semibold mb-3">
                    {project.status}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{project.title}</h3>
                  <p className="text-green-400 text-sm font-semibold mb-3">{project.subtitle}</p>
                  <p className="text-white/70 text-sm leading-relaxed">{project.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

