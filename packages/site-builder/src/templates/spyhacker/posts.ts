import type { Block, Post } from "../../model/index.js";

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

/** Posts do site original. Corpo completo só do primeiro; os demais ficam com o resumo como ponto de partida. */
const seeds: Seed[] = [
  {
    body: [
      block("text", {
        text: "Registrar domínio é um dos passos mais importantes para qualquer pessoa ou empresa que deseja construir presença sólida na internet.\n\nEsse processo, muitas vezes subestimado, é responsável por garantir que seu projeto tenha um endereço único, fácil de memorizar e que transmita confiança ao público.",
      }),
      block("heading", {
        level: "h2",
        text: "O Que é um Domínio e Por Que Ele é Importante?",
      }),
      block("image", {
        alt: "Extensões de domínio",
        src: `${UP}/2025/04/Que-es-un-nombre-de-dominio-y-como-se-elige.jpg`,
      }),
      block("text", {
        text: "Antes de aprender a registrar domínio, é fundamental compreender o que ele realmente significa e como se conecta à estrutura da internet.",
      }),
      block("heading", {
        level: "h2",
        text: "1. Escolha o Nome de Domínio Ideal",
      }),
      block("image", {
        alt: "Registro de domínio",
        src: `${UP}/2025/04/image-38.png`,
      }),
      block("text", {
        text: "O primeiro passo para registrar domínio é decidir qual será o nome que representará o seu site. Essa escolha deve ser estratégica, pois ela estará diretamente ligada à forma como seu público vai lembrar e encontrar seu projeto.\n\nO ideal é optar por um nome curto, simples de escrever, fácil de memorizar e que tenha relação direta com o seu nicho de atuação.",
      }),
    ],
    category: "guias-e-tutoriais",
    cover: `${UP}/2025/04/Que-es-un-nombre-de-dominio-y-como-se-elige.jpg`,
    date: "2025-04-01",
    excerpt:
      "Registrar domínio é um dos passos mais importantes para qualquer pessoa ou empresa que deseja construir presença sólida na internet.",
    slug: "como-registrar-dominio-de-forma-simples-e-facil",
    title: "Como Registrar Domínio: Dicas Simples",
  },
  {
    category: "desenvolvimento-de-sites",
    cover: `${UP}/2025/07/desenvolvimento-de-sites.jpeg`,
    date: "2025-07-10",
    excerpt:
      "Antes de colocar seu site no ar, confira 5 dicas essenciais de desenvolvimento para evitar retrabalho.",
    slug: "desenvolvimento-de-sites-5-dicas-antes-de-lancar",
    title: "Desenvolvimento de Sites: 5 Dicas Antes de Lançar",
  },
  {
    category: "desenvolvimento-de-sistemas",
    cover: `${UP}/2025/08/mohammad-rahmani-_Fx34KeqIEw-unsplash.jpg`,
    date: "2025-08-05",
    excerpt:
      "Um guia completo para quem está começando e precisa escolher a primeira linguagem de programação.",
    slug: "linguagens-de-programacao-guia-completo-iniciante",
    title: "Linguagens de Programação: Guia Completo para Iniciantes",
  },
  {
    category: "guias-e-tutoriais",
    cover: `${UP}/2025/08/Digital_abstract_composition_data_202606120833.jpeg`,
    date: "2025-08-20",
    excerpt:
      "Vivemos em uma era em que a informação se tornou o recurso mais valioso do mundo. Cada clique, cada busca no Google, cada conversa em aplicativos deixa rastros.",
    slug: "espionagem-cibernetica-como-se-proteger-de-ameaca",
    title:
      "Espionagem Cibernética: O Inimigo Invisível e Como Blindar Seus Dados Hoje Mesmo",
  },
  {
    category: "ideias-para-monetizacao",
    cover: `${UP}/2025/09/Caderno_com_sigla_UTMs_202606111140.jpeg`,
    date: "2025-09-03",
    excerpt:
      "Entenda como os parâmetros UTM revelam de onde vêm seus visitantes e quais campanhas realmente convertem.",
    slug: "codigo-oculto-do-trafego-pago-como-usar-utms-hoje",
    title: "Código Oculto do Tráfego Pago: Como Usar UTMs Hoje",
  },
  {
    category: "analise-e-dados",
    cover: `${UP}/2025/09/Hacker_manipulating_digital_data_202605151139.jpeg`,
    date: "2025-09-18",
    excerpt:
      "O avanço da transformação digital trouxe inúmeras oportunidades para empresas e usuários, mas também abriu portas para novos riscos. Entre eles, um dos mais preocupantes é a superfície de ataque.",
    slug: "superficie-de-ataque-externa-o-que-e-quais-riscos",
    title:
      "Superfície de Ataque Externa: O Que é, Como Funciona e Por Que Você Deve se Preocupar Agora",
  },
  {
    category: "inteligencia-artificial",
    cover: `${UP}/2025/09/prompt.jpeg`,
    date: "2025-09-25",
    excerpt:
      "A inteligência artificial deixou de ser apenas um conceito futurista para se tornar parte essencial do nosso cotidiano. Ela está presente em assistentes virtuais, plataformas de automação, ferramentas de...",
    slug: "ataques-de-injecao-de-prompts-em-ia-o-maior-risco",
    title:
      "Ataques de Injeção de Prompts em IA: O Maior Risco Oculto da Inteligência Artificial",
  },
  {
    category: "automacoes-de-processos",
    cover: `${UP}/2025/10/Person_holding_transparent_devic%E2%80%A6_202606101842.jpeg`,
    date: "2025-10-08",
    excerpt:
      "Nos últimos anos, o crescimento dos negócios online se acelerou de forma impressionante. O que antes era apenas uma tendência, agora é a realidade de milhares de empreendedores que viram na internet...",
    slug: "como-aplicar-a-automacao-de-marketing-em-projetos",
    title:
      "Como Aplicar a Automação de Marketing em Seu Negócio Digital: Ferramentas e Dicas de Que Economizam Tempo",
  },
  {
    category: "inteligencia-artificial",
    cover: `${UP}/2025/10/Human_and_AI_hands_interacting_202605141952.jpeg`,
    date: "2025-10-20",
    excerpt:
      "Você já teve a sensação de que suas interações com ferramentas de inteligência artificial não renderam tudo o que poderiam? A culpa pode estar em um detalhe que parece simples, mas é decisivo: os...",
    slug: "erros-ao-criar-prompts-e-como-melhorar-resultados",
    title:
      "Erros Comuns ao Criar Prompts e Como Corrigir Para Maximizar Seus Resultados",
  },
  {
    category: "ferramentas-e-softwares",
    cover: `${UP}/2025/11/Person_programming_on_notebook_s%E2%80%A6_202606101811.jpeg`,
    date: "2025-11-05",
    excerpt:
      "A superfície da internet nunca está realmente silenciosa. Enquanto navegamos, trabalhamos ou simplesmente deixamos nossos sistemas rodando, um fluxo constante de bots, analistas, empresas de...",
    slug: "aprenda-como-automatizar-scans-de-vulnerabilidade",
    title: "Como Automatizar Scans de Vulnerabilidade (Legalmente)",
  },
  {
    category: "guias-e-tutoriais",
    cover: `${UP}/2026/01/image-2.jpeg`,
    date: "2026-01-12",
    excerpt:
      "Hoje em dia, qualquer pessoa que usa e-mail, redes sociais ou aplicativos de mensagens já se deparou com alguma tentativa de golpe que parecia completamente real. Um simples alerta de...",
    slug: "como-funciona-um-ataque-de-phishing-guia-completo",
    title: "Como Funciona um Ataque de Phishing",
  },
  {
    category: "inteligencia-artificial",
    cover: `${UP}/2025/04/Robots_creating_AI_brain_202605161217.jpeg`,
    date: "2025-04-15",
    excerpt:
      "Conheça os principais tipos de inteligência artificial e quais deles podem transformar seu trabalho.",
    slug: "as-21-opcoes-de-ia-que-voce-precisa-usar-em-2025",
    title:
      "Os 21 Tipos de Inteligência Artificial Que Você Vai Precisar em 2025",
  },
  {
    category: "guias-e-tutoriais",
    cover: `${UP}/2025/04/image-7.jpeg`,
    date: "2025-04-25",
    excerpt:
      "Entenda o que causa o erro 500 e veja o passo a passo para corrigir esse problema no seu site.",
    slug: "erro-500-entenda-como-corrigir-esse-problema-hoje",
    title: "Erro 500: Entenda Como Corrigir Esse Problema Hoje",
  },
];

export const categorySeeds = [
  ["inteligencia-artificial", "Inteligência Artificial"],
  ["analise-e-dados", "Análises & Dados"],
  ["automacoes-de-processos", "Automação de Processos"],
  ["ferramentas-e-softwares", "Ferramentas & Softwares"],
  ["novidades-e-tendencias", "Novidades & Tendências"],
  ["guias-e-tutoriais", "Guias & Tutoriais"],
  ["desenvolvimento-de-sites", "Desenvolvimento de Sites"],
  ["ideias-para-monetizacao", "Ideias para monetização"],
  ["desenvolvimento-de-sistemas", "Desenvolvimento de Sistemas"],
] as const;

export const posts: Post[] = seeds.map((s, i) => ({
  blocks: s.body ?? [block("text", { text: s.excerpt })],
  categoryId: `cat-${s.category}`,
  coverImage: s.cover,
  excerpt: s.excerpt,
  id: `post-${i + 1}`,
  publishedAt: s.date,
  slug: s.slug,
  status: "published",
  title: s.title,
}));
