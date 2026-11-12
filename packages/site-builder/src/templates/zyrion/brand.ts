/**
 * Marca do template "Portal Zyrion": tudo que identifica o portal fica aqui (nome, contatos, redes, textos
 * da comunidade, preço). É uma marca **fictícia** — o layout é do zyrionbrazil.com, o conteúdo não.
 * Trocar a marca = editar este arquivo (ou o site no editor).
 */
export const BRAND = {
  author: "Redação Nova Pauta",
  community: {
    benefits: [
      [
        "Enquetes exclusivas",
        "opine sobre os temas do momento e veja o resultado antes de todo mundo.",
      ],
      [
        "Conteúdo antecipado",
        "receba as principais matérias horas antes da publicação.",
      ],
      [
        "Clube de Benefícios",
        "descontos em lojas, cursos e serviços de parceiros.",
      ],
      [
        "Clube de Experiências",
        "sorteios e convites para eventos e transmissões ao vivo.",
      ],
      ["Exclusividade", "newsletter e bastidores que não saem no portal."],
      [
        "Envie notícias e acontecimentos",
        "mande a pauta da sua cidade direto para a redação.",
      ],
    ] as [string, string][],
    checkoutUrl: "#",
    features: [
      "Acesso a todas as enquetes",
      "Conteúdo antecipado",
      "Clube de Benefícios",
      "Clube de Experiências",
      "Cancele quando quiser",
    ],
    intro:
      "Mais do que ler notícias, na comunidade Nova Pauta você ajuda a escolher os assuntos, recebe conteúdo antes e ganha vantagens exclusivas.",
    planName: "Member",
    price: "2,00",
  },
  copyrightName: "Nova Pauta",
  domain: "novapauta.com.br",
  email: "contato@novapauta.com.br",
  legalName: "Nova Pauta Comunicação",
  name: "Nova Pauta",
  slogan: "Notícias • Negócios • Entretenimento",
  socials: [
    ["Instagram", "https://instagram.com/"],
    ["Facebook", "https://facebook.com/"],
    ["X", "https://x.com/"],
    ["Threads", "https://threads.net/"],
    ["TikTok", "https://tiktok.com/"],
    ["YouTube", "https://youtube.com/"],
  ] as [string, string][],
} as const;
