import type { Block, Post } from "../../model/index.js";

const img = (id: string, w = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&q=80&auto=format&fit=crop`;

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `tpl-post-${seq++}`,
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

/** Posts de exemplo: textos genéricos para o dono do site substituir pelos próprios. */
const seeds: Seed[] = [
  {
    category: "roteiros",
    cover: img("1469474968028-56623f02e42e"),
    date: "2026-03-02",
    excerpt:
      "Um roteiro enxuto para quem tem poucos dias e quer aproveitar cada hora da viagem.",
    intro:
      "Poucos dias não significam uma viagem corrida. Com um roteiro bem pensado, dá para conhecer o essencial de um destino e ainda sobrar tempo para o improviso.",
    sections: [
      [
        "Escolha um tema para a viagem",
        "Gastronomia, natureza ou história: definir um fio condutor ajuda a cortar o que não importa e a decidir mais rápido.",
      ],
      [
        "Agrupe os passeios por região",
        "Passar o dia todo em trânsito é o erro mais comum. Reúna os pontos próximos no mesmo dia e deixe uma manhã livre.",
      ],
    ],
    slug: "roteiro-de-fim-de-semana-sem-correria",
    title: "Roteiro de Fim de Semana Sem Correria",
  },
  {
    category: "destinos",
    cover: img("1501785888041-af3ef285b470"),
    date: "2026-03-18",
    excerpt:
      "Lagos, montanhas e trilhas leves: destinos de natureza para desacelerar sem gastar muito.",
    intro:
      "Nem toda grande viagem precisa de avião. Alguns dos melhores cenários estão a poucas horas de estrada e cabem em qualquer orçamento.",
    sections: [
      [
        "Quando ir",
        "Fora da alta temporada o preço da hospedagem cai e as trilhas ficam vazias. Vale checar a previsão do tempo antes de fechar.",
      ],
      [
        "O que levar",
        "Roupas em camadas, calçado fechado e uma garrafa reutilizável resolvem a maior parte dos imprevistos.",
      ],
    ],
    slug: "destinos-de-natureza-para-desacelerar",
    title: "Destinos de Natureza Para Desacelerar",
  },
  {
    category: "dicas",
    cover: img("1488646953014-85cb44e25828"),
    date: "2026-04-05",
    excerpt:
      "Checklist simples para organizar documentos, reservas e pagamentos antes de sair de casa.",
    intro:
      "Metade do estresse de uma viagem vem de detalhes que poderiam ter sido resolvidos uma semana antes. Este checklist cobre o básico.",
    sections: [
      [
        "Documentos e seguros",
        "Confira a validade do passaporte ou documento de identidade, guarde cópias digitais e avalie um seguro-viagem.",
      ],
      [
        "Reservas em um só lugar",
        "Crie uma pasta com vouchers, endereços e telefones. Funciona até sem internet se você baixar os arquivos antes.",
      ],
    ],
    slug: "checklist-antes-de-viajar",
    title: "Checklist Antes de Viajar",
  },
  {
    category: "gastronomia",
    cover: img("1414235077428-338989a2e8c0"),
    date: "2026-04-20",
    excerpt:
      "Como encontrar restaurantes locais de verdade e fugir das armadilhas para turistas.",
    intro:
      "Comer bem em viagem raramente depende de sorte. Alguns hábitos simples levam você aos lugares que os moradores realmente frequentam.",
    sections: [
      [
        "Fuja do cardápio em cinco idiomas",
        "Quanto mais traduções na porta, maior a chance de o lugar existir só para turistas. Procure cardápios curtos e simples.",
      ],
      [
        "Pergunte a quem mora ali",
        "O recepcionista, o motorista e o dono da padaria costumam ter as melhores indicações, e quase sempre de graça.",
      ],
    ],
    slug: "como-comer-bem-como-um-morador-local",
    title: "Como Comer Bem Como um Morador Local",
  },
  {
    category: "estilo-de-vida",
    cover: img("1455390582262-044cdead277a"),
    date: "2026-05-04",
    excerpt:
      "Trabalhar de qualquer lugar parece sonho, mas exige rotina. Veja o que realmente funciona.",
    intro:
      "Trabalho remoto e viagem combinam, desde que você proteja seus horários e escolha bem onde vai ficar.",
    sections: [
      [
        "Internet vem primeiro",
        "Teste a conexão antes de reservar: peça uma captura de velocidade ao anfitrião e tenha um plano B com dados móveis.",
      ],
      [
        "Rotina fixa, cenário variável",
        "Manter horário de trabalho e de descanso evita que a viagem vire um expediente sem fim.",
      ],
    ],
    slug: "trabalhar-viajando-o-que-realmente-funciona",
    title: "Trabalhar Viajando: O Que Realmente Funciona",
  },
  {
    category: "equipamentos",
    cover: img("1469854523086-cc02fe5d8800"),
    date: "2026-05-19",
    excerpt:
      "Mala de mão, mochila ou carrinho? Um guia direto para escolher a bagagem certa.",
    intro:
      "A bagagem ideal depende do tipo de viagem, não do tamanho da sua vontade de levar coisas. Veja como decidir.",
    sections: [
      [
        "Mala de mão",
        "Evita filas, extravio e taxas. Para até uma semana, costuma ser suficiente se você repetir peças.",
      ],
      [
        "Mochila",
        "Melhor para trilhas e deslocamentos longos a pé. Escolha uma com bom suporte nas costas e cintos ajustáveis.",
      ],
    ],
    slug: "mala-de-mao-ou-mochila-como-escolher",
    title: "Mala de Mão ou Mochila: Como Escolher",
  },
  {
    category: "destinos",
    cover: img("1507525428034-b723cf961d3e"),
    date: "2026-06-02",
    excerpt:
      "Praias tranquilas para quem prefere ouvir o mar a disputar espaço na areia.",
    intro:
      "Existem litorais inteiros fora do circuito principal. Com um pouco de pesquisa, você encontra água limpa, preços justos e silêncio.",
    sections: [
      [
        "Pesquise pelo acesso",
        "Praias de difícil acesso costumam ser as mais vazias. Veja se há estrada de terra, barco ou trilha antes de ir.",
      ],
      [
        "Respeite o lugar",
        "Leve o lixo de volta e evite produtos que agridam o ambiente. Quanto menos impacto, mais tempo o lugar continua assim.",
      ],
    ],
    slug: "praias-tranquilas-longe-da-multidao",
    title: "Praias Tranquilas Longe da Multidão",
  },
  {
    category: "roteiros",
    cover: img("1476514525535-07fb3b4ae5f1"),
    date: "2026-06-21",
    excerpt:
      "Road trip bem planejada: trajeto, paradas e orçamento sem surpresas no meio da estrada.",
    intro:
      "Viajar de carro dá liberdade, mas pede organização. Planeje o trajeto em etapas e deixe folga para o que aparecer no caminho.",
    sections: [
      [
        "Divida em etapas",
        "Evite mais de quatro ou cinco horas de direção por dia. O cansaço acumulado estraga a viagem e é perigoso.",
      ],
      [
        "Orçamento de estrada",
        "Some combustível, pedágios, alimentação e uma reserva de 15% para imprevistos.",
      ],
    ],
    slug: "road-trip-planejamento-passo-a-passo",
    title: "Road Trip: Planejamento Passo a Passo",
  },
  {
    category: "dicas",
    cover: img("1522202176988-66273c2fd55f"),
    date: "2026-07-08",
    excerpt:
      "Viajar em grupo é mais divertido quando as regras estão claras desde o início.",
    intro:
      "Amigos que se dão bem no dia a dia nem sempre combinam em viagem. Alinhar expectativas antes evita a maior parte dos atritos.",
    sections: [
      [
        "Converse sobre dinheiro",
        "Defina como serão divididas as despesas comuns. Um aplicativo de contas compartilhadas resolve o resto.",
      ],
      [
        "Tempo separado também vale",
        "Um passeio por conta própria de vez em quando renova a energia do grupo.",
      ],
    ],
    slug: "viajar-em-grupo-sem-brigar",
    title: "Viajar em Grupo Sem Brigar",
  },
  {
    category: "estilo-de-vida",
    cover: img("1506905925346-21bda4d32df4"),
    date: "2026-07-26",
    excerpt:
      "Pequenos hábitos que tornam suas viagens mais leves, mais baratas e mais conscientes.",
    intro:
      "Viajar melhor não significa viajar mais. Pequenas escolhas mudam a experiência e o impacto que você deixa pelo caminho.",
    sections: [
      [
        "Fique mais tempo em menos lugares",
        "Conhecer um destino com calma rende memórias mais fortes do que cinco cidades em cinco dias.",
      ],
      [
        "Compre local",
        "Hospedagem familiar, mercados e guias da região mantêm o dinheiro na comunidade que recebe você.",
      ],
    ],
    slug: "habitos-para-viajar-com-mais-leveza",
    title: "Hábitos Para Viajar Com Mais Leveza",
  },
  {
    category: "equipamentos",
    cover: img("1488646953014-85cb44e25828"),
    date: "2026-08-12",
    excerpt:
      "Itens pequenos que ocupam pouco espaço e salvam a viagem quando algo dá errado.",
    intro:
      "Alguns objetos custam pouco, cabem em qualquer mala e resolvem problemas que poderiam estragar o dia.",
    sections: [
      [
        "Carregador portátil",
        "Mapas, passagens e fotos dependem da bateria. Um power bank é o item mais útil da lista.",
      ],
      [
        "Kit de primeiros socorros",
        "Curativos, analgésico e remédio para o estômago ocupam o espaço de uma mão e evitam correria atrás de farmácia.",
      ],
    ],
    slug: "itens-pequenos-que-salvam-a-viagem",
    title: "Itens Pequenos Que Salvam a Viagem",
  },
  {
    category: "gastronomia",
    cover: img("1414235077428-338989a2e8c0"),
    date: "2026-08-30",
    excerpt:
      "Feiras e mercados são a melhor porta de entrada para a cultura de qualquer lugar.",
    intro:
      "Quer entender uma cidade rápido? Comece pelo mercado. É ali que estão os ingredientes, as conversas e os sabores do dia a dia.",
    sections: [
      [
        "Vá cedo",
        "De manhã os produtos estão frescos e os vendedores têm tempo para explicar o que cada coisa é.",
      ],
      [
        "Experimente sem medo",
        "Peça porções pequenas e prove o que não conhece. A melhor refeição da viagem pode estar numa barraca.",
      ],
    ],
    slug: "mercados-e-feiras-como-porta-de-entrada",
    title: "Mercados e Feiras Como Porta de Entrada",
  },
  {
    category: "dicas",
    cover: img("1500530855697-b586d89ba3ee"),
    date: "2026-09-14",
    excerpt:
      "Como encontrar passagens e hospedagens mais baratas sem abrir mão do conforto.",
    intro:
      "Economizar em viagem é questão de flexibilidade e antecedência. Veja estratégias que funcionam na prática.",
    sections: [
      [
        "Flexibilize as datas",
        "Sair no meio da semana ou em baixa temporada pode cortar o preço pela metade.",
      ],
      [
        "Compare antes de fechar",
        "Pesquise em mais de um site e confira se o valor final inclui taxas. O mais barato na vitrine nem sempre é o mais barato na conta.",
      ],
    ],
    slug: "como-viajar-gastando-menos",
    title: "Como Viajar Gastando Menos",
  },
];

export const categorySeeds = [
  ["destinos", "Destinos"],
  ["roteiros", "Roteiros"],
  ["dicas", "Dicas de Viagem"],
  ["gastronomia", "Gastronomia"],
  ["estilo-de-vida", "Estilo de Vida"],
  ["equipamentos", "Equipamentos"],
] as const;

const bodyOf = (s: Seed): Block[] => [
  block("text", { text: s.intro }),
  ...s.sections.flatMap(([heading, text]) => [
    block("heading", { level: "h2", text: heading }),
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
