import type { Block, Fx, Page, Site, SiteTemplate } from "../../model/index.js";

/**
 * Template "ÁreaFlix": migração de areaflix.simintermediacoes.com (WordPress + Elementor), que tem uma rota só.
 * Textos, planos, links de checkout e imagens vêm do original (as imagens apontam para o WordPress dele, como
 * no template spyhacker); painel admin, área do aluno e checkout são sistemas externos e entram como links.
 */

const ORIGIN = "https://areaflix.simintermediacoes.com/wp-content/uploads";
const CHECKOUT =
  "https://checkout.simintermediacoes.com/?subscriptionLinkCode=";

let seq = 0;
const block = (
  type: string,
  props: Record<string, unknown>,
  extra?: Pick<Block, "anchor" | "fx">
): Block => ({ id: `af-${seq++}`, props, type, ...extra });

const rise: Fx = { enter: "fadeInUp" };

const cta = (image: string, title: string, text: string) => ({
  buttonLabel: "Assinar",
  buttonUrl: "#d2",
  image: `${ORIGIN}/2025/06/${image}.webp`,
  text,
  title,
});

const box = (image: string, title: string, text: string) => ({
  image: `${ORIGIN}/elementor/thumbs/${image}.webp`,
  text,
  title,
});

const plan = (
  name: string,
  values: string[],
  price: string,
  cost: string,
  code: string
) => ({
  buttonLabel: "Assinar plano",
  buttonUrl: CHECKOUT + code,
  details: `Mensal\nCusto por aluno:\n${cost}`,
  name,
  price,
  values: [...values, "Em Breve", "Em Breve", "Em Breve"].join("\n"),
});

const testimonial = (
  image: number,
  name: string,
  role: string,
  quote: string
) => ({ image: `${ORIGIN}/2025/04/${image}.png`, name, quote, role });

const home: Page = {
  blocks: [
    block(
      "afHero",
      {
        background: `${ORIGIN}/2025/06/Group-199-final.webp`,
        button1Label: "Fazer minha assinatura",
        button1Url: "#d2",
        button2Label: "Ver plataforma por dentro",
        button2Url: "#d1",
        text: "Faça seus clientes sentirem que estão dentro de uma experiência tão boa quanto maratonar a série favorita.",
        title: "Sua Própria “Netflix” de Cursos e Mentorias",
      },
      { fx: { "1.1": rise } }
    ),
    block("afIntro", {
      text: "Com nossa plataforma, você entrega seu material com qualidade máxima, autonomia completa e a melhor experiência para seus alunos.",
      title: "Aumente sua Autoridade e Fortaleça seu Branding",
    }),
    block("afCtaCards", {
      items: [
        cta(
          "ESTABILIDADE-E-ALTA-PERFOMANCE",
          "Organização Inteligente",
          "Tenha seus cursos, mentorias e eBooks organizados em um ambiente seguro, intuitivo e preparado para atender seus alunos com excelência."
        ),
        cta(
          "estilo-netflix-1",
          "Experiência do Aluno Estilo Netflix",
          "Uma jornada envolvente, fluida e viciante para quem consome seus conteúdos — como quem maratona uma série. Seus alunos vão amar aprender."
        ),
        cta(
          "UPLOAD-RAPIDO",
          "Upload Rápido",
          "Publique vídeos, PDFs e aulas com poucos cliques. Estruture módulos, organize seções e mantenha tudo acessível de forma simples."
        ),
        cta(
          "controle-de-alunos-1-1",
          "Controle Total dos Seus Alunos",
          "Gerencie acessos, progresso, trilhas de aprendizado e planos de forma prática e eficiente. Você no comando de tudo."
        ),
        cta(
          "estabilidade-e-alta-performance",
          "Estabilidade e Alta Performance",
          "Conte com uma plataforma robusta, que carrega rápido, não trava e suporta acessos simultâneos — para você escalar sem medo."
        ),
        cta(
          "suporte-e-crescimento-continuo",
          "Suporte e Crescimento Contínuo",
          "Conte com um time ao seu lado, atualizações constantes e uma estrutura pronta para acompanhar o seu crescimento."
        ),
      ],
    }),
    block(
      "afBoxes",
      {
        items: [
          box(
            "Frame-49-r75yqir1rlrl9f1cbxv4yviotmxn8d1hmra0opk8ao",
            "Experiência perfeita em qualquer tela",
            "Design claro, intuitivo e responsivo para o aluno navegar com fluidez em qualquer dispositivo."
          ),
          box(
            "Frame-50-r75yqkmq59u5wmym0yoe3v1m0eodnr8yb0kzn9hfy8",
            "Mais engajamento, menos suporte",
            "Com poucos cliques o aluno entra, assiste, lê, interaje e avança nos módulos. Ou seja, menos dúvidas é igual a menos trabalho."
          ),
          box(
            "Frame-51-r75yqlkkc3vg88x8vh30oct2lsjqvgcon58h4jg1s0",
            "Percepção de valor muito maior",
            "A experiência impressiona e aumenta o quanto as pessoas acham que vale, o cliente sente que pagou barato."
          ),
        ],
        text: "Seus alunos merecem mais do que uma área de membros comum. Eles vão estudar em um ambiente visualmente atrativo, intuitivo e pensado para gerar foco e um outro nivel de experiência.",
        title: "Uma Experiência que da Vontade de Maratonar",
      },
      { fx: { "1": rise } }
    ),
    block(
      "afVideoSplit",
      {
        background: `${ORIGIN}/2025/05/hand-photo-virtual-application_1134-605.avif`,
        buttonLabel: "Fazer minha assinatura",
        buttonUrl: "#d2",
        text: "Entrega de qualidade, criada para oferecer a melhor experiência aos seus clientes. Sem códigos, simples e fácil.",
        title: "Veja a Plataforma que vai Elevar o Nível dos seus Cursos",
        videoUrl: "https://vimeo.com/1095720867",
      },
      {
        anchor: "d1",
        fx: { "1.1.1": { enter: "fadeInLeft" } },
      }
    ),
    block(
      "afPricing",
      {
        features:
          "Alunos\nCursos\nAulas\nAdministradores\nCertificados\nComunidades\nApp Mobile\nAcesso à API",
        guaranteeText:
          "Se por algum motivo você não estiver satisfeito, tem 7 dias de garantia para testar e comprovar, além de poder cancelar sua assinatura a qualquer momento.",
        guaranteeTitle: "Garantia Incondicional",
        plans: [
          plan(
            "Iniciante",
            ["200", "50", "1.000", "5", "1"],
            "R$ 217,00",
            "R$1,08",
            "f680141f-d3b0-4525-b459-2f21fd168b5c"
          ),
          plan(
            "Intermediário",
            ["1.000", "100", "2.000", "10", "2"],
            "R$ 437,00",
            "R$0,44",
            "211df7a3-d378-4b4e-bcad-433acb900e8f"
          ),
          plan(
            "Especialista",
            ["5.000", "200", "4.000", "20", "10"],
            "R$ 847,00",
            "R$0,17",
            "175388a3-6e12-42ae-8702-064bfc0ac649"
          ),
          plan(
            "Business",
            ["20.000", "400", "8.000", "30", "20"],
            "R$ 1.067,00",
            "R$0,05",
            "7e3d5352-0edc-4425-99d6-d0ecaf8a5be9"
          ),
          plan(
            "Company",
            ["50.000", "800", "15.000", "40", "30"],
            "R$ 2.097,00",
            "R$0,04",
            "d178d76f-d888-4eb2-94ca-470a694b235c"
          ),
          plan(
            "Black",
            ["100.000", "1.500", "30.000", "100", "50"],
            "R$ 3.907,00",
            "R$0,03",
            "41d54478-8b8e-4ad3-8906-bfeb371e85dc"
          ),
        ],
        subtitle: "Uma plataforma feita para quem quer impressionar!",
        title: "A oportunidade de oferecer uma experiência incrível",
      },
      { anchor: "d2", fx: { "1.1": rise, "1.2": rise } }
    ),
    block(
      "afTestimonials",
      {
        items: [
          testimonial(
            1,
            "Carla M.",
            "Desenvolvimento Pessoal",
            "Nunca foi tão fácil organizar e entregar meus cursos. Em poucos dias já tinha alunos acessando tudo com fluidez!"
          ),
          testimonial(
            6,
            "Lucas D.",
            "Especialista em Finanças",
            "Eu usava outras plataformas, mas nada se compara à experiência que meus alunos têm aqui. É realmente outro nível."
          ),
          testimonial(
            3,
            "Juliana R.",
            "Coach de Carreira",
            "Em menos de uma semana já lancei meu curso com tudo rodando. A estrutura é tão intuitiva que parece que foi feita pra mim."
          ),
          testimonial(
            4,
            "André S.",
            "Mentor de Negócios",
            "Minhas mentorias agora têm uma área de verdade. Visual lindo, acesso fácil e suporte sempre presente."
          ),
          testimonial(
            2,
            "Renata L.",
            "Nutrição Funcional",
            "A sensação é de estar oferecendo uma plataforma própria, estilo streaming. Meus alunos elogiam demais!"
          ),
        ],
        seconds: 5,
        text: "Veja o que produtores estão dizendo sobre a experiência de usar a plataforma no dia a dia.",
        title: "Quem já usa, não quer voltar atrás",
      },
      { fx: { "1.1": { enter: "fadeInLeft" } } }
    ),
    block(
      "afFaq",
      {
        items: [
          {
            answer:
              "Sim, nosso sistema permite você usar qualquer gateway ou checkout que achar melhor.",
            question: "Posso integrar com qualquer gateway que desejar?",
          },
          {
            answer:
              "Não. O acesso é feito direto pelo navegador, tanto em celular quanto no computador, com uma experiência fluida e responsiva.",
            question: "Meus alunos precisam baixar algum aplicativo?",
          },
          {
            answer:
              "Estamos a um e-mail de distancia do plano padrão e uma mensagem no WhatsApp de distancia do plano anual.",
            question: "Como funciona o suporte caso eu precise de ajuda?",
          },
          {
            answer:
              "Com certeza. Toda navegação e hospedagem é protegida com os mais altos padrões de segurança e criptografia.",
            question:
              "A plataforma é segura para meus dados e dos meus alunos?",
          },
          {
            answer:
              "Com certeza! Você pode cancelar sua assinatura a qualquer momento, sem burocracia e sem cobranças adicionais.",
            question: "Posso cancelar a qualquer momento?",
          },
        ],
        kicker: "FAQ",
        text: "Tudo o que você precisa saber.",
        title: "Perguntas Frequentes",
      },
      {
        fx: {
          "1.1.1": { enter: "fadeInLeft" },
          "1.1.2": { enter: "fadeInRight" },
        },
      }
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
    block("afFooter", {
      text: "© SIM Intermediações — Todos os direitos reservados.",
    }),
  ],
  header: [
    block("afHeader", {
      button1Label: "Área admin",
      button1Url: "https://areaflix-admin.simintermediacoes.com/",
      button2Label: "Área do Aluno",
      button2Url: "https://areademembros.simintermediacoes.com/login",
      logo: `${ORIGIN}/2025/04/area-flix-branca-logo-topo.webp`,
      logoUrl: "/",
    }),
  ],
  menu: [],
  name: "ÁreaFlix",
  pages: [home],
  postLayout: [],
  posts: [],
  theme: {
    accent: "#eeb500",
    bg: "#141414",
    card: "#1d1d1d",
    fg: "#ffffff",
    // O original pede Inter/Heebo, mas o CSS das fontes dá 404: o visitante vê a fonte padrão.
    fontBody: "Arial, Helvetica, sans-serif",
    fontHeading: "Arial, Helvetica, sans-serif",
    muted: "#b4b4b4",
    orange: "#ff5a19",
    surface: "#1d1d1d",
    variant: "areaflix",
  },
};

export const areaflix: SiteTemplate = {
  description:
    "Landing escura de plataforma de cursos estilo streaming: hero, cartões com hover, caixas com imagem, vídeo, tabela de planos, carrossel de depoimentos e perguntas frequentes. Migrado da ÁreaFlix.",
  id: "areaflix",
  name: "ÁreaFlix — Plataforma de Cursos",
  preview: `${ORIGIN}/2025/06/Group-199-final.webp`,
  site,
  tags: ["Landing", "Cursos"],
};
