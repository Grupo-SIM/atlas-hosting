import type { Block, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "Atlas Hosting": cópia de atlashosting.com.br (home, VPS em nuvem, Cloud VDS, VPS de armazenamento,
 * VPS Windows, termos e privacidade) com a variante `atlas`. Textos e links vêm do original; os preços são os
 * valores em reais de hoje (o original converte do euro na hora). Imagens, vídeo e o JSON do mapa seguem
 * hospedados no Atlas.
 */
const ATLAS = "https://atlashosting.com.br";
const IMG = {
  logo: `${ATLAS}/atlas-logo.png`,
  map: `${ATLAS}/Homepage%20-map%20dark%20blue%201.json`,
  pattern: `${ATLAS}/Camada_landing.svg`,
  video: `${ATLAS}/vecteezy_powerful-server-room-in-modern-data-center-cloud-computing_7999282.mp4`,
};
const FACES = (n: string) => `${ATLAS}/landing/testimonials/${n}.jpg`;

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  anchor?: string
): Block => ({
  id: `at-${seq++}`,
  props,
  type,
  ...(anchor ? { anchor } : {}),
});

const SIGNUP = `${ATLAS}/signup`;
const LOGIN = `${ATLAS}/login`;

const header = block("atHeader", {
  links: [
    { label: "Planos", url: "/#planos" },
    { label: "Depoimentos", url: "/#testimonials" },
  ],
  loginLabel: "Login",
  loginUrl: LOGIN,
  logo: IMG.logo,
  logoAlt: "Atlas Hosting",
  menuLabel: "VPS",
  menuUrl: "/vps",
  signupLabel: "Cadastre-se",
  signupUrl: SIGNUP,
  submenu: [
    { label: "VPS em nuvem", url: "/vps" },
    { label: "Cloud VDS", url: "/vds" },
    { label: "VPS de armazenamento", url: "/vps-armazenamento" },
    { label: "VPS Windows", url: "/vps-windows" },
  ],
});

const footer = block("atFooter", {
  blogs: [
    { label: "007SpyHacker", url: "https://007spyhacker.com/" },
    { label: "Central do Marketing", url: "https://centraldomarketing.com/" },
    { label: "Seguidores em Alta", url: "https://seguidoresemalta.com/" },
    { label: "Marketing Raiz", url: "https://marketingraiz.com/" },
    { label: "Zyrion Brazil", url: "https://zyrionbrazil.com/" },
  ],
  blogsTitle: "Blogs Recomendados",
  copyright: "Copyright © 2026 JB Mídia, Todos os direitos reservados.",
  legal: [
    { label: "Termos de Serviço", url: "/termos" },
    { label: "Política de Privacidade", url: "/privacidade" },
  ],
  logo: IMG.logo,
  logoAlt: "Atlas Hosting",
  menu: [
    { label: "VPS em nuvem", url: "/vps" },
    { label: "Cloud VDS", url: "/vds" },
    { label: "VPS de armazenamento", url: "/vps-armazenamento" },
    { label: "VPS Windows", url: "/vps-windows" },
    { label: "Nossos Planos", url: "/#planos" },
    { label: "Depoimentos", url: "/#testimonials" },
  ],
  menuTitle: "Menu",
  socials: [
    { label: "Instagram", url: "https://www.instagram.com/hostingatlas/" },
    { label: "YouTube", url: "https://www.youtube.com/@hostingatlas" },
    { label: "X", url: "https://x.com/hostingatlasbr" },
    { label: "Threads", url: "https://www.threads.com/@hostingatlas" },
    { label: "TikTok", url: "https://www.tiktok.com/@hostingatlas" },
    { label: "Kwai", url: "https://kwai.com/@atlashosting" },
    { label: "Facebook", url: "https://www.facebook.com/hostingatlasbr/" },
  ],
  tagline: 'Feito pra quem quer mais do que só\n"estar no ar"',
});

/* ───────── planos ───────── */

interface Plan {
  backup?: string;
  cents: string;
  old: string;
  popular?: boolean;
  price: string;
  specs: string[];
  title: string;
  url: string;
}

const splitPrice = (v: string): [string, string] => {
  const [a = "", b = "00"] = v.split(",");
  return [a, b];
};

const planItems = (plans: Plan[], backupUrl?: (p: Plan) => string) =>
  plans.map(p => ({
    backupPrice: p.backup ?? "",
    backupUrl: backupUrl ? backupUrl(p) : "",
    cents: p.cents,
    oldPrice: p.old,
    popular: p.popular ? "yes" : "no",
    price: p.price,
    specs: p.specs.join("\n"),
    title: p.title,
    url: p.url,
  }));

const mk = (
  title: string,
  now: string,
  old: string,
  specs: string[],
  url: string,
  opts: { backup?: string; popular?: boolean } = {}
): Plan => {
  const [price, cents] = splitPrice(now);
  return { ...opts, cents, old, price, specs, title, url };
};

const VPS_ROWS =
  "Núcleos de vCPU\nRAM (GB)\nArmazenamento\nInstantâneos\nVelocidade da Porta\nTráfego (entrada ilimitada)";
const PERKS = "100% de cashback\nSuporte 24/7 Ativo";
const cfg = (path: string, id: string, extra = "") =>
  `${ATLAS}/${path}/configure/${id}?duration=24${extra}`;
const withBackup = (p: Plan) => p.url.replace("backup=false", "backup=true");

const VPS = [
  [
    "4",
    "Cloud VPS 4",
    "51,57",
    "64,46",
    "70,91",
    "4 vCPU Cores",
    "8 GB RAM",
    "100 GB SSD",
    "1 Snapshot",
    "200 Mbit/s Port",
  ],
  [
    "6",
    "Cloud VPS 6",
    "70,32",
    "87,90",
    "109,58",
    "6 vCPU Cores",
    "12 GB RAM",
    "200 GB SSD",
    "2 Snapshots",
    "300 Mbit/s Port",
  ],
  [
    "8",
    "Cloud VPS 8",
    "131,26",
    "164,08",
    "189,86",
    "8 vCPU Cores",
    "24 GB RAM",
    "300 GB SSD",
    "3 Snapshots",
    "600 Mbit/s Port",
  ],
  [
    "12",
    "Cloud VPS 12",
    "234,40",
    "293,00",
    "312,92",
    "12 vCPU Cores",
    "48 GB RAM",
    "400 GB SSD",
    "3 Snapshots",
    "800 Mbit/s Port",
  ],
  [
    "16",
    "Cloud VPS 16",
    "346,91",
    "433,64",
    "444,77",
    "16 vCPU Cores",
    "64 GB RAM",
    "500 GB SSD",
    "3 Snapshots",
    "1 Gbit/s Port",
  ],
  [
    "18",
    "Cloud VPS 18",
    "459,42",
    "574,28",
    "576,62",
    "18 vCPU Cores",
    "96 GB RAM",
    "600 GB SSD",
    "3 Snapshots",
    "1 Gbit/s Port",
  ],
] as const;
const TRAFFIC = "Unlimited Traffic*";

const vpsPlans = VPS.map(([id, name, now, old, bk, c, r, s, sn, port]) =>
  mk(
    name,
    now,
    old,
    [c, r, s, sn, port, TRAFFIC],
    cfg("vps", id, "&backup=false"),
    {
      backup: bk,
      popular: id === "6",
    }
  )
);

const WIN = [
  ["145,33", "158,22"],
  ["269,56", "287,14"],
  ["459,42", "492,24"],
  ["855,56", "914,16"],
  ["1085,27", "1172,00"],
  ["1361,86", "1476,72"],
] as const;
const winPlans = VPS.map(([id, name, , , , c, r, s, sn, port], i) => {
  const w = WIN[i] as readonly [string, string];
  return mk(
    `${name} Windows`,
    w[0],
    w[1],
    [c, r, s, sn, port, TRAFFIC],
    cfg("vps-windows", id),
    { popular: id === "6" }
  );
});

const VDS = [
  [
    "s",
    "Cloud VDS S",
    "365,66",
    "457,08",
    "6 Virtual Cores AMD EPYC 7282 2.8 GHz",
    "24 GB RAM",
    "180 GB NVMe",
    "250 Mbit/s Port",
  ],
  [
    "m",
    "Cloud VDS M",
    "459,42",
    "574,28",
    "8 Virtual Cores AMD EPYC 7282 2.8 GHz",
    "32 GB RAM",
    "240 GB NVMe",
    "500 Mbit/s Port",
  ],
  [
    "l",
    "Cloud VDS L",
    "646,94",
    "808,68",
    "12 Virtual Cores AMD EPYC 7282 2.8 GHz",
    "48 GB RAM",
    "360 GB NVMe",
    "750 Mbit/s Port",
  ],
  [
    "xl",
    "Cloud VDS XL",
    "881,34",
    "1101,68",
    "16 Virtual Cores AMD EPYC 7282 2.8 GHz",
    "64 GB RAM",
    "480 GB NVMe",
    "1 Gbit/s Port",
  ],
  [
    "xxl",
    "Cloud VDS XXL",
    "1303,26",
    "1629,08",
    "24 Virtual Cores AMD EPYC 7282 2.8 GHz",
    "96 GB RAM",
    "720 GB NVMe",
    "1 Gbit/s Port",
  ],
] as const;
const vdsPlans = VDS.map(([id, name, now, old, c, r, s, port]) =>
  mk(name, now, old, [c, r, s, port, TRAFFIC], cfg("vds", id), {
    popular: id === "m",
  })
);

const STORAGE = [
  [
    "10",
    "Storage VPS 10 (S)",
    "51,57",
    "64,46",
    "2 núcleos de vCPU",
    "4 GB de RAM",
    "300 GB SSD",
    "Porta de 200 Mbit/s",
  ],
  [
    "20",
    "Storage VPS 20 (M)",
    "70,32",
    "87,90",
    "3 núcleos de vCPU",
    "8 GB de RAM",
    "400 GB SSD",
    "Porta de 300 Mbit/s",
  ],
  [
    "30",
    "Storage VPS 30 (L)",
    "131,26",
    "164,08",
    "6 núcleos de vCPU",
    "18 GB de RAM",
    "1 TB SSD",
    "Porta de 600 Mbit/s",
  ],
  [
    "40",
    "Storage VPS 40 (XL)",
    "234,40",
    "293,00",
    "8 núcleos de vCPU",
    "30 GB de RAM",
    "1.2 TB SSD",
    "Porta de 800 Mbit/s",
  ],
  [
    "50",
    "Storage VPS 50 (XXL)",
    "346,91",
    "433,64",
    "14 núcleos de vCPU",
    "50 GB de RAM",
    "1.4 TB SSD",
    "Porta de 1 Gbit/s",
  ],
] as const;
const storagePlans = STORAGE.map(([id, name, now, old, c, r, s, port]) =>
  mk(
    name,
    now,
    old,
    [c, r, s, port, "Tráfego ilimitado*"],
    cfg("vps-armazenamento", id),
    { popular: id === "20" }
  )
);

const plansBlock = (
  rows: string,
  plans: Plan[],
  opts: {
    backup?: boolean;
    footer?: Record<string, string>;
  } = {}
) =>
  block("atPlans", {
    backupLabel: opts.backup
      ? "VPS com backup automático"
      : "Backup automático",
    backupToggle: opts.backup ? "yes" : "no",
    guarantees: PERKS,
    items: planItems(plans, opts.backup ? withBackup : undefined),
    rowLabels: rows,
    showHeading: "no",
    ...(opts.footer ?? {}),
  });

const VDS_LINK = {
  footerLabel: "Escolha um VDS",
  footerText: "Quer ainda mais potência?",
  footerUrl: "/vds",
};
const REGION = {
  regionHighlight: "disponibilidade global",
  regionStart: "9 regiões, 11 localidades,",
  regionText:
    "Dos EUA ao Reino Unido, da Europa à Ásia e Austrália, escolha a localização ideal para baixa latência em todo o mundo.",
};
const NEEDS = {
  text: "Projetamos todos os nossos planos de VPS para oferecer o valor e o desempenho que seus projetos exigem.",
  titleHighlight: "necessidades",
  titleStart: "Construído pensando nas suas",
};
const feedback = {
  icon: "message",
  text: "Você pediu melhor desempenho, maior confiabilidade e suporte ágil. Nós entregamos os três.",
  title: "Desenvolvido com base no seu feedback",
};
const value = {
  icon: "globe",
  text: "Obtenha mais poder de processamento, memória e armazenamento pelo seu dinheiro.",
  title: "Valor incomparável em todos os planos",
};
const RATING = "4,5 de 5 com base em 9.032 avaliações";

/* ───────── páginas ───────── */

const home = [
  block("atHero", {
    background: IMG.pattern,
    buttonLabel: "Ganhar agora",
    buttonUrl: "/#planos",
    note: "Garantia de 30 dias",
    placeholder: "Encontre um domínio",
    poster: "",
    searchAction: `${ATLAS}/domains/search`,
    searchLabel: "Buscar",
    text: "A única hospedagem do Brasil com cashback",
    title: "Receba até R$250,00 de volta!",
    video: IMG.video,
  }),
  block("atStats", {
    eyebrow: "Resultados Reais",
    items: [
      { label: "países alcançados", suffix: "", value: 190 },
      { label: "Clientes ao redor do mundo", suffix: "K+", value: 225 },
      { label: "Anos de Experiência no mercado", suffix: "+", value: 22 },
      { label: "Servidores rodando", suffix: "K+", value: 450 },
    ],
    mapUrl: IMG.map,
    text: "Você trabalha muito, seu negócio merece um lugar que valorize isso!",
    title: "Performance Garantida,\npreço justo, retorno real",
  }),
  block(
    "atPlans",
    {
      backupLabel: "Backup automático",
      backupToggle: "yes",
      footerLabel: "Escolha um VDS",
      footerText: "Quer ainda mais potência?",
      footerUrl: "/vds",
      guarantees: PERKS,
      items: planItems(vpsPlans, withBackup),
      rowLabels: VPS_ROWS,
      showHeading: "yes",
      subtitle:
        "Escolha o plano VPS ideal e escale com performance, estabilidade e suporte 24/7.",
      title: "Potência dedicada para tirar seus projetos do papel.",
    },
    "planos"
  ),
  block(
    "atTestimonials",
    {
      eyebrow: "● DEPOIMENTOS",
      items: [
        {
          image: FACES("julia"),
          name: "Júlia Alba",
          role: "Empreendedora Digital",
          text: "Sempre achei difícil entender termos técnicos, mas o suporte do Atlas é diferente. Gente real, explicação simples. Me senti segura desde o primeiro contato.",
        },
        {
          image: FACES("fernando"),
          name: "Fernando Collins",
          role: "Criador de Conteúdo",
          text: "O cashback mensal foi um diferencial que eu nunca vi em outras hospedagens. Já recuperei parte do valor e continuo com performance altíssima no meu site.",
        },
        {
          image: FACES("fabricio"),
          name: "Fabricio dos Santos",
          role: "Gestor de Projetos Web",
          text: "Estou há 2 anos com o Atlas. Nunca precisei abrir chamado por instabilidade. Me surpreendeu.",
        },
      ],
      title: "Feedback & Avaliações",
    },
    "testimonials"
  ),
];

const productPage = (
  slug: string,
  title: string,
  hero: Record<string, unknown>,
  plans: Block,
  benefits: Record<string, unknown>
) => ({
  blocks: [
    block("atPageHero", { ...hero, rating: RATING }),
    plans,
    block("atBenefits", { ...REGION, mapUrl: IMG.map, ...benefits }),
  ],
  id: `page-${slug}`,
  slug,
  status: "published" as const,
  title,
});

const legalPage = (
  slug: string,
  title: string,
  description: string,
  sections: { body: string; title: string }[]
) => ({
  blocks: [block("atLegal", { description, sections, title })],
  id: `page-${slug}`,
  slug,
  status: "published" as const,
  title,
});

const TERMS = [
  {
    body: "Ao criar uma conta, contratar ou utilizar os serviços da Atlas Hosting, você declara que leu e concorda com estes termos e com nossa Política de Privacidade.\n\nCaso você utilize os serviços em nome de uma empresa ou organização, declara possuir autorização para aceitar estes termos em nome dela.",
    title: "1. Aceitação dos termos",
  },
  {
    body: "A Atlas Hosting oferece serviços de hospedagem, servidores virtuais, domínios e recursos relacionados, conforme o plano contratado. Recursos, limites, preços e condições específicas são apresentados antes da contratação.\n\nPodemos realizar manutenções, atualizações e intervenções necessárias para segurança, estabilidade e melhoria da plataforma. Sempre que possível, avisaremos previamente sobre impactos relevantes.",
    title: "2. Serviços e disponibilidade",
  },
  {
    body: "Você é responsável pela veracidade dos dados cadastrados, pela proteção das credenciais de acesso e pelas atividades realizadas em sua conta. Informe-nos imediatamente caso identifique uso não autorizado.\n\nTambém é sua responsabilidade manter cópias de segurança adequadas do conteúdo hospedado, salvo quando um serviço de backup estiver expressamente incluído no plano contratado.",
    title: "3. Conta e responsabilidades",
  },
  {
    body: "Não é permitido utilizar os serviços para atividades ilícitas, invasão de sistemas, distribuição de malware, envio de spam, violação de direitos de terceiros ou qualquer ação que comprometa a segurança e a estabilidade da infraestrutura.\n\nPodemos suspender ou limitar o acesso quando houver indícios razoáveis de uso indevido, risco à infraestrutura ou descumprimento destes termos, preservados os direitos previstos em lei.",
    title: "4. Uso aceitável",
  },
  {
    body: "Valores, ciclos de cobrança, formas de pagamento, renovação e condições de cancelamento seguem as informações exibidas no momento da contratação e no painel da sua conta.\n\nA falta de pagamento poderá resultar na suspensão ou encerramento do serviço, conforme as condições do plano e a legislação aplicável. O cancelamento não elimina valores já vencidos ou obrigações pendentes.",
    title: "5. Cobrança, renovação e cancelamento",
  },
  {
    body: "Estes termos podem ser atualizados para refletir mudanças nos serviços, requisitos legais ou práticas operacionais. A versão vigente ficará disponível nesta página, com a data da última atualização.\n\nDúvidas sobre estes termos devem ser encaminhadas pelo canal de suporte disponível em sua conta Atlas Hosting.",
    title: "6. Alterações e contato",
  },
];

const PRIVACY = [
  {
    body: "A Atlas Hosting respeita a privacidade de clientes, visitantes e parceiros. Esta política explica como tratamos dados pessoais ao utilizar nosso site, plataforma e serviços de hospedagem.\n\nO tratamento de dados segue a legislação aplicável, incluindo a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).",
    title: "1. Compromisso com sua privacidade",
  },
  {
    body: "Podemos tratar dados fornecidos por você ou gerados durante o uso dos serviços, como:\n\n- nome, e-mail, telefone, CPF ou CNPJ e dados de endereço;\n- informações de conta, autenticação e preferências de atendimento;\n- dados necessários para cobrança, pagamento e emissão de documentos fiscais;\n- registros técnicos, como endereço IP, logs de acesso, navegador e uso da plataforma.",
    title: "2. Dados que podemos coletar",
  },
  {
    body: "Utilizamos dados pessoais para fornecer, administrar e aprimorar os serviços contratados, inclusive para:\n\n- criar e manter sua conta, processar pedidos e prestar suporte;\n- prevenir fraudes, abusos, incidentes de segurança e descumprimentos contratuais;\n- cumprir obrigações legais, regulatórias, fiscais e contábeis;\n- enviar comunicações operacionais sobre conta, serviços, pagamentos e segurança.",
    title: "3. Como usamos seus dados",
  },
  {
    body: "Compartilhamos dados apenas quando necessário para a operação dos serviços, com fornecedores de infraestrutura, meios de pagamento, registro de domínios, atendimento e autoridades competentes, quando a lei exigir.\n\nMantemos dados pelo período necessário para as finalidades descritas nesta política, cumprimento de obrigações legais ou defesa de direitos. Adotamos medidas técnicas e organizacionais razoáveis para reduzir riscos de acesso não autorizado, perda ou alteração.",
    title: "4. Compartilhamento e armazenamento",
  },
  {
    body: "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade, eliminação de dados tratados com consentimento e informações sobre compartilhamento, nos limites previstos pela LGPD.\n\nPara exercer seus direitos ou esclarecer dúvidas sobre esta política, entre em contato pelo canal de suporte disponível em sua conta Atlas Hosting.",
    title: "5. Seus direitos",
  },
  {
    body: "Podemos atualizar esta política para refletir mudanças nos serviços ou na legislação. A versão vigente estará sempre disponível nesta página, com a data da última atualização.",
    title: "6. Alterações nesta política",
  },
];

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [footer],
  header: [header],
  menu: [],
  name: "Atlas Hosting",
  pages: [
    {
      blocks: home,
      id: "page-home",
      slug: "",
      status: "published",
      title: "Atlas Hosting - Hospedagem Profissional de Sites",
    },
    productPage(
      "vps",
      "VPS em nuvem",
      {
        badge: "VPS em nuvem",
        bullets:
          "Melhor relação custo-benefício\nTráfego ilimitado até 1 Gbit/s\nProteção DDoS sempre ativa",
        titleEnd: "do mundo.",
        titleHighlight: "custo-benefício",
        titleStart: "O melhor VPS em nuvem em termos de",
      },
      plansBlock(VPS_ROWS, vpsPlans, { backup: true, footer: VDS_LINK }),
      {
        ...NEEDS,
        items: [
          {
            icon: "wallet",
            text: "Comece com um preço justo e escale quando estiver pronto, sem taxas ocultas.",
            title: "A partir de R$ 51,57 por mês",
          },
          {
            icon: "rocket",
            text: "Definimos o melhor custo-benefício para quem precisa de mais performance gastando menos.",
            title: "VPS 20: o melhor VPS por R$ 70,32/mês",
          },
          feedback,
          value,
        ],
      }
    ),
    productPage(
      "vds",
      "Cloud VDS",
      {
        badge: "Cloud VDS por menos",
        bullets:
          "Hardware dedicado AMD EPYC™\nArmazenamento NVMe ultrarrápido\nTráfego ilimitado com alta largura de banda",
        titleEnd: "",
        titleHighlight: "com preço de Cloud",
        titleStart: "O poder do servidor dedicado",
      },
      plansBlock(
        "Núcleos\nRAM\nArmazenamento\nVelocidade da Porta\nTráfego",
        vdsPlans,
        {
          footer: {
            footerLabel: "",
            footerText: "Hardware dedicado AMD EPYC™ de última geração.",
            footerUrl: "",
          },
        }
      ),
      {
        items: [
          {
            icon: "chip",
            text: "Performance superior com processadores de classe enterprise.",
            title: "AMD EPYC™",
          },
          {
            icon: "shield",
            text: "Recursos 100% dedicados para sua aplicação.",
            title: "Isolamento",
          },
          {
            icon: "zap",
            text: "Conectividade premium em escala global.",
            title: "Baixa Latência",
          },
          {
            icon: "server",
            text: "Painel completo para controle total do seu VDS.",
            title: "Gerenciamento",
          },
        ],
        text: "O VDS combina o isolamento de um servidor dedicado com a flexibilidade da nuvem.",
        titleHighlight: "projetos críticos",
        titleStart: "Potência bruta para",
      }
    ),
    productPage(
      "vps-armazenamento",
      "VPS de armazenamento",
      {
        badge: "VPS de Armazenamento",
        bullets:
          "Muito espaço de armazenamento SSD\nTráfego ilimitado até 1 Gbit/s\nProteção DDoS sempre ativa",
        titleEnd: "com 100% de cashback",
        titleHighlight: "armazenamento SSD",
        titleStart: "Melhor VPS com",
      },
      plansBlock(
        "Núcleos de vCPU\nRAM (GB)\nSSD (GB / TB)\nVelocidade da Porta\nTráfego (entrada ilimitada)",
        storagePlans,
        { footer: VDS_LINK }
      ),
      {
        ...NEEDS,
        items: [
          {
            icon: "wallet",
            text: "Comece com um preço justo e escale quando estiver pronto, sem taxas ocultas.",
            title: "Preço Justo",
          },
          {
            icon: "rocket",
            text: "Definimos o melhor custo-benefício para quem precisa de mais performance gastando menos.",
            title: "Escalabilidade",
          },
          { ...feedback, title: "Suporte Ativo" },
          { ...value, title: "Valor Incomparável" },
        ],
      }
    ),
    productPage(
      "vps-windows",
      "VPS Windows",
      {
        badge: "VPS Windows",
        bullets:
          "Ambiente Windows nativo e otimizado\nTráfego ilimitado até 1 Gbit/s\nProteção DDoS sempre ativa",
        titleEnd: "acessível e rápido",
        titleHighlight: "Windows",
        titleStart: "Servidor VPS",
      },
      plansBlock(VPS_ROWS, winPlans, { footer: VDS_LINK }),
      {
        ...NEEDS,
        items: [
          {
            icon: "chip",
            text: "Infraestrutura otimizada para workloads Windows.",
            title: "Performance",
          },
          {
            icon: "zap",
            text: "Provisionamento instantâneo do seu servidor.",
            title: "Rapidez",
          },
          {
            icon: "headset",
            text: "Time especializado em Windows Server 24/7.",
            title: "Suporte",
          },
          {
            icon: "globe",
            text: "Disponível em todas as nossas regiões.",
            title: "Global",
          },
        ],
      }
    ),
    legalPage(
      "termos",
      "Termos de Serviço",
      "Estas condições definem as regras para usar a plataforma e contratar os serviços da Atlas Hosting.",
      TERMS
    ),
    legalPage(
      "privacidade",
      "Política de Privacidade",
      "Saiba quais dados tratamos, por que precisamos deles e como você pode exercer seus direitos.",
      PRIVACY
    ),
    {
      blocks: [
        block("atNotFound", {
          buttonLabel: "Voltar para o início",
          buttonUrl: "/",
          text: "O endereço acessado não existe ou foi removido.",
          title: "Página não encontrada",
        }),
      ],
      id: "page-404",
      slug: "404",
      status: "published",
      title: "Página não encontrada",
    },
  ],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#00A3FF",
    bg: "#00050A",
    card: "#FFFFFF",
    dark: "#00050A",
    favicon: IMG.logo,
    fg: "#FFFFFF",
    fontAccent: "'Roboto', sans-serif",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Roboto', sans-serif",
    muted: "#94A3B8",
    panel: "#00111A",
    soft: "#94A3B8",
    variant: "atlas",
  },
};

export const atlasHosting: SiteTemplate = {
  description:
    "Site institucional de hospedagem em tema escuro com azul-céu: topo com busca de domínio e vídeo, números com contador e mapa animado, planos com chave de backup, depoimentos e páginas de VPS em nuvem, Cloud VDS, armazenamento, VPS Windows, termos e privacidade. Cópia do Atlas Hosting.",
  id: "atlas-hosting",
  name: "Atlas Hosting — Hospedagem de Servidores",
  preview: IMG.pattern,
  site,
  tags: ["Hospedagem", "Negócios", "Landing"],
};
