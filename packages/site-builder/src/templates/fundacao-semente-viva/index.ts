import type { Block, Page, Site, SiteTemplate } from "../../model/index.js";
import { BRAND } from "./brand.js";
import {
  ALBUM,
  AREA_PHOTO,
  CIRCLE,
  DONATE,
  FLOATS,
  HERO,
  IMG,
  PREVIEW,
  SAMPLE_VIDEO,
  TEAM,
} from "./images.js";
import { type LegalItem, privacidade, termos } from "./legal.js";
import { categories, posts } from "./posts.js";

/**
 * Template "Semente Viva — Fundação / ONG": site institucional de uma fundação (branco e verde) com a variante
 * `fundacao`. Home (hero com fotos em fade, áreas de atuação, quem somos em círculo de fotos, faixa de doação, notícias
 * em coverflow, projetos com vídeo), quem somos, como atuamos (abas por área), doação com PIX, notícias, galeria,
 * contato com mapa, páginas legais e 404. Layout medido numa fundação real; marca, textos, fotos e contatos são
 * fictícios (`brand.ts`, `images.ts`). Os dados da fundação e do PIX ficam em `theme` ("Página inteira" no editor).
 */

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Partial<Block>
): Block => ({
  id: `sv-${seq++}`,
  props,
  type,
  ...extra,
});

const page = (
  slug: string,
  title: string,
  blocks: Block[],
  extra?: Partial<Page>
): Page => ({
  blocks,
  id: `page-${slug || "home"}`,
  slug,
  status: "published",
  title,
  ...extra,
});

const LEGAL_BRAND = {
  cnpj: BRAND.cnpj,
  domain: BRAND.domain,
  email: BRAND.email,
  name: BRAND.legalName,
};

const socials = BRAND.socials.map(([label, url]) => ({ label, url }));

/* ───────────────────────── blocos comuns ───────────────────────── */

const header = () => [
  block("svHeader", {
    donateLabel: "Doe agora",
    donateUrl: "/doacao/",
    logo: IMG.logo,
    searchButton: "Buscar",
    searchLabel: "Buscar nas notícias",
    searchPlaceholder: "Buscar nas notícias…",
    searchUrl: "/noticias/",
    socials,
    topLinks: [
      { label: "Sobre", url: "/quem-somos/" },
      { label: "Atuação", url: "/como-atuamos/" },
    ],
  }),
];

const footer = () => [
  block("svFooter", {
    about:
      "Uma instituição sem fins lucrativos, mantida por doações e parcerias, que leva esporte, educação e cuidado a quem mais precisa.",
    addressLabel: "Endereço:",
    cnpjLabel: "CNPJ:",
    contactTitle: "Contato",
    copyright: BRAND.copyright,
    emailLabel: "E-mail:",
    hoursLabel: "Horário:",
    logo: IMG.logoLight,
    menuTitle: "Menu",
    phoneLabel: "Telefone:",
    socials,
    socialsTitle: "Redes sociais",
  }),
  block("scrollTop", {
    bottom: 30,
    color: "#007E08",
    hoverColor: "#04CC40",
    iconColor: "#FFFFFF",
    label: "Voltar ao topo",
    radius: 23,
    side: "right",
    sideGap: 24,
    size: 46,
    threshold: 300,
  }),
];

/** Faixa de título das páginas internas + o resto da página. */
const inner = (title: string, rest: Block[]) => [
  block("svPageHero", { title }),
  ...rest,
];

/* ───────────────────────── áreas, equipe, abas ───────────────────────── */

const areas = [
  {
    icon: "ball",
    text: "Treinos para crianças e adolescentes, com disciplina, respeito e trabalho em equipe.",
    title: "Esporte",
  },
  {
    icon: "cap",
    text: "Formação profissional gratuita para quem busca o primeiro emprego ou uma recolocação.",
    title: "Cursos",
  },
  {
    icon: "book",
    text: "Reforço escolar e oficinas de leitura com professores voluntários.",
    title: "Educação",
  },
  {
    icon: "users",
    text: "Encontros semanais com atividades físicas, rodas de conversa e acompanhamento de saúde.",
    title: "Melhor idade",
  },
];

const tabs = [
  {
    alt: "Crianças de uniforme reunidas em campo de futebol",
    image: AREA_PHOTO.esporte,
    label: "Esporte",
    text: "Os treinos acontecem três vezes por semana, em turmas por faixa etária, com professores de educação física e voluntários.\n\nAlém de futebol, há vôlei, atletismo e jogos cooperativos. Mais do que formar atletas, queremos formar pessoas que sabem trabalhar em equipe.",
    title: "Esporte para crianças e adolescentes",
  },
  {
    alt: "Participantes de uma oficina de trabalho em grupo",
    image: AREA_PHOTO.cursos,
    label: "Cursos",
    text: "Oferecemos cursos gratuitos de informática, atendimento ao cliente, artesanato e panificação, com certificado de conclusão.\n\nAs turmas são montadas conforme a procura da comunidade, e há aulas à noite para quem trabalha durante o dia.",
    title: "Formação profissional",
  },
  {
    alt: "Duas crianças lendo juntas",
    image: AREA_PHOTO.educacao,
    label: "Educação",
    text: "O reforço escolar atende estudantes do ensino fundamental, duas vezes por semana, em turmas pequenas.\n\nHá também oficinas de leitura, contação de histórias e rodas de conversa com as famílias.",
    title: "Reforço escolar e leitura",
  },
  {
    alt: "Casal de idosos caminhando em um jardim",
    image: AREA_PHOTO.idosos,
    label: "Melhor idade",
    text: "Nos encontros semanais, os idosos fazem alongamento e caminhada orientada, participam de rodas de conversa e têm a pressão e a glicemia acompanhadas por profissionais de saúde voluntários.\n\nO objetivo é combater o isolamento e manter a autonomia.",
    title: "Cuidado e convivência",
  },
];

const schedule = [
  {
    activity: "Treino de futebol (8 a 12 anos)",
    day: "Segunda e quarta",
    time: "14h às 15h30",
  },
  {
    activity: "Treino de futebol (13 a 17 anos)",
    day: "Segunda e quarta",
    time: "16h às 17h30",
  },
  { activity: "Reforço escolar", day: "Terça e quinta", time: "14h às 16h" },
  {
    activity: "Curso de informática básica",
    day: "Segunda a quinta",
    time: "19h às 21h",
  },
  { activity: "Encontro da melhor idade", day: "Sexta", time: "9h às 11h" },
  {
    activity: "Oficina de leitura para famílias",
    day: "Sábado (quinzenal)",
    time: "10h às 12h",
  },
];

/* ───────────────────────── páginas ───────────────────────── */

const home = page("", "Plantando hoje o futuro da nossa comunidade", [
  block("svHero", {
    fadeMs: 500,
    line1: "Construindo o amanhã:",
    line2: "juntos, plantamos sementes de um futuro melhor",
    primaryLabel: "Doe agora",
    primaryUrl: "/doacao/",
    secondaryLabel: "Conheça nossos projetos",
    secondaryUrl: "#projetos",
    seconds: 5,
    slides: HERO,
    veil: "#00000059",
  }),
  block(
    "svAreas",
    { items: areas, overlap: "yes" },
    { fx: { "1.1": { each: true, enter: "fadeInUp", stagger: 100 } } }
  ),
  block(
    "svAbout",
    {
      bottomGap: 200,
      eyebrow: "Quem somos",
      fadeMs: 500,
      linkLabel: "Conheça nossa história",
      linkUrl: "/quem-somos/",
      more: "",
      particles: "yes",
      photos: CIRCLE,
      seconds: 5,
      tag: "DESDE 2012",
      text: "A Fundação Semente Viva é uma instituição sem fins lucrativos, mantida por doações e parcerias, que leva esporte, educação e cuidado a crianças, jovens e idosos da nossa cidade.",
      title: "Nascemos para cuidar de quem mais precisa",
    },
    { fx: { "1.2.2": { enter: "fadeInUp" } } }
  ),
  block(
    "svDonateBand",
    {
      buttonLabel: "Quero doar",
      buttonUrl: "/doacao/",
      particles: "yes",
      title: "Seja um colaborador",
    },
    { fx: { "1.2": { enter: "fadeInUp" } } }
  ),
  block("svSocialCarousel", {
    count: 3,
    eyebrow: "Notícias da fundação",
    items: socials,
    moreLabel: "Ver todas as notícias",
    moreUrl: "/noticias/",
    particles: "yes",
    seconds: 5,
    source: "news",
    speed: 300,
    title: "Acompanhe nossas ações",
  }),
  block(
    "svProjects",
    {
      linkLabel: "Conheça",
      linkUrl: "/como-atuamos/",
      particles: "no",
      photos: FLOATS,
      playLabel: "Assistir ao vídeo dos projetos",
      subtitle:
        "Esporte, cursos, educação, cuidado com os idosos e muito mais.",
      title1: "PROJETOS",
      title2: "DESENVOLVIDOS",
      videoUrl: SAMPLE_VIDEO,
    },
    { anchor: "projetos" }
  ),
]);

const about = page(
  "quem-somos",
  "Quem somos",
  inner("Quem somos", [
    block("svAbout", {
      bottomGap: 60,
      eyebrow: "Nossa história",
      fadeMs: 500,
      linkLabel: "",
      linkUrl: "",
      more: "Tudo começou em 2012, com um campinho de terra e meia dúzia de crianças que treinavam depois da escola. Os vizinhos começaram a ajudar com bolas, lanche e tempo, e a turma foi crescendo.\n\nHoje a fundação mantém projetos de esporte, cursos profissionalizantes, reforço escolar e encontros para a melhor idade, sempre com o trabalho de voluntários e o apoio de empresas e moradores da região.\n\nNossa prioridade é simples: oferecer oportunidades iguais, com respeito e cuidado, para que cada pessoa possa crescer onde vive.",
      particles: "yes",
      photos: CIRCLE,
      seconds: 5,
      tag: "DESDE 2012",
      text: "Somos uma instituição sem fins lucrativos que cuida de quem mais precisa, com esporte, educação e convivência.",
      title: "Uma história feita de gente",
    }),
    block("svAreas", {
      eyebrow: "Onde atuamos",
      items: areas,
      overlap: "no",
      subtitle: "Quatro frentes de trabalho, todas abertas à comunidade.",
      title: "Áreas de atuação",
    }),
    block("svMap", {
      address: "",
      height: 420,
      mapTitle: "Mapa com a localização da fundação",
      title: "Localização",
    }),
    block("svTeam", {
      eyebrow: "Equipe",
      members: TEAM,
      subtitle: "Conheça quem faz a diferença todos os dias",
      title: "Nossos profissionais",
    }),
  ])
);

const how = page(
  "como-atuamos",
  "Como atuamos",
  inner("Como atuamos", [
    block("svHowWeWork", {
      activityHead: "Atividade",
      dayHead: "Dia",
      doubtsLabel: "Fale com a gente",
      doubtsText:
        "Tire suas dúvidas sobre horários, matrículas e como participar das atividades.",
      doubtsTitle: "Dúvidas?",
      doubtsUrl: "",
      eyebrow: "Atuação",
      playLabel: "Assistir ao vídeo sobre a atuação",
      rows: schedule,
      scheduleTitle: "Organização geral das atividades",
      tabs,
      tabsLabel: "Áreas de atuação",
      text: "Atuamos em quatro frentes, todas gratuitas e abertas à comunidade. Escolha uma área para saber como funciona.",
      timeHead: "Horário",
      title: "Como atuamos",
      videoLabel: "Conheça",
      videoUrl: SAMPLE_VIDEO,
    }),
  ])
);

const donate = page(
  "doacao",
  "Doação",
  inner("Doação", [
    block("svDonate", {
      alt: "Mãos formando um coração vermelho",
      buttonLabel: "Quero doar",
      closing: "Obrigado por plantar esta semente conosco.",
      ctaText:
        "Toda contribuição, grande ou pequena, vira esporte, estudo e cuidado para quem mais precisa.",
      ctaTitle: "Sua doação faz a diferença",
      highlight: "Com R$ 1 por dia você ajuda a manter uma criança no esporte.",
      image: DONATE,
      text: "Nosso trabalho existe graças a pessoas que acreditam em um futuro melhor para a comunidade. Cada doação ajuda a manter os treinos, as aulas e os encontros com os idosos.\n\nVocê pode contribuir pelo PIX, quando e quanto quiser. Todo o valor é usado nos projetos da fundação.",
      title: "Como ajudar?",
    }),
    block("svPix", { layout: "popup", showInEditor: "no", title: "Nosso PIX" }),
    block(
      "svPix",
      { layout: "inline", title: "Doe pelo PIX" },
      { anchor: "pix" }
    ),
  ])
);

const news = page(
  "noticias",
  "Notícias",
  inner("Notícias", [
    block("svNews", {
      category: "",
      emptyText: "Nenhuma notícia encontrada.",
      eyebrow: "Notícias da fundação",
      followTitle: "Acompanhe também nas redes",
      limit: 12,
      readLabel: "Ler notícia",
      socials,
      title: "Acompanhe nossas ações",
    }),
  ]),
  { wide: true }
);

const gallery = page(
  "galeria",
  "Galeria",
  inner("Galeria", [
    block("svAlbums", {
      eyebrow: "Galeria",
      items: [
        {
          alt: "Crianças de uniforme em campo de futebol",
          image: ALBUM.campeonato,
          linkLabel: "Ver álbum",
          title: "Campeonato de futebol",
          url: "",
        },
        {
          alt: "Participantes de uma oficina em grupo",
          image: ALBUM.atividades,
          linkLabel: "Ver álbum",
          title: "Cursos e oficinas",
          url: "",
        },
        {
          alt: "Duas crianças lendo juntas",
          image: ALBUM.sala,
          linkLabel: "Ver álbum",
          title: "Reforço escolar",
          url: "",
        },
        {
          alt: "Casal de idosos caminhando em um jardim",
          image: ALBUM.idosos,
          linkLabel: "Ver álbum",
          title: "Encontros da melhor idade",
          url: "",
        },
      ],
      subtitle: "Momentos que registram o trabalho da fundação",
      title: "Nossos álbuns",
    }),
  ]),
  { wide: true }
);

const contact = page(
  "contato",
  "Contato",
  inner("Contato", [
    block("svContact", {
      actionUrl: "",
      addressLabel: "Endereço",
      buttonLabel: "Enviar",
      emailLabel: "E-mail",
      emailPlaceholder: "Seu e-mail",
      fallback: "Se preferir, escreva para",
      formTitle: "Entre em contato",
      hoursLabel: "Horário",
      infoText:
        "Fale com a gente para conhecer os projetos, visitar a fundação, ser voluntário ou doar. Respondemos em até dois dias úteis.",
      infoTitle: "Detalhes para contato",
      messagePlaceholder: "Sua mensagem",
      namePlaceholder: "Seu nome",
      phoneLabel: "Telefone",
      phonePlaceholder: "Telefone",
    }),
    block("svMap", {
      address: "",
      height: 420,
      mapTitle: "Mapa com a localização da fundação",
      title: "Localização",
    }),
  ])
);

const legal = (slug: string, title: string, items: LegalItem[]) =>
  page(
    slug,
    title,
    inner(title, [
      ...items.map(([kind, text]) =>
        kind === "h"
          ? block("heading", { align: "left", level: "h2", subtitle: "", text })
          : block("text", { text: kind === "li" ? `• ${text}` : text })
      ),
    ]),
    { prose: true }
  );

const notFound = page(
  "404",
  "Página não encontrada",
  inner("Página não encontrada", [
    block("svNotFound", {
      backLabel: "Voltar ao início",
      backUrl: "/",
      code: "404",
      text: "A página que você procura não existe ou mudou de endereço.",
      title: "Ops, não encontramos essa página",
    }),
  ])
);

/* ───────────────────────── site ───────────────────────── */

const site: Site = {
  categories,
  categoryLayout: [
    block("svPageHero", {
      crumb: "",
      parentLabel: "Notícias",
      parentUrl: "/noticias/",
      title: "",
    }),
    block("svNews", {
      category: "",
      eyebrow: "",
      followTitle: "",
      limit: 24,
      title: "",
    }),
  ],
  footer: footer(),
  header: header(),
  menu: [
    { href: "/", label: "Início" },
    { href: "/quem-somos/", label: "Quem somos" },
    { href: "/como-atuamos/", label: "Como atuamos" },
    { href: "/noticias/", label: "Notícias" },
    { href: "/galeria/", label: "Galeria" },
    { href: "/contato/", label: "Contato" },
  ],
  name: BRAND.name,
  pages: [
    home,
    about,
    how,
    donate,
    news,
    gallery,
    contact,
    legal("privacidade", "Política de Privacidade", privacidade(LEGAL_BRAND)),
    legal("termos", "Termos de Uso", termos(LEGAL_BRAND)),
    notFound,
  ],
  postLayout: [
    block("svPageHero", {
      crumb: "",
      parentLabel: "Notícias",
      parentUrl: "/noticias/",
      title: "",
    }),
    block("svPostBody", {
      ctaLabel: "Doe agora",
      ctaText:
        "Sua doação mantém os projetos da fundação funcionando o ano todo.",
      ctaTitle: "Apoie nosso trabalho",
      ctaUrl: "/doacao/",
    }),
  ],
  posts,
  theme: {
    accent: "#007E08",
    address: BRAND.address,
    bg: "#ffffff",
    cnpj: BRAND.cnpj,
    contactEmail: BRAND.email,
    favicon: IMG.favicon,
    fg: "#1A1B1E",
    fontBody: "'Red Hat Text', sans-serif",
    fontHeading: "'Red Hat Display', sans-serif",
    hours: BRAND.hours,
    muted: "#606060",
    phone: BRAND.phone,
    pixCity: BRAND.pix.city,
    pixId: "",
    pixKey: BRAND.pix.key,
    pixKeyType: BRAND.pix.keyType,
    pixQr: IMG.qrExample,
    pixReceiver: BRAND.pix.receiver,
    seoDescription:
      "Fundação sem fins lucrativos que leva esporte, cursos, reforço escolar e cuidado com os idosos à comunidade. Conheça os projetos e doe pelo PIX.",
    variant: "fundacao",
    whatsapp: BRAND.whatsapp,
  },
};

export const fundacaoSementeViva: SiteTemplate = {
  description:
    "Fundação ou ONG, branco e verde: hero com fotos em sequência, áreas de atuação em cartões, quem somos com fotos em círculo, faixa de doação, notícias, projetos com vídeo, página de doação com PIX, equipe e contato com mapa.",
  id: "fundacao-semente-viva",
  name: "Semente Viva — Fundação / ONG",
  preview: PREVIEW,
  site,
  tags: ["Institucional", "ONG"],
};
