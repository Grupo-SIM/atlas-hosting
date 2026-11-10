import type { Block } from "../../model/index.js";
import { BRAND } from "./brand.js";
import { IMG } from "./images.js";

/**
 * Páginas de funil (`bare`, sem cabeçalho nem rodapé). Do original reproduzimos só as mecânicas e o visual
 * (vídeo com botão atrasado, história em telas, quiz com barra de análise, captura de e-mail). Os textos são
 * neutros e editáveis aqui ou no editor: um quiz "Descubra seu perfil de vendedor" que leva a um e-book do grupo.
 * Nada do roteiro, das promessas nem das imagens do funil original foi copiado.
 */
let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `mr-f${seq++}`,
  props,
  type,
});

const bg = { background: IMG.funnelBg };

const EBOOK =
  "https://lp.centraldomarketing.com/ebook-habilidades-de-comunicacao/";

/** Botão flutuante, presente em todas as páginas (o funil não tem rodapé para carregá-lo). */
export const floatBlock = (): Block =>
  block("whatsappFloat", {
    color: "#25d366",
    hoverColor: "#1ebe5d",
    label: BRAND.float.label,
    layout: "pill",
    mobileLabel: BRAND.float.mobileLabel,
    url: BRAND.float.url,
  });

const profileQuiz = (extra: Record<string, unknown>): Block =>
  block("mrQuiz", {
    ...bg,
    doneText: "Concluído!",
    finalText:
      "Preparamos um material com os próximos passos para o seu perfil.\n\nClique no botão abaixo para continuar.",
    finalTitle: "Seu perfil está pronto",
    interval: 250,
    introButton: "COMEÇAR",
    introText:
      "Responda 3 perguntas rápidas e descubra qual é o seu perfil de vendedor.",
    introTitle: "Descubra seu perfil de vendedor",
    loadingTitle: "Analisando suas respostas...",
    questions: [
      {
        answers: "Estou começando agora\nJá fiz algumas vendas\nVendo todo mês",
        text: "Qual é a sua experiência com vendas online?",
      },
      {
        answers: "Redes sociais\nWhatsApp\nSite ou loja virtual\nAinda não sei",
        text: "Onde você mais conversa com clientes?",
      },
      {
        answers:
          "Atrair mais clientes\nMelhorar meu discurso\nOrganizar meu funil",
        text: "O que você quer melhorar primeiro?",
      },
    ],
    start: 5,
    step: 3.7,
    ...extra,
  });

/** slug → blocos. Encadeamento: plano → entrar-na-sala → sala → historia → liberacao → solicitacao; quiz → ultimo-passo. */
export const FUNNEL_PAGES: { blocks: Block[]; slug: string; title: string }[] =
  [
    {
      blocks: [
        block("mrVsl", {
          ...bg,
          buttonLabel: "Quero continuar",
          buttonUrl: "/entrar-na-sala/",
          delaySeconds: 90,
          subtitle: "Entenda em menos de 2 minutos como funciona.",
          title: "Veja como funciona o método",
          video: BRAND.funnelVideo,
        }),
        floatBlock(),
      ],
      slug: "plano",
      title: "Plano",
    },
    {
      blocks: [
        profileQuiz({
          ctaLabel: "Continuar",
          ctaUrl: "/sala/",
        }),
        floatBlock(),
      ],
      slug: "entrar-na-sala",
      title: "Entrar na sala",
    },
    {
      blocks: [
        block("mrVsl", {
          ...bg,
          buttonLabel: "Continuar",
          buttonUrl: "/historia/",
          delaySeconds: 30,
          subtitle: "Assista até o final para liberar o próximo passo.",
          title: "Bem-vindo à sala de aulas",
          video: BRAND.funnelVideo,
        }),
        floatBlock(),
      ],
      slug: "sala",
      title: "Sala",
    },
    {
      blocks: [
        block("mrSteps", {
          ...bg,
          screens: [
            {
              buttonLabel: "Continuar...",
              text: "Todo negócio digital começa com uma pessoa, uma ideia e a vontade de vender.\n\nVamos contar uma história curta sobre isso.",
              title: "",
              url: "",
            },
            {
              buttonLabel: "Continuar...",
              text: "No começo, ninguém sabia por onde começar. Faltavam clareza, método e consistência.",
              title: "",
              url: "",
            },
            {
              buttonLabel: "Continuar...",
              text: "Com um passo de cada vez, as primeiras vendas apareceram — e o resto foi aprender e repetir.",
              title: "",
              url: "",
            },
            {
              buttonLabel: "Ir para o próximo passo",
              text: "Agora é a sua vez. Vamos para o próximo passo.",
              title: "",
              url: "/liberacao-de-disponibilidade/",
            },
          ],
        }),
        floatBlock(),
      ],
      slug: "historia",
      title: "História",
    },
    {
      blocks: [
        profileQuiz({
          ctaLabel: "Continuar",
          ctaUrl: "/solicitacao-pre-aprovada/",
          finalTitle: "Tudo certo com as suas respostas",
          introText:
            "Responda mais algumas perguntas para personalizar o material.",
          introTitle: "Última verificação",
          loadingTitle: "Verificando as informações...",
        }),
        floatBlock(),
      ],
      slug: "liberacao-de-disponibilidade",
      title: "Liberação",
    },
    {
      blocks: [
        block("mrCapture", {
          ...bg,
          actionUrl: "",
          buttonLabel: "Quero receber",
          placeholder: "Digite seu melhor e-mail",
          title: "Receba o material no seu e-mail",
        }),
        floatBlock(),
      ],
      slug: "solicitacao-pre-aprovada",
      title: "Solicitação",
    },
    {
      blocks: [profileQuiz({ ctaUrl: "/ultimo-passo/" }), floatBlock()],
      slug: "quiz-desafio-fraternidade",
      title: "Quiz",
    },
    {
      blocks: [
        block("mrSteps", {
          ...bg,
          screens: [
            {
              buttonLabel: "Quero ver o material",
              items:
                "Conteúdo direto ao ponto\nExemplos práticos para aplicar hoje\nAcesso imediato",
              text: "O que você vai encontrar no material:",
              title: "Último passo",
              url: "",
            },
            {
              buttonLabel: "Acessar o e-book",
              items: "",
              text: "Clique no botão abaixo para conhecer o e-book completo.",
              title: "",
              url: EBOOK,
            },
          ],
        }),
        floatBlock(),
      ],
      slug: "ultimo-passo",
      title: "Último passo",
    },
  ];
