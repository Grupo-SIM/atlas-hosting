import type { Block, Category, Post } from "../../model/index.js";
import { PHOTO_IDS, photo } from "./images.js";

/**
 * Notícias de exemplo do template Holofote: **fictícias**, com personagens inventados (as do site que inspirou o
 * layout falam de pessoas reais e não podem ser copiadas — `holofote.test.ts` garante que não voltem). Sem
 * temas sensíveis. 6 notícias por categoria do menu e mais algumas nas subcategorias Novelas e Brasil.
 */
export const CATEGORIES: [slug: string, name: string][] = [
  ["musica", "Música"],
  ["filmes", "Filmes"],
  ["tv", "TV"],
  ["famosos", "Famosos"],
  ["premiacoes", "Premiações"],
  ["buzz", "Buzz"],
  ["entrevistas", "Entrevistas"],
  ["novelas", "Novelas"],
  ["brasil", "Brasil"],
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
      "Festival de música regional movimenta cidade do interior e lota hotéis",
      "A programação reúne quase 60 atrações e deve atrair 100 mil visitantes em três dias.",
    ],
    [
      "Feira de cultura popular reúne artesãos de 12 estados em exposição gratuita",
      "Há oficinas de cerâmica, bordado e instrumentos feitos à mão.",
    ],
  ],
  buzz: [
    [
      "Vídeo de cachorro que 'toca piano' viraliza e já passa de 20 milhões de views",
      "O tutor diz que o bichinho só aprendeu a apertar as teclas mais graves.",
    ],
    [
      "Desafio de dança criado por estudante invade as redes e ganha versão de celebridades",
      "A coreografia tem apenas 15 segundos e foi gravada na quadra da escola.",
    ],
    [
      "Fã faz bolo idêntico ao cenário de série de TV e conquista elogios da produção",
      "O doce levou três dias para ficar pronto e tem mais de 40 detalhes em açúcar.",
    ],
    [
      "Meme do 'café frio' vira campanha de cafeteria e esgota estoque de canecas",
      "A marca usou a frase mais compartilhada da semana em uma edição limitada.",
    ],
    [
      "Casal viraliza ao fazer pedido de casamento durante show de rua",
      "A cantora interrompeu a apresentação e chamou o noivo ao palco com o anel.",
    ],
    [
      "Hashtag #MeuPetEstrela reúne milhares de fotos e vira tendência no fim de semana",
      "Famosos também participaram e postaram retratos de seus animais de estimação.",
    ],
  ],
  entrevistas: [
    [
      "Lia Moraes fala sobre a nova turnê: 'Quero cantar em cidades onde nunca toquei'",
      "Em entrevista exclusiva, a cantora conta como será o repertório e o que muda no palco.",
    ],
    [
      "Caio Brandão conta como criou o mundo de 'Marés de Cristal': 'Foram sete anos de rascunhos'",
      "O diretor revela as referências do filme e explica o final em aberto.",
    ],
    [
      "Nina Albuquerque comenta novo desafio na TV: 'Sempre sonhei com um auditório cheio'",
      "A apresentadora fala sobre rotina, bastidores e planos para o programa.",
    ],
    [
      "Dupla Vento Norte diz que álbum surpresa nasceu de uma viagem de carro",
      "Os músicos contam como as faixas foram escritas em estradas do interior.",
    ],
    [
      "Chef Otávio Lemos fala sobre infância, receitas de família e o novo restaurante",
      "Ele diz que o prato favorito continua sendo o arroz com feijão da avó.",
    ],
    [
      "Atriz Bia Nogueira revela preparação para papel em Lisboa: 'Estou aprendendo fado'",
      "Ela conta que faz aulas de canto e de sotaque desde setembro.",
    ],
  ],
  famosos: [
    [
      "Ator Théo Marques mostra bastidores de viagem à Patagônia com a família",
      "As fotos mostram trilhas, lagos e um piquenique à beira de uma geleira.",
    ],
    [
      "Influenciadora Maju Arantes celebra aniversário com festa temática de cinema",
      "Os convidados foram vestidos de personagens clássicos e o bolo tinha cinco andares.",
    ],
    [
      "Cantor Rafa Tavares inaugura estúdio de música em casa e abre as portas para jovens talentos",
      "O espaço terá aulas gratuitas de produção musical aos sábados.",
    ],
    [
      "Casal de atores Lara e Heitor Vasques anuncia viagem de um ano pelo mundo",
      "Eles pretendem gravar um documentário sobre a experiência e visitar 20 países.",
    ],
    [
      "Modelo Alice Furtado vira embaixadora de campanha de doação de agasalhos",
      "A ação reúne casacos novos e usados em 30 pontos de coleta pelo país.",
    ],
    [
      "Chef famoso Otávio Lemos abre restaurante no centro histórico e atrai fila de curiosos",
      "O cardápio valoriza ingredientes regionais e a casa funciona apenas à noite.",
    ],
  ],
  filmes: [
    [
      "'O Último Farol' estreia com a maior bilheteria nacional do ano",
      "O drama passado numa ilha do Sul atraiu 1,2 milhão de espectadores no primeiro fim de semana.",
    ],
    [
      "Atriz Bia Nogueira será protagonista de comédia romântica gravada em Lisboa",
      "As filmagens começam em janeiro e o elenco inclui atores brasileiros e portugueses.",
    ],
    [
      "Animação 'Pipa e o Dragão de Papel' ganha trailer e data de estreia",
      "A produção brasileira foi feita em quatro anos por um estúdio de Curitiba.",
    ],
    [
      "Diretor Caio Brandão revela bastidores do novo filme de ficção científica",
      "Parte das cenas foi gravada em um deserto artificial construído num galpão.",
    ],
    [
      "Cinema de rua reabre com sessões a preço popular e festival de clássicos",
      "A sala de 1954 foi restaurada e mantém o letreiro original na fachada.",
    ],
    [
      "Série de filmes 'Guardiões do Vale' ganha terceiro capítulo e novo elenco",
      "As gravações começam no segundo semestre, com roteiro assinado por uma dupla estreante.",
    ],
  ],
  musica: [
    [
      "Cantora Lia Moraes anuncia turnê com 20 datas pelo Brasil",
      "Os ingressos do show 'Aurora' começam a ser vendidos na próxima semana, com pré-venda para o fã-clube.",
    ],
    [
      "Banda Vento Norte lança álbum surpresa e domina as paradas de streaming",
      "O disco tem 11 faixas gravadas em casa e uma parceria com um coral infantil.",
    ],
    [
      "Duda Prates divulga trecho de nova música e promete clipe gravado no sertão",
      "A canção 'Pé na Estrada' será lançada em todas as plataformas na sexta-feira.",
    ],
    [
      "Festival Maré Alta confirma line-up com 30 atrações e três palcos",
      "O evento acontece em março e terá área gastronômica e espaço para famílias.",
    ],
    [
      "Dupla Irmãos Cavalcante grava DVD ao ar livre com participações especiais",
      "O repertório mistura sucessos antigos e músicas inéditas, e a gravação será exibida em dezembro.",
    ],
    [
      "Rapper Tito Zanella reúne fãs em ensaio aberto antes de turnê internacional",
      "O artista tocou clássicos e testou músicas do novo trabalho para uma plateia de 800 pessoas.",
    ],
  ],
  novelas: [
    [
      "Novela 'Caminhos do Sul' tem final marcado para o fim de janeiro",
      "A trama acompanha três famílias de uma cidade litorânea e termina com um casamento coletivo.",
    ],
    [
      "Folhetim das seis ganha trilha sonora com sucessos dos anos 90",
      "O disco reúne 18 faixas regravadas por artistas da nova geração.",
    ],
  ],
  premiacoes: [
    [
      "Prêmio Estrela de Ouro 2026 divulga lista completa de indicados",
      "A cerimônia acontece em dezembro e será transmitida ao vivo para todo o país.",
    ],
    [
      "'O Último Farol' lidera indicações ao Troféu Cinema em Cena com 11 categorias",
      "O filme concorre a melhor direção, atriz, ator e trilha sonora original.",
    ],
    [
      "Troféu Canção do Ano anuncia apresentadores e atrações musicais da noite",
      "O palco terá shows de cinco artistas indicados e um tributo à música instrumental.",
    ],
    [
      "Cerimônia do Prêmio Cena Aberta terá tapete vermelho com transmissão em 360 graus",
      "A novidade permite ao público acompanhar a chegada dos convidados pelo celular.",
    ],
    [
      "Grande Prêmio do Humor define finalistas entre 40 comediantes de todo o Brasil",
      "A final será realizada em um teatro de 2 mil lugares e terá votação popular.",
    ],
    [
      "Festival de Curtas Mar de Cinema abre votação do público para o melhor filme",
      "Os 12 finalistas podem ser vistos gratuitamente na plataforma do evento.",
    ],
  ],
  tv: [
    [
      "Reality 'Ilha do Desafio' define elenco da nova temporada com 16 participantes",
      "A lista traz cantores, atletas e influenciadores, e a estreia está marcada para janeiro.",
    ],
    [
      "Apresentadora Nina Albuquerque assume novo programa de auditório aos sábados",
      "A atração terá jogos, música ao vivo e quadros com a plateia.",
    ],
    [
      "Série policial 'Noite Fechada' é renovada para a segunda temporada",
      "O sucesso entre o público jovem garantiu mais dez episódios, com novos personagens.",
    ],
    [
      "Programa de culinária 'Panela Cheia' bate recorde de audiência na manhã de domingo",
      "A receita de bolo de fubá feita ao vivo foi o momento mais comentado nas redes.",
    ],
    [
      "Canal de entretenimento prepara especial de fim de ano com shows e humor",
      "A transmissão ao vivo terá cinco horas de duração e participação do público.",
    ],
    [
      "Talent show 'Voz da Rua' abre inscrições on-line para candidatos de todo o país",
      "Os testes serão feitos por vídeo e os selecionados viajam para a fase presencial.",
    ],
  ],
};

const PARAGRAPHS = [
  "A informação foi confirmada pela assessoria e deve ser atualizada nas próximas horas, conforme novos detalhes forem divulgados.",
  "Segundo pessoas próximas ao projeto, a expectativa é grande e os preparativos já estão em andamento há alguns meses.",
  "Nas redes sociais, os fãs comemoraram a novidade e já pedem mais informações sobre datas, locais e participações especiais.",
  "Este é um texto de exemplo do template: substitua por suas próprias matérias no editor do site.",
  "Os personagens e as situações descritas aqui são fictícios e servem apenas para demonstrar o layout do portal.",
  "Acompanhe o Holofote para saber mais sobre esse e outros assuntos do mundo do entretenimento.",
];

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `hf-post-${seq++}`,
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
  const start = Date.UTC(2026, 10, 10, 9, 0, 0);
  return order.map((n, i) => {
    const slug = n.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 70)
      .replace(/-$/, "");
    const paragraphs = [0, 1, 2, 3, 4].map(
      k => PARAGRAPHS[(i + k) % PARAGRAPHS.length] as string
    );
    return {
      blocks: [
        block("text", { text: n.excerpt }),
        ...paragraphs.map(t => block("text", { text: t })),
      ],
      categoryId: `cat-${n.slug}`,
      coverImage: photo(PHOTO_IDS[(i * 7) % PHOTO_IDS.length] as string),
      excerpt: n.excerpt,
      id: `hf-post-${i + 1}`,
      publishedAt: new Date(start - i * 3 * 3600 * 1000).toISOString(),
      slug,
      status: "published" as const,
      title: n.title,
    };
  });
}

export const posts: Post[] = build();
