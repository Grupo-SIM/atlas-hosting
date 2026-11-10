import type { Block, Category, Post } from "../../model/index.js";
import { PHOTO_IDS, photo } from "./images.js";

/**
 * Notícias de exemplo do template Zyrion: **fictícias**, escritas para o template (as do site original são
 * de terceiros e não podem ser copiadas — `zyrion.test.ts` garante que não voltem). Mesmas categorias do
 * original; 8 notícias por categoria do menu, para encher todas as seções.
 */
export const CATEGORIES: [slug: string, name: string][] = [
  ["mundo", "Mundo"],
  ["brasil", "Brasil"],
  ["tecnologia", "Tecnologia"],
  ["entretenimento", "Entretenimento"],
  ["educacao", "Educação"],
  ["esportes", "Esportes"],
  ["saude", "Saúde"],
  ["outros", "Outros"],
];

export const categories: Category[] = CATEGORIES.map(([slug, name]) => ({
  id: `cat-${slug}`,
  name,
  slug,
}));

/** [título, resumo] por categoria. */
const NEWS: Record<string, [string, string][]> = {
  brasil: [
    [
      "Inflação de alimentos desacelera pelo terceiro mês e alivia o orçamento das famílias",
      "Hortifrúti e carnes puxaram a queda, segundo o levantamento mensal de preços nas capitais.",
    ],
    [
      "Governo anuncia programa de crédito para microempreendedores com juros reduzidos",
      "A linha terá prazo de até 48 meses e dispensa garantias para quem tiver o cadastro regular.",
    ],
    [
      "Rodovia federal ganha duplicação em trecho de 120 quilômetros no Centro-Oeste",
      "A obra reduz o tempo de viagem e deve diminuir o número de acidentes, segundo o órgão responsável.",
    ],
    [
      "Chuvas fortes deixam bairros alagados e Defesa Civil amplia alerta no Sul",
      "Mais de 2 mil famílias foram atendidas em abrigos temporários; novas pancadas são esperadas para o fim de semana.",
    ],
    [
      "Usina solar flutuante começa a operar em reservatório no Nordeste",
      "O projeto aproveita a área do lago para gerar energia sem ocupar terra produtiva.",
    ],
    [
      "Pesquisa mostra que turismo interno cresce e supera nível anterior à pandemia",
      "Destinos de praia e ecoturismo lideram as reservas para as próximas férias.",
    ],
    [
      "Mutirão da Justiça resolve milhares de processos antigos em uma semana",
      "A ação priorizou ações com mais de dez anos de tramitação e acordos entre as partes.",
    ],
    [
      "Exportações do agronegócio batem recorde no trimestre com soja e café em alta",
      "A demanda externa e o câmbio favorável sustentaram o resultado, aponta o balanço do setor.",
    ],
  ],
  educacao: [
    [
      "Escolas públicas ampliam o ensino de programação no ensino fundamental",
      "O conteúdo será integrado à matemática e ao raciocínio lógico, com formação para os professores.",
    ],
    [
      "Programa de intercâmbio abre 500 vagas para estudantes de graduação",
      "As bolsas cobrem passagem, hospedagem e curso de idioma por seis meses.",
    ],
    [
      "Estudo aponta que leitura em voz alta melhora o desempenho de crianças de seis anos",
      "A pesquisa acompanhou turmas durante um ano letivo e mediu avanços em vocabulário e atenção.",
    ],
    [
      "Universidade lança curso gratuito de educação financeira para jovens",
      "As aulas são online e incluem orçamento pessoal, crédito e primeiros investimentos.",
    ],
    [
      "Inclusão: escolas recebem materiais acessíveis em braile e libras",
      "A distribuição começa pelas redes municipais e prevê capacitação para equipes pedagógicas.",
    ],
    [
      "Psicólogos orientam famílias sobre ansiedade na volta às aulas",
      "Rotina de sono, conversa aberta e acompanhamento da escola ajudam a reduzir o estresse.",
    ],
    [
      "Feira de ciências reúne mil projetos criados por alunos do ensino médio",
      "Robótica, meio ambiente e saúde estão entre os temas mais escolhidos pelos estudantes.",
    ],
    [
      "Pais e escolas debatem o uso de celular em sala de aula e testam regras mais claras",
      "Algumas unidades adotaram horários específicos para o uso do aparelho em atividades pedagógicas.",
    ],
  ],
  entretenimento: [
    [
      "Série brasileira de suspense estreia em plataforma de streaming e lidera audiência",
      "A produção, gravada no litoral do Nordeste, mistura mistério policial e drama familiar.",
    ],
    [
      "Festival de música eletrônica anuncia line-up com atrações nacionais e internacionais",
      "Os ingressos do primeiro lote esgotaram em menos de duas horas.",
    ],
    [
      "Cantora lança álbum surpresa e domina as paradas no primeiro dia",
      "O disco traz dez faixas com participações de artistas da nova geração do pop brasileiro.",
    ],
    [
      "Filme nacional de animação é selecionado para mostra internacional na Europa",
      "A história acompanha um menino que descobre uma cidade escondida dentro de uma biblioteca.",
    ],
    [
      "Jogo independente criado por estúdio do Recife conquista prêmio de design",
      "O título aposta em quebra-cabeças e trilha sonora regional, e chega aos consoles no próximo ano.",
    ],
    [
      "Podcast sobre história do futebol ultrapassa um milhão de downloads",
      "O programa mistura entrevistas com ex-jogadores e relatos de torcedores.",
    ],
    [
      "Museu abre exposição interativa sobre cultura digital e memes brasileiros",
      "A mostra convida o público a criar as próprias colagens e ficará em cartaz por três meses.",
    ],
    [
      "Retrospectiva reúne clássicos do cinema nacional em salas de bairro",
      "A programação inclui debates com diretores e sessões gratuitas aos domingos.",
    ],
  ],
  esportes: [
    [
      "Seleção feminina de vôlei vence fora de casa e assume a liderança do torneio",
      "A equipe virou o jogo no quarto set e confirmou a vitória no tie-break.",
    ],
    [
      "Piloto brasileiro marca a melhor volta e larga na primeira fila no circuito urbano",
      "O treino classificatório foi decidido por menos de dois décimos de segundo.",
    ],
    [
      "Clube anuncia reforço no meio-campo e apresenta o novo camisa 10 à torcida",
      "O jogador assinou contrato de três temporadas e já treina com o elenco.",
    ],
    [
      "Tênis: jovem brasileira avança às quartas de final em torneio internacional",
      "Ela derrotou a cabeça de chave número três em dois sets diretos.",
    ],
    [
      "Basquete: equipe paulista leva a final do campeonato nacional ao quinto jogo",
      "A decisão será no sábado, com ginásio lotado e transmissão ao vivo.",
    ],
    [
      "Lutador brasileiro conquista cinturão em evento realizado no Oriente Médio",
      "A vitória veio por finalização no terceiro round, depois de um combate equilibrado.",
    ],
    [
      "Futebol americano ganha liga profissional no país com seis equipes em 2027",
      "As partidas serão disputadas em estádios de capitais, com calendário de dez rodadas.",
    ],
    [
      "Corrida de rua reúne 20 mil participantes e arrecada doações para hospital infantil",
      "O percurso passou pelos principais pontos turísticos da cidade e terminou com festival de música.",
    ],
  ],
  mundo: [
    [
      "Cúpula climática fecha acordo para reduzir o uso de carvão até 2035",
      "Países ricos e emergentes chegaram a um texto comum depois de três dias de negociação, mas o financiamento ainda divide as delegações.",
    ],
    [
      "Porto do Mar do Norte bate recorde de cargas com nova rota entre Ásia e Europa",
      "A rota alternativa encurtou em quatro dias o trajeto dos navios e reduziu o custo do frete.",
    ],
    [
      "Eleição em país nórdico termina com coalizão de centro e maioria apertada",
      "A formação do novo governo deve levar semanas, e o líder da oposição já pediu diálogo com os partidos menores.",
    ],
    [
      "Onda de calor adia maratona e fecha escolas no sul da Europa",
      "Termômetros passaram dos 40 graus em várias cidades, e autoridades recomendam evitar atividades ao ar livre.",
    ],
    [
      "Missão espacial internacional confirma água congelada em cratera da Lua",
      "Amostras analisadas indicam gelo em concentração maior do que a prevista, o que reforça os planos de uma base permanente.",
    ],
    [
      "Moeda de economia asiática se valoriza e atrai investidores estrangeiros",
      "O banco central manteve os juros e sinalizou que o ciclo de alta chegou ao fim.",
    ],
    [
      "Aeroporto europeu testa embarque sem papel com reconhecimento facial opcional",
      "O sistema promete reduzir filas pela metade; defensores da privacidade pedem regras claras para o uso dos dados.",
    ],
    [
      "Festival de inverno no Canadá reúne artistas de 30 países em esculturas de gelo",
      "A edição deste ano homenageia povos originários e deve receber mais de meio milhão de visitantes.",
    ],
  ],
  outros: [
    [
      "Cidade inaugura biblioteca comunitária em antigo galpão ferroviário",
      "O espaço terá oficinas, sala de estudos e acervo doado pela população.",
    ],
    [
      "Moradores criam horta coletiva e transformam terreno abandonado em área verde",
      "A produção é dividida entre as famílias e parte vai para um restaurante popular.",
    ],
  ],
  saude: [
    [
      "Campanha de vacinação contra a gripe é prorrogada e amplia faixa etária",
      "Postos funcionarão em horário estendido até o fim do mês.",
    ],
    [
      "Sono irregular está associado a maior risco de ganho de peso, diz estudo",
      "Pesquisadores acompanharam 4 mil adultos durante cinco anos.",
    ],
    [
      "Nutricionistas explicam como ler rótulos e evitar o excesso de sódio",
      "Pequenas trocas na lista de compras ajudam a controlar a pressão arterial.",
    ],
  ],
  tecnologia: [
    [
      "Nova geração de chips promete reduzir pela metade o consumo de energia em celulares",
      "Fabricantes apresentaram processadores com arquitetura mais eficiente e foco em inteligência artificial no próprio aparelho.",
    ],
    [
      "Falha em aplicativo de banco digital expõe a importância da autenticação em duas etapas",
      "Especialistas recomendam ativar o segundo fator e desconfiar de mensagens com links urgentes.",
    ],
    [
      "Startup brasileira cria plataforma que organiza estoque de pequenos comércios por voz",
      "A ferramenta funciona pelo WhatsApp e já atende mais de 3 mil lojas em todo o país.",
    ],
    [
      "Assistentes de IA chegam aos notebooks de entrada e mudam a rotina de estudantes",
      "Resumos, traduções e correção de textos passam a funcionar sem internet em modelos mais simples.",
    ],
    [
      "Empresa de segurança digital alerta para golpe de falso suporte em redes sociais",
      "Criminosos usam perfis clonados para pedir códigos de verificação; a orientação é nunca compartilhá-los.",
    ],
    [
      "Mercado de criptoativos tem semana calma e investidores aguardam decisão regulatória",
      "O volume de negociações caiu, enquanto bancos ampliam serviços de custódia para clientes.",
    ],
    [
      "Carros elétricos ganham rede de recarga rápida em rodovias do interior paulista",
      "Os pontos instalados a cada 150 quilômetros reduzem a ansiedade de autonomia nas viagens longas.",
    ],
    [
      "Telescópio de nova geração começa a enviar imagens de alta resolução do céu austral",
      "Os primeiros dados incluem galáxias distantes e um raro registro de supernova em formação.",
    ],
  ],
};

const SECTIONS: Record<string, string[]> = {
  default: [
    "A informação foi confirmada por fontes oficiais e deve ser atualizada nas próximas horas, conforme novos dados forem divulgados.",
    "Especialistas ouvidos pela reportagem destacam que o tema deve continuar em debate nos próximos dias, com impacto direto na rotina de quem acompanha o assunto.",
    "Este é um texto de exemplo do template: substitua por suas próprias matérias no editor do site.",
  ],
};

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `zy-post-${seq++}`,
  props,
  type,
});

/** Intercala as categorias (a lista fica misturada, como num portal) e distribui datas decrescentes. */
function build(): Post[] {
  const queues = CATEGORIES.map(([slug]) => ({
    items: [...(NEWS[slug] ?? [])],
    slug,
  }));
  const order: { slug: string; title: string; excerpt: string }[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      const next = q.items.shift();
      if (next) {
        order.push({ excerpt: next[1], slug: q.slug, title: next[0] });
        added = true;
      }
    }
  }
  const start = Date.UTC(2026, 10, 9, 12, 0, 0);
  return order.map((n, i) => {
    const slug = n.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70)
      .replace(/-$/, "");
    return {
      blocks: [
        block("text", { text: n.excerpt }),
        ...(SECTIONS.default ?? []).map(t => block("text", { text: t })),
      ],
      categoryId: `cat-${n.slug}`,
      coverImage: photo(PHOTO_IDS[(i * 7) % PHOTO_IDS.length] as string),
      excerpt: n.excerpt,
      id: `zy-post-${i + 1}`,
      publishedAt: new Date(start - i * 7 * 3600 * 1000).toISOString(),
      slug,
      status: "published" as const,
      title: n.title,
    };
  });
}

export const posts: Post[] = build();
