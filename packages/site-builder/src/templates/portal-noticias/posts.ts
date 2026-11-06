import type { Block, Post } from "../../model/index.js";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `tpl-news-${seq++}`,
  props,
  type,
});

interface Seed {
  category: string;
  cover: string;
  date: string;
  excerpt: string;
  intro: string;
  sections: [heading: string, text: string][];
  slug: string;
  title: string;
}

/** Matérias de exemplo: fictícias e genéricas, para o dono do site substituir pelas próprias. */
const seeds: Seed[] = [
  {
    category: "economia",
    cover: img("1486406146926-c627a92ad1ab"),
    date: "2026-10-30",
    excerpt:
      "Medida deve movimentar o comércio local e criar milhares de vagas nos próximos meses, segundo estimativa preliminar.",
    intro:
      "O pacote de incentivos anunciado nesta semana prevê crédito facilitado para pequenos negócios e redução de burocracia na abertura de empresas.",
    sections: [
      [
        "O que muda para o pequeno empresário",
        "A principal novidade é a criação de uma linha de crédito com juros menores e prazo maior de carência. A expectativa é que o processo de abertura de empresas caia de semanas para poucos dias.",
      ],
      [
        "Próximos passos",
        "O texto ainda precisa ser detalhado em regulamento. Entidades do setor pedem que as regras sejam divulgadas com antecedência para que os negócios possam se planejar.",
      ],
    ],
    slug: "pacote-de-incentivos-pequenos-negocios",
    title:
      "Pacote de incentivos prevê crédito facilitado para pequenos negócios",
  },
  {
    category: "politica",
    cover: img("1589829545856-d10d557cf95f"),
    date: "2026-10-30",
    excerpt:
      "Proposta que muda regras de transparência de gastos públicos passa por comissão e segue para votação em plenário.",
    intro:
      "A comissão aprovou, por ampla maioria, o texto que obriga órgãos públicos a divulgar gastos em formato aberto e atualizado semanalmente.",
    sections: [
      [
        "O que prevê o texto",
        "Contratos, pagamentos e licitações deverão ser publicados em painel único, com busca por fornecedor e por valor.",
      ],
      [
        "Resistência",
        "Parte dos parlamentares questiona o custo de implantação para municípios pequenos e quer um prazo maior de adaptação.",
      ],
    ],
    slug: "comissao-aprova-transparencia-de-gastos",
    title:
      "Comissão aprova projeto que amplia transparência de gastos públicos",
  },
  {
    category: "esporte",
    cover: img("1579952363873-27f3bade9f55"),
    date: "2026-10-29",
    excerpt:
      "Time da casa vence nos acréscimos, assume a liderança e embala torcida para a reta final do campeonato.",
    intro:
      "Em jogo movimentado, o gol da vitória saiu aos 48 minutos do segundo tempo e colocou a equipe no topo da tabela.",
    sections: [
      [
        "Como foi o jogo",
        "A partida teve domínio alternado, com duas bolas na trave e uma defesa decisiva do goleiro no fim do primeiro tempo.",
      ],
      [
        "Próximo compromisso",
        "A equipe volta a campo no domingo, em casa, diante do atual vice-líder.",
      ],
    ],
    slug: "time-da-casa-vence-e-assume-lideranca",
    title: "Time da casa vence nos acréscimos e assume a liderança",
  },
  {
    category: "tecnologia",
    cover: img("1518770660439-4636190af475"),
    date: "2026-10-29",
    excerpt:
      "Novo chip promete dobrar a autonomia de celulares e notebooks sem aumentar o preço dos aparelhos.",
    intro:
      "Pesquisadores apresentaram um processador que consome menos energia em tarefas do dia a dia, como navegação e vídeo.",
    sections: [
      [
        "Quando chega ao mercado",
        "Os primeiros aparelhos com a tecnologia devem ser lançados no próximo semestre, segundo os fabricantes.",
      ],
      [
        "O que dizem os especialistas",
        "Analistas lembram que os ganhos de bateria dependem também de software e do uso real, e pedem cautela com os números de laboratório.",
      ],
    ],
    slug: "novo-chip-promete-dobrar-autonomia",
    title: "Novo chip promete dobrar a autonomia da bateria de celulares",
  },
  {
    category: "saude",
    cover: img("1576091160399-112ba8d25d1d"),
    date: "2026-10-28",
    excerpt:
      "Campanha de vacinação é ampliada e unidades de saúde passam a funcionar também aos sábados.",
    intro:
      "A secretaria de saúde informou que a medida busca atingir quem não consegue ir às unidades durante a semana.",
    sections: [
      [
        "Quem pode se vacinar",
        "A vacinação está aberta a todas as pessoas dentro do grupo indicado pelo calendário oficial. É preciso levar documento com foto e a caderneta.",
      ],
      [
        "Onde procurar",
        "A lista de unidades participantes está disponível no site da secretaria e nos canais oficiais de atendimento.",
      ],
    ],
    slug: "campanha-de-vacinacao-ampliada-aos-sabados",
    title: "Campanha de vacinação é ampliada e postos abrem aos sábados",
  },
  {
    category: "cultura",
    cover: img("1514525253161-7a46d19cd819"),
    date: "2026-10-28",
    excerpt:
      "Festival reúne mais de cem atrações gratuitas em palcos espalhados pelo centro histórico.",
    intro:
      "Música, teatro e dança ocupam praças e casarões durante todo o fim de semana, com programação para toda a família.",
    sections: [
      [
        "Programação",
        "Os shows principais começam às 18h. Durante o dia, oficinas e apresentações infantis acontecem nas praças.",
      ],
      [
        "Como chegar",
        "O trânsito será desviado em algumas ruas. A organização recomenda transporte público e reforça a linha especial de ônibus.",
      ],
    ],
    slug: "festival-reune-cem-atracoes-gratuitas",
    title: "Festival reúne mais de cem atrações gratuitas no centro histórico",
  },
  {
    category: "economia",
    cover: img("1460925895917-afdab827c52f"),
    date: "2026-10-27",
    excerpt:
      "Índice que mede o custo de vida desacelera e fica abaixo da expectativa do mercado pelo segundo mês seguido.",
    intro:
      "Alimentos e transporte foram os grupos que mais contribuíram para a queda, segundo o levantamento divulgado nesta manhã.",
    sections: [
      [
        "O que pesou",
        "A queda no preço de itens in natura compensou a alta moderada em serviços e energia.",
      ],
      [
        "Efeito nos juros",
        "A desaceleração reforça a aposta de analistas em uma redução gradual da taxa básica nas próximas reuniões.",
      ],
    ],
    slug: "inflacao-desacelera-pelo-segundo-mes",
    title: "Inflação desacelera pelo segundo mês e fica abaixo do esperado",
  },
  {
    category: "politica",
    cover: img("1529107386315-e1a2ed48a620"),
    date: "2026-10-27",
    excerpt:
      "Moradores participam de audiência pública para discutir o plano de mobilidade da cidade.",
    intro:
      "Mais de 300 pessoas acompanharam a audiência, que reuniu técnicos, vereadores e representantes de associações de bairro.",
    sections: [
      [
        "Principais pontos",
        "O plano prevê novas faixas exclusivas de ônibus, ciclovias e a revisão dos horários das linhas mais cheias.",
      ],
      [
        "Como participar",
        "As sugestões podem ser enviadas pelo site da prefeitura até o fim do mês.",
      ],
    ],
    slug: "audiencia-publica-discute-plano-de-mobilidade",
    title:
      "Audiência pública reúne moradores para discutir plano de mobilidade",
  },
  {
    category: "esporte",
    cover: img("1461896836934-ffe607ba8211"),
    date: "2026-10-26",
    excerpt:
      "Corrida de rua reúne cinco mil atletas e bate recorde de inscrições na cidade.",
    intro:
      "Percursos de 5 e 10 quilômetros fecharam parte da orla neste domingo, com largada em ondas para evitar aglomeração.",
    sections: [
      [
        "Resultados",
        "Os vencedores das duas distâncias foram premiados na linha de chegada. A organização já anunciou a data da próxima edição.",
      ],
    ],
    slug: "corrida-de-rua-bate-recorde-de-inscricoes",
    title:
      "Corrida de rua reúne cinco mil atletas e bate recorde de inscrições",
  },
  {
    category: "tecnologia",
    cover: img("1451187580459-43490279c0fa"),
    date: "2026-10-26",
    excerpt:
      "Estudo mostra que metade das empresas já usa inteligência artificial em alguma etapa do trabalho.",
    intro:
      "A pesquisa ouviu gestores de diferentes setores e aponta atendimento e análise de dados como as áreas que mais adotaram a tecnologia.",
    sections: [
      [
        "Desafios",
        "Falta de capacitação e preocupação com privacidade aparecem entre os principais obstáculos relatados pelas empresas.",
      ],
    ],
    slug: "metade-das-empresas-ja-usa-inteligencia-artificial",
    title: "Metade das empresas já usa inteligência artificial, aponta estudo",
  },
  {
    category: "saude",
    cover: img("1559027615-cd4628902d4a"),
    date: "2026-10-25",
    excerpt:
      "Especialistas explicam como pequenas mudanças na rotina ajudam a dormir melhor e a ter mais disposição.",
    intro:
      "Horário fixo para dormir, menos telas à noite e luz natural pela manhã estão entre as recomendações mais simples e eficazes.",
    sections: [
      [
        "Quando procurar ajuda",
        "Se o cansaço persiste por semanas mesmo com bons hábitos, vale conversar com um médico para investigar outras causas.",
      ],
    ],
    slug: "habitos-simples-melhoram-o-sono",
    title: "Hábitos simples ajudam a melhorar o sono, dizem especialistas",
  },
  {
    category: "cultura",
    cover: img("1477959858617-67f85cf4f1df"),
    date: "2026-10-25",
    excerpt:
      "Exposição sobre a história da cidade em fotografias antigas chega ao último fim de semana.",
    intro:
      "Mais de 200 imagens mostram a transformação de ruas, praças e prédios ao longo de um século.",
    sections: [
      [
        "Serviço",
        "A entrada é gratuita e a visitação vai de terça a domingo, das 10h às 18h. Grupos escolares podem agendar visita guiada.",
      ],
    ],
    slug: "exposicao-de-fotografias-antigas-ultimo-fim-de-semana",
    title: "Exposição de fotos antigas da cidade tem último fim de semana",
  },
  {
    category: "economia",
    cover: img("1486406146926-c627a92ad1ab"),
    date: "2026-10-24",
    excerpt:
      "Prefeitura abre cadastro para lojistas interessados em reformar fachadas com apoio financeiro.",
    intro:
      "O programa prevê financiamento de parte da obra e prazo de seis meses para a conclusão dos trabalhos.",
    sections: [
      [
        "Como participar",
        "O cadastro é feito pela internet e exige documento do imóvel e orçamento da reforma.",
      ],
    ],
    slug: "reforma-de-fachadas-no-centro-historico",
    title: "Centro histórico ganha programa de reforma de fachadas",
  },
  {
    category: "esporte",
    cover: img("1579952363873-27f3bade9f55"),
    date: "2026-10-24",
    excerpt:
      "Equipe marcou aos 49 minutos do segundo tempo e chegou a 12 pontos na tabela.",
    intro:
      "A partida estava empatada até o último lance, quando a bola sobrou na área e foi para o fundo da rede.",
    sections: [
      [
        "Próximo jogo",
        "O time volta a campo no meio da semana, fora de casa, contra o vice-líder.",
      ],
    ],
    slug: "gol-nos-acrescimos-garante-lideranca-isolada",
    title: "Gol nos acréscimos garante liderança isolada no estadual",
  },
  {
    category: "tecnologia",
    cover: img("1518770660439-4636190af475"),
    date: "2026-10-23",
    excerpt:
      "Mudança vale para todas as cidades e inclui taxas e pedágios no valor exibido.",
    intro:
      "A atualização chega aos celulares ao longo da semana e não exige instalação manual.",
    sections: [
      [
        "O que muda",
        "Além do preço final, o aplicativo mostra o tempo estimado de espera e a avaliação do motorista.",
      ],
    ],
    slug: "aplicativo-mostra-preco-final-antes-da-corrida",
    title:
      "Aplicativo de transporte passa a mostrar preço final antes da corrida",
  },
  {
    category: "cultura",
    cover: img("1514525253161-7a46d19cd819"),
    date: "2026-10-23",
    excerpt:
      "Programação gratuita começa na sexta e termina no domingo à noite.",
    intro:
      "Mais de 30 grupos se apresentam em palcos montados no centro, com atividades para crianças durante o dia.",
    sections: [
      [
        "Programação",
        "A lista completa de horários está disponível no site da organização.",
      ],
    ],
    slug: "festival-de-musica-reune-bandas-locais",
    title: "Festival de música reúne bandas locais em três praças",
  },
  {
    category: "saude",
    cover: img("1576091160399-112ba8d25d1d"),
    date: "2026-10-22",
    excerpt:
      "Medida atende pedido de trabalhadores que não conseguem consultas em horário comercial.",
    intro:
      "A ampliação vale para 18 unidades e inclui vacinação, curativos e consultas agendadas.",
    sections: [
      [
        "Como agendar",
        "O agendamento pode ser feito por telefone ou pelo aplicativo da secretaria.",
      ],
    ],
    slug: "postos-de-saude-estendem-horario-de-atendimento",
    title: "Postos de saúde estendem horário de atendimento até as 20h",
  },
  {
    category: "politica",
    cover: img("1589829545856-d10d557cf95f"),
    date: "2026-10-22",
    excerpt:
      "Texto prevê divulgação mensal do andamento de cada obra e justificativa para atrasos.",
    intro: "A proposta foi aprovada em votação simbólica e segue para sanção.",
    sections: [
      [
        "Próximos passos",
        "Se sancionada, a regra passa a valer a partir do próximo ano.",
      ],
    ],
    slug: "camara-aprova-revisao-do-calendario-de-obras",
    title: "Câmara aprova revisão do calendário de obras públicas",
  },
];

export const categorySeeds = [
  ["politica", "Política"],
  ["economia", "Economia"],
  ["esporte", "Esporte"],
  ["tecnologia", "Tecnologia"],
  ["saude", "Saúde"],
  ["cultura", "Cultura"],
] as const;

const bodyOf = (s: Seed): Block[] => [
  block("text", { text: s.intro }),
  ...s.sections.flatMap(([heading, text]) => [
    block("heading", {
      align: "left",
      level: "h2",
      subtitle: "",
      text: heading,
    }),
    block("text", { text }),
  ]),
];

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
