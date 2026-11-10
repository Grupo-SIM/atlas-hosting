import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "SEOPACK": migração de seopack.simintermediacoes.com (WordPress + Elementor), que tem uma rota só.
 * Textos, planos, links de cadastro e imagens vêm do original (as imagens apontam para o WordPress dele, como
 * no template areaflix). O script Moonify do original (minerador no navegador) **não** foi copiado.
 */

const ORIGIN = "https://seopack.simintermediacoes.com/wp-content/uploads";
const REGISTER = "https://seopack.org/v2/login/register?r=kOYVgkoc";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "anchor" | "fx">
): Block => ({ id: `sp-${seq++}`, props, type, ...extra });

/** Todas as entradas do original são `fadeIn`; o atraso escalona os itens de cada seção. */
const fade = (delay = 0): Record<string, Fx> => ({
  "": { delay, enter: "fadeIn" },
});

const tool = (n: string, name: string, text: string) => ({
  image: `${ORIGIN}/2026/08/${n}.png`,
  name,
  text,
});

const features =
  "Todas ferramentas descritas;\nSuporte via e-mail e chat;\n+ Bônus.";

const testimonial = (
  file: string,
  name: string,
  role: string,
  quote: string
) => ({ image: `${ORIGIN}/2025/04/${file}.jpg`, name, quote, role });

const faq = (question: string, answer: string) => ({ answer, question });

const home: Page = {
  blocks: [
    block(
      "spHero",
      {
        image: `${ORIGIN}/2025/04/person-with-futuristic-metaverse-avatar-mask_23-2149699831-e1745292726106-1024x589.avif`,
        pill: "Ganhe tempo e dinheiro",
        text: "Desbloqueie agora o acesso às ferramentas essenciais usadas por agências, especialistas e grandes nomes do mercado digital.",
        titleStart: "As Melhores Ferramentas em um só",
        titleWord: "Lugar.",
      },
      { fx: fade() }
    ),
    block(
      "spAbout",
      {
        buttonLabel: "Acessar",
        buttonUrl: "#planos",
        cards: [
          {
            caption: "Economizados",
            prefix: "$",
            suffix: "",
            title: "Economia Real",
            value: "3000",
          },
          {
            caption: "Todas Liberadas",
            prefix: "+",
            suffix: "",
            title: "Ferramentas Disponíveis",
            value: "35",
          },
        ],
        image: `${ORIGIN}/2025/04/digital-business-and-technology-2023-11-27-05-34-13-utc.jpg`,
        pill: "Sobre o SEOPACK",
        text: "**O acesso que você __precisa__!**\nSEOPACK é o pacote mais poderoso de ferramentas digitais do mercado…\nCom nosso sistema **você economiza até 95%** em plataformas de SEO, Copywriting, Anúncios, Automação, Design, Inteligência Artificial e muito mais.",
        title: "Mais Alcance. Mais Vendas. Menos Gastos.",
      },
      { anchor: "sobre", fx: fade(300) }
    ),
    block(
      "spTools",
      {
        groupTitle: "SEO & Análise de Concorrência",
        items: [
          tool(
            "01",
            "Sem Rush",
            "Desempenho orgânico e pago, análise de concorrência e rastreamento de posição."
          ),
          tool(
            "02",
            "SimilarWeb",
            "Estimativa de tráfego e benchmarking de concorrentes."
          ),
          tool(
            "03",
            "Keyword Tool",
            "Sugestões de palavras-chave baseadas em buscas reais."
          ),
          tool(
            "04",
            "Majestic",
            "Base de dados de backlinks e link intelligence."
          ),
          tool(
            "05",
            "KWFinder",
            "Palavras-chave de cauda longa com baixa dificuldade."
          ),
          tool(
            "06",
            "CognitiveSEO",
            "Auditoria on-page e monitoramento de concorrência."
          ),
          tool(
            "02",
            "SimilarWeb",
            "Estimativa de tráfego e benchmarking de concorrentes."
          ),
          tool(
            "03",
            "Keyword Tool",
            "Sugestões de palavras-chave baseadas em buscas reais."
          ),
          tool(
            "04",
            "Majestic",
            "Base de dados de backlinks e link intelligence."
          ),
          tool(
            "05",
            "KWFinder",
            "Palavras-chave de cauda longa com baixa dificuldade."
          ),
        ],
        title: "Ferramentas Disponíveis:",
      },
      { anchor: "ferramentas", fx: fade() }
    ),
    block(
      "spTrust",
      {
        items: [
          {
            text: "Suporte diferenciado via e-mail e Chat Online.",
            title: "Suporte 24x7",
          },
          {
            text: "Se você não gostar do nosso serviço, devolvemos o seu dinheiro.",
            title: "7 dias de Garantia",
          },
          {
            text: "Monitoramos os acessos de nossos clientes, para que todos possam usar tranquilamente.",
            title: "Monitoramento 24h",
          },
        ],
        pill: "O Mais Confiável Grupo de Ferramentas do Brasil",
        title: "Faça o que os Grandes fazem!",
      },
      { fx: fade(300) }
    ),
    block(
      "spBenefit",
      {
        cards: [
          {
            buttonLabel: "Acessar",
            buttonUrl: "#planos",
            stats: [
              {
                caption: "Mais Resultados potencializados",
                prefix: "",
                suffix: "x",
                value: "10",
              },
              {
                caption: "De Economia e velocidade",
                prefix: "",
                suffix: "%",
                value: "97",
              },
            ],
            tags: "Pesquisa e Coleta\nVisão 360 de todos os seus dados relacionados ao marketing digital",
            text: "Ferramentas de marketing online que fornecem dados de natureza diversa sobre a concorrência.",
            title: "Análise Automatizada de Dados",
          },
          {
            buttonLabel: "Acessar",
            buttonUrl: "#planos",
            stats: [
              {
                caption: "Qualidade",
                prefix: "",
                suffix: "%",
                value: "100",
              },
              {
                caption: "Complicações",
                prefix: "",
                suffix: "",
                value: "0",
              },
            ],
            tags: "Otimização de Texto e Escrita\nInteligência de Mercado e Tendências",
            text: "Ferramentas de criação de conteúdo com IA, análise de concorrência e SEO, edição de vídeo e design, automações e muito mais…",
            title: "Alta Versatilidade de Ferramentas",
          },
        ],
        pill: "Custo x Benefício",
        text: "Somos um grupo de compartilhamento de ferramentas de SEO. Fornecemos acesso a diversas ferramentas em planos premium’s por um baixo custo mensal. Ferramentas que custariam milhares de dólares aqui você encontra por um pequeno preço.\nUse nossas ferramentas para alavancar seus negócios na internet. Oferecemos o melhor serviço de acesso compartilhado do Brasil.\nReunimos um grande grupo de usuários para conseguir contratar as melhores ferramentas de SEO disponíveis no mercado através do uso colaborativo.",
        title: "Por que somos os melhores no mercado?",
      },
      { fx: fade() }
    ),
    block(
      "spPlans",
      {
        pill: "Nossos Planos",
        plans: [
          {
            buttonLabel: "Assinar",
            buttonUrl: REGISTER,
            currency: "R$",
            days: "31 dias de acesso",
            description: "Ideal para ver a eficiência do nosso sistema.",
            featured: "no",
            features,
            label: "1 MÊS",
            name: "Pacote Padrão",
            period: "/ 1 mês",
            price: "40,00",
          },
          {
            buttonLabel: "Assinar",
            buttonUrl: REGISTER,
            currency: "R$",
            days: "186 dias de acesso",
            description: "O mais vendido! Favorito de nossos clientes.",
            featured: "yes",
            features,
            label: "6 MESES",
            name: "Pacote Premium",
            period: "/ 6 meses",
            price: "168,00",
          },
          {
            buttonLabel: "Assinar",
            buttonUrl: REGISTER,
            currency: "R$",
            days: "93 dias de acesso",
            description: "Feito para quem já deu os primeiros passos.",
            featured: "no",
            features,
            label: "3 MESES",
            name: "Pacote Plus",
            period: "/ 3 meses",
            price: "102,00",
          },
        ],
        text: "Tenha acesso imediato às ferramentas mais desejadas do mercado de SEO. Por um preço que cabe no seu bolso — sem limites, sem burocracia.\nValor promocional, por tempo limitado.",
        title: "Ferramentas Premium. Preços Acessíveis.",
      },
      { anchor: "planos", fx: fade() }
    ),
    block(
      "spTestimonials",
      {
        items: [
          testimonial(
            "Emily-Lopes",
            "Emily Lopes",
            "Designer Gráfico",
            "Sou designer e uso Canva Pro e Freepik todos os dias. Assinar tudo individualmente ficava muito caro. O SEOPACK trouxe tudo que preciso num só lugar. Recomendo pra qualquer profissional criativo."
          ),
          testimonial(
            "Joao-Vitor-Ribeiro",
            "João Vitor Ribeiro",
            "Gestor de Tráfego",
            "Quando conheci o SEOPACK, fiquei desconfiado, mas resolvi testar. E foi a melhor decisão que tomei no meu negócio. Ferramentas como Majestic e KWFinder me deram uma vantagem enorme na análise dos meus concorrentes."
          ),
          testimonial(
            "Marina-Albuquerque",
            "Marina Albuquerque",
            "Criadora de Conteúdo e Empreendedora Digital",
            "Comecei meu blog do zero e precisava de ferramentas que me ajudassem a crescer sem gastar uma fortuna. O SEOPACK foi exatamente o que eu precisava. Já estou ranqueando na primeira página com a ajuda deles!"
          ),
          testimonial(
            "Marcelo-Menezes",
            "Marcelo Menezes",
            "Empreendedor Digital",
            "Com o pacote da SEOPACK, automatizei meu fluxo de conteúdo, melhorei meu SEO e comecei a entregar resultados reais pros meus clientes — sem precisar contratar ferramentas caríssimas."
          ),
          testimonial(
            "Fernanda-Costa",
            "Fernanda Costa",
            "Redatora e Social Media",
            "Eu uso o Canva, Grammarly e o KeywordTool todos os dias no meu trabalho com conteúdo digital. Ter tudo isso num só lugar economizou meu tempo e principalmente meu dinheiro!"
          ),
          testimonial(
            "Artur-Figueiredo",
            "Artur Figueiredo",
            "Consultor de SEO e Freelancer",
            "O SEOPACK me ajudou a ter acesso a ferramentas que antes eram completamente fora do meu orçamento. Hoje consigo fazer auditorias completas de SEO para meus clientes com SEMrush, Moz e outras, pagando quase nada."
          ),
        ],
        pill: "Depoimentos",
        seconds: 6,
        text: "Empreendedores, freelancers e agências já estão acelerando seus resultados com a SEOPACK. Aqui você vê, com suas próprias palavras, o impacto que ter acesso às ferramentas certas pode gerar.\nNada melhor do que ouvir de quem já testou — e aprovou.",
        title: "O que dizem nossos clientes",
      },
      { fx: fade() }
    ),
    block(
      "spFaq",
      {
        items: [
          faq(
            "Como terei acesso as ferramentas?",
            "Após contratar um plano você terá acesso ao painel de membros. No painel tem uma tela com todas ferramentas, em cada ferramenta há um tutorial de uso. Algumas ferramentas são acesso via oneclick (basta clicar no link e pronto), outras você irá receber login e senha para acesso direto ou via cookie."
          ),
          faq(
            "O que é importante eu saber antes da compra?",
            "O acesso é compartilhado entre os usuários compradores, isso nos permite vender as ferramentas a baixo custo (se você fosse comprar diretamente todas essas gastaria milhares de reais). As vezes pode acontecer de algumas ferramentas ficarem inoperantes por alguns dias, quando isso ocorre procuramos restabelecer o mais rápido possível, isso foi explícito no anúncio, pedimos que tenha paciência quando isso ocorrer. Mas também quando ocorre poderá recorrer a outra ferramenta, como o pacote possui diversas algumas terão as mesmas funcionalidades que outras. Você não pode vender, alugar ou compartilhar nossas contas, ferramentas, navegador ou serviços para terceiros, monitoramos nossas ferramentas de forma muito estrita se acharmos qualquer culpado, proibiremos sua conta permanentemente com efeito imediato. Nosso acesso compartilhado é destinado a pequenas empresas e/ou profissionais que usam pouco as ferramentas (baixo uso), se identificarmos uso excessivo das ferramentas poderemos bloquear a conta a qualquer momento. Após o prazo anunciado você perderá o suporte e atualizações a ferramentas e irá precisar fazer uma nova compra. Caso deseje acesso dedicado as ferramentas indicamos o contrato direto com elas, a finalidade desse anúncio é vender o uso coletivo e compartilhado, onde o baixo custo é a maior vantagem, porém tem sim seus contras que pode ser o não funcionamento temporário de algumas ferramentas. Você poderá sempre contar com nosso suporte para tirar qualquer dúvida."
          ),
          faq(
            "Como solicitar suporte se algo não funcionar?",
            "Se o suporte for por problemas no funcionamento de alguma ferramenta basta clicar no botão “solicitar atualização” localizado abaixo de cada tela de ferramenta. Se o suporte for relacionado a sua conta ou assuntos complexos deverá entrar em contato através do e-mail contato@seopack.org ou via chat."
          ),
          faq(
            "Há limite de uso?",
            "Nas páginas de acesso mencionamos uma quantidade de consultas máximas que poderá realizar no dia. Nosso acesso compartilhado é destinado a pequenas empresas e/ou profissionais que usam pouco as ferramentas (baixo uso), se identificarmos uso excessivo das ferramentas poderemos bloquear a conta a qualquer momento. Para saber o limite de outras ferramentas, porfavor entrar em contato."
          ),
          faq(
            "Posso compartilhar minha conta?",
            "Você não pode vender, alugar ou compartilhar nossas contas, ferramentas, navegador ou serviços para terceiros, monitoramos nossas ferramentas de forma muito estrita se acharmos qualquer culpado, proibiremos sua conta permanentemente com efeito imediato."
          ),
          faq(
            "Vocês fornecem algum tutorial de uso?",
            "Sim, nós fornecemos a você um tutorial em vídeo e um guia completo de uso."
          ),
          faq(
            "Tenho outra dúvida, como solucionar?",
            "Não hesite em nos contatar em caso de qualquer outra dúvida. Envie nos um e-mail para: contato@seopack.org ou via chat."
          ),
        ],
        pill: "Nossas Respostas",
        text: "Ainda está com dúvidas? Leia abaixo algumas das perguntas mais frequentes.",
        title: "Perguntas Frequentes",
      },
      { anchor: "faq", fx: fade() }
    ),
  ],
  id: "page-home",
  slug: "",
  status: "published",
  title: "Página Principal",
};

const site: Site = {
  categories: [],
  categoryLayout: [],
  footer: [
    block("spFooter", { text: "Todos os direitos reservados a JB Mídia." }),
  ],
  header: [
    block("spHeader", {
      buttonLabel: "Cadastrar",
      buttonUrl: REGISTER,
      items: [
        { label: "Sobre", url: "#sobre" },
        { label: "Ferramentas", url: "#ferramentas" },
        { label: "Planos", url: "#planos" },
        { label: "FAQ", url: "#faq" },
      ],
      logo: `${ORIGIN}/2025/04/lOGO-3seopack-1024x276-1.webp`,
      logoUrl: "/",
    }),
  ],
  menu: [],
  name: "SEOPACK",
  pages: [home],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#8932f8",
    bg: "#090014",
    card: "#120424",
    dark: "#080111",
    deep: "#311557",
    edge: "#2f006b",
    fg: "#ffffff",
    fontBody: "'Roboto', sans-serif",
    fontHeading: "'Raleway', sans-serif",
    grid: `${ORIGIN}/2025/04/Grid-09-2.png`,
    line: "#231a2d",
    muted: "#b0b0b0",
    panel: "#120424",
    soft: "#e9d8fe",
    surface: "#120424",
    variant: "seopack",
  },
};

export const seopack: SiteTemplate = {
  description:
    "Landing escura em roxo de pacote de ferramentas: hero com texto digitado, números animados, grade de ferramentas, planos, depoimentos em carrossel e perguntas frequentes. Migrado do SEOPACK.",
  id: "seopack",
  name: "SEOPACK — Pacote de Ferramentas",
  preview: `${ORIGIN}/2025/04/person-with-futuristic-metaverse-avatar-mask_23-2149699831-e1745292726106-1024x589.avif`,
  site,
  tags: ["Landing", "SEO"],
};
