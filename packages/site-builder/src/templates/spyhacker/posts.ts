import type { Block, Post } from "../../model/index.js";
import { BODIES } from "./post-bodies.js";

const UP = "https://007spyhacker.com/wp-content/uploads";

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `seed-post-${seq++}`,
  props,
  type,
});

interface Seed {
  body?: Block[];
  category: string;
  cover: string;
  date: string;
  excerpt: string;
  slug: string;
  title: string;
}

/** Posts do site original (dados do WordPress), mais recente primeiro — empates de data seguem esta ordem. */
const seeds: Seed[] = [
  {
    category: "analise-e-dados",
    cover: `${UP}/2026/01/image.jpeg`,
    date: "2026-01-06",
    excerpt:
      "Hoje em dia, qualquer pessoa que usa e-mail, redes sociais ou aplicativos de mensagens já se deparou com alguma tentativa de golpe que parecia completamente real.\u00a0 Um simples alerta de “conta bloqueada”, um aviso de entrega que nunca foi solicitado ou até uma suposta atualização de cadastro podem esconder algo muito mais perigoso: um Ataque",
    slug: "como-funciona-um-ataque-de-phishing-guia-completo",
    title: "Como Funciona um Ataque de Phishing",
  },
  {
    category: "automacoes-de-processos",
    cover: `${UP}/2025/11/Screenshot-44.png`,
    date: "2025-11-26",
    excerpt:
      "A superfície da internet nunca está realmente silenciosa. Enquanto navegamos, trabalhamos ou simplesmente deixamos nossos sistemas rodando, um fluxo constante de bots, analistas, empresas de tecnologia e agentes mal-intencionados examina redes inteiras em busca de brechas.\u00a0 Esse cenário, que antes parecia distante para quem não trabalhava diretamente com segurança digital, hoje faz parte da rotina",
    slug: "aprenda-como-automatizar-scans-de-vulnerabilidade",
    title: "Como Automatizar Scans de Vulnerabilidade (Legalmente)",
  },
  {
    category: "inteligencia-artificial",
    cover: `${UP}/2025/10/image-33.png`,
    date: "2025-10-28",
    excerpt:
      "Você já teve a sensação de que suas interações com ferramentas de inteligência artificial não renderam tudo o que poderiam? A culpa pode estar em um detalhe que parece simples, mas é decisivo: os prompts. Sim, os comandos que você envia para IA são a chave que define a qualidade, profundidade e utilidade das respostas",
    slug: "erros-ao-criar-prompts-e-como-melhorar-resultados",
    title:
      "Erros Comuns ao Criar Prompts e Como Corrigir Para Maximizar Seus Resultados",
  },
  {
    category: "automacoes-de-processos",
    cover: `${UP}/2025/10/automacao-processos-negocios.png`,
    date: "2025-10-22",
    excerpt:
      "Nos últimos anos, o crescimento dos negócios online se acelerou de forma impressionante. O que antes era apenas uma tendência, agora é a realidade de milhares de empreendedores que viram na internet uma forma de alcançar liberdade financeira e escalabilidade. No entanto, junto com essa oportunidade vieram também novos desafios: sobrecarga de tarefas, falta de",
    slug: "como-aplicar-a-automacao-de-marketing-em-projetos",
    title:
      "Como Aplicar a Automação de Marketing em Seu Negócio Digital: Ferramentas e Dicas de Que Economizam Tempo",
  },
  {
    category: "novidades-e-tendencias",
    cover: `${UP}/2025/09/pentest-ia-prompt-min.png`,
    date: "2025-09-30",
    excerpt:
      "A inteligência artificial deixou de ser apenas um conceito futurista para se tornar parte essencial do nosso cotidiano. Ela está em assistentes virtuais, plataformas de automação, ferramentas de criação de conteúdo e até em sistemas críticos de segurança corporativa. No entanto, junto com essa revolução tecnológica, surgem também novas ameaças cibernéticas que exploram justamente a",
    slug: "ataques-de-injecao-de-prompts-em-ia-o-maior-risco",
    title:
      "Ataques de Injeção de Prompts em IA: O Maior Risco Oculto da Inteligência Artificial",
  },
  {
    category: "analise-e-dados",
    cover: `${UP}/2025/09/top-view-laptop-with-lock-chain-2048x1366-1.jpg`,
    date: "2025-09-24",
    excerpt:
      "O avanço da transformação digital trouxe inúmeras oportunidades para empresas e usuários, mas também abriu portas para novos riscos. Entre eles, um dos mais preocupantes é a superfície de ataque, um conceito essencial para compreender como organizações podem ser exploradas por cibercriminosos. Cada vez que uma empresa cria um novo sistema, disponibiliza uma API ou",
    slug: "superficie-de-ataque-externa-o-que-e-quais-riscos",
    title:
      "Superfície de Ataque Externa: O Que é, Como Funciona e Por Que Você Deve se Preocupar Agora",
  },
  {
    category: "novidades-e-tendencias",
    cover: `${UP}/2025/09/Whisk_6e8ce8eb8f0a422b79e4acb241385e5edr.jpeg`,
    date: "2025-09-16",
    excerpt:
      "Quem trabalha com tráfego pago sabe que uma das maiores dores é investir pesado em campanhas e, no fim, não ter clareza sobre de onde vieram os leads que realmente convertem. Muitas vezes, o gestor acaba navegando no escuro, sem entender quais anúncios performaram melhor ou qual canal trouxe mais retorno. É exatamente nesse cenário",
    slug: "codigo-oculto-do-trafego-pago-como-usar-utms-hoje",
    title:
      "O Código Oculto do Tráfego Pago: Como Usar UTMs Para Dominar Seus Resultados",
  },
  {
    category: "guias-e-tutoriais",
    cover: `${UP}/2025/08/image-8.jpeg`,
    date: "2025-08-27",
    excerpt:
      "Vivemos em uma era em que a informação se tornou o recurso mais valioso do mundo. Cada clique, cada busca no Google, cada conversa em aplicativos de mensagens gera dados que podem ser coletados, monitorados e utilizados sem que o usuário sequer perceba. Nesse cenário, a espionagem surge como o inimigo invisível que acompanha silenciosamente",
    slug: "espionagem-cibernetica-como-se-proteger-de-ameaca",
    title:
      "Espionagem Cibernética: O Inimigo Invisível e Como Blindar Seus Dados Hoje Mesmo",
  },
  {
    category: "desenvolvimento-de-sistemas",
    cover: `${UP}/2025/08/rahul-mishra-JpF58ANavoc-unsplash.jpg`,
    date: "2025-08-15",
    excerpt:
      "As linguagens de programação são a base de toda a tecnologia que utilizamos no dia a dia, desde simples aplicativos no celular até sistemas complexos de inteligência artificial e plataformas de e-commerce. Para quem está começando no mundo da tecnologia, compreender como funcionam e para que servem é o primeiro passo para abrir portas no",
    slug: "linguagens-de-programacao-guia-completo-iniciante",
    title: "Linguagens de Programação: Guia Completo Para Iniciantes",
  },
  {
    category: "desenvolvimento-de-sites",
    cover: `${UP}/2025/07/image-1.jpeg`,
    date: "2025-07-24",
    excerpt:
      "Vivemos uma era em que a presença online é fator determinante para o sucesso de qualquer negócio. Não importa se você é um empreendedor iniciante, um profissional autônomo ou o gestor de uma grande empresa, ter um site profissional deixou de ser um diferencial e se tornou uma necessidade. Isso porque o comportamento do consumidor",
    slug: "desenvolvimento-de-sites-5-dicas-antes-de-lancar",
    title:
      "Desenvolvimento de Sites: 5 Dicas Antes de Lançar Seu Projeto Online",
  },
  {
    category: "guias-e-tutoriais",
    cover: `${UP}/2025/04/image-1.png`,
    date: "2025-04-01",
    excerpt:
      "Registrar domínio é um dos passos mais importantes para qualquer pessoa ou empresa que deseja construir presença sólida na internet. Esse processo, muitas vezes subestimado, é responsável por garantir que seu projeto tenha um endereço único, fácil de memorizar e que transmita confiança ao público. Mais do que uma questão técnica, registrar domínio é um",
    slug: "como-registrar-dominio-de-forma-simples-e-facil",
    title: "Como Registrar Domínio: Dicas Simples",
  },
  {
    category: "ferramentas-e-softwares",
    cover: `${UP}/2025/04/image-6.jpeg`,
    date: "2025-04-01",
    excerpt:
      "Se você já se deparou com o erro 500 ao acessar seu site ou navegar na internet, saiba que não está sozinho. O famoso “500 Internal Server Error” ou erro 500 é um dos problemas mais recorrentes enfrentados por administradores de sites, tanto no WordPress quanto em outras plataformas. No entanto, identificar a causa desse",
    slug: "erro-500-entenda-como-corrigir-esse-problema-hoje",
    title: "Erro 500: Descubra Como Resolver Esse Problema no Servidor",
  },
  {
    category: "inteligencia-artificial",
    cover: `${UP}/2025/04/image-3.jpeg`,
    date: "2025-04-01",
    excerpt:
      "A inteligência artificial está revolucionando a forma como trabalhamos, criamos e interagimos com o mundo digital. Com a evolução constante das tecnologias inteligentes, surgem novas soluções que otimizam tarefas, geram conteúdos e facilitam a rotina de profissionais em diversas áreas. Em 2025, essa transformação é ainda mais evidente, tornando-se essencial para quem busca produtividade e",
    slug: "as-21-opcoes-de-ia-que-voce-precisa-usar-em-2025",
    title:
      "Os 21 Tipos de Inteligência Artificial Que Você Vai Precisar em 2025",
  },
];

/** Categorias com os nomes do WordPress, na ordem do seletor (alfabética). */
export const categorySeeds = [
  ["analise-e-dados", "Análise & Dados"],
  ["automacoes-de-processos", "Automações de Processos"],
  ["desenvolvimento-de-sistemas", "Desenvolvimento de Sistemas"],
  ["desenvolvimento-de-sites", "Desenvolvimento de Sites"],
  ["ferramentas-e-softwares", "Ferramentas & Softwares"],
  ["guias-e-tutoriais", "Guias & Tutoriais"],
  ["ideias-para-monetizacao", "Ideias para Monetização"],
  ["inteligencia-artificial", "Inteligência Artificial"],
  ["novidades-e-tendencias", "Novidades & Tendências"],
] as const;

/** Corpo completo do site original; sem ele, o corpo escrito à mão ou o resumo. */
function bodyOf(s: Seed): Block[] {
  const full = BODIES[s.slug];
  if (full?.length) return full.map(b => block(b.type, b.props));
  return s.body ?? [block("text", { text: s.excerpt })];
}

export const posts: Post[] = seeds.map((s, i) => ({
  blocks: bodyOf(s),
  categoryId: `cat-${s.category}`,
  coverImage: s.cover,
  excerpt: s.excerpt,
  id: `post-${i + 1}`,
  publishedAt: s.date,
  slug: s.slug,
  status: "published",
  title: s.title,
}));
