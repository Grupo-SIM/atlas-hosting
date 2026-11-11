import type { Block, Category, Post } from "../../model/index.js";
import { PHOTO_IDS, photo } from "./images.js";

/**
 * Posts de exemplo do template Diário Aberto: **escritos para o template**, em português, com pessoas e situações
 * inventadas (sem celebridades nem marcas reais). 6 posts por categoria, cada um com 4 parágrafos, um subtítulo,
 * uma lista e uma citação. O corpo usa o mini-markdown do bloco `ddPostBody` (`## título`, linhas `- item`,
 * `> citação — autor`). Datas em 2026, mais novo primeiro, categorias intercaladas.
 */
export const CATEGORIES: [slug: string, name: string][] = [
  ["beleza", "Beleza"],
  ["estilo-de-vida", "Estilo de vida"],
  ["moda", "Moda"],
  ["viagem", "Viagem"],
  ["bem-estar", "Bem-estar"],
];

export const categories: Category[] = CATEGORIES.map(([slug, name]) => ({
  id: `cat-${slug}`,
  name,
  slug,
}));

interface Entry {
  /** Título. */
  t: string;
  /** Resumo (uma frase). */
  e: string;
  /** Abertura. */
  intro: string;
  /** Subtítulo do meio. */
  h: string;
  /** Dois parágrafos de desenvolvimento. */
  p: [string, string];
  /** Três itens da lista. */
  li: [string, string, string];
  /** Citação e quem disse. */
  q: [string, string];
  /** Fechamento. */
  end: string;
}

const ENTRIES: Record<string, Entry[]> = {
  beleza: [
    {
      e: "Cinco passos, dez minutos e uma pele que agradece no fim do dia.",
      end: "No fim, a melhor rotina é a que você consegue repetir sem sofrer. Comece com dois passos e acrescente um por semana.",
      h: "O que realmente muda o resultado",
      intro:
        "Passei anos acumulando potinhos que prometiam milagres e acabavam esquecidos na gaveta do banheiro. Hoje faço o contrário: pouca coisa, sempre no mesmo horário.",
      li: [
        "Limpar com água morna e um sabonete suave, sem esfregar",
        "Hidratar com uma textura leve enquanto a pele ainda está úmida",
        "Protetor solar todos os dias, inclusive em dia nublado",
      ],
      p: [
        "A regularidade importa mais do que o preço. Uma pele bem tratada por três meses mostra mais diferença do que uma semana de procedimentos intensos.",
        "Também aprendi a observar o clima: em dias secos, mais hidratação; em dias quentes, texturas em gel. Ajustar sem culpa deixa a rotina viva.",
      ],
      q: [
        "Cuidar da pele é um hábito, não uma promessa de ano novo.",
        "Dra. Beatriz Lemos, dermatologista convidada",
      ],
      t: "Rotina de pele em 10 minutos: o essencial que funciona",
    },
    {
      e: "Quatro técnicas simples para o cabelo ondulado ganhar definição sem ficar pesado.",
      end: "Se o cabelo ficou diferente do que você esperava, dê duas semanas. Ele precisa de tempo para responder a uma rotina nova.",
      h: "O segredo está na ordem das etapas",
      intro:
        "Meu cabelo passou a infância sendo alisado e, na vida adulta, descobri que ele é ondulado. O caminho até a definição foi cheio de tentativa e erro.",
      li: [
        "Aplicar o creme com o cabelo bem molhado, em mechas",
        "Secar com uma camiseta de algodão, nunca com toalha felpuda",
        "Esperar secar quase tudo antes de mexer nos fios",
      ],
      p: [
        "O erro mais comum é mexer demais. Cada vez que passamos a mão no cabelo ainda úmido, desfazemos a ondulação que estava se formando.",
        "Outra descoberta foi lavar menos: duas ou três vezes por semana bastam. O excesso de lavagem tira a oleosidade natural que ajuda na definição.",
      ],
      q: [
        "Cabelo bonito é o que está saudável, não o que está liso.",
        "Rosana, cabeleireira de bairro e minha primeira professora",
      ],
      t: "Como definir cachos e ondas sem pesar o cabelo",
    },
    {
      e: "Uma maquiagem leve, rápida e confortável para quem passa o dia fora de casa.",
      end: "Maquiagem é diversão. Se um dia você só quiser o protetor solar e um batom, está tudo certo.",
      h: "Menos produto, mais luz",
      intro:
        "Em semanas corridas, eu quase não tenho tempo de me arrumar. Foi por isso que montei uma maquiagem de quatro itens que cabe numa necessaire pequena.",
      li: [
        "Base fluida só onde a pele precisa de uniformidade",
        "Um corretivo para olheiras, aplicado com a ponta dos dedos",
        "Blush em creme, que dá viço e não marca",
      ],
      p: [
        "O truque é trabalhar com a luz natural. Passo tudo perto da janela e evito camadas: se preciso de mais cobertura, aplico em pontos específicos.",
        "O batom ou o gloss fecha o visual. Escolho um tom próximo do natural dos lábios, que não exige retoque ao longo do dia.",
      ],
      q: [
        "A melhor maquiagem é aquela que você esquece que está usando.",
        "Marina Teixeira, maquiadora e leitora do blog",
      ],
      t: "Maquiagem de quatro produtos para o dia a dia",
    },
    {
      e: "Pele saudável também depende do que acontece dentro e fora da pia do banheiro.",
      end: "Quando a pele reclama, vale olhar para o sono e para a alimentação antes de comprar mais um produto.",
      h: "Sono, água e ritmo",
      intro:
        "Passei um mês dormindo mal e a pele denunciou tudo: opaca, sensível e cheia de pequenas irritações. Foi o lembrete de que beleza começa no básico.",
      li: [
        "Dormir pelo menos sete horas na maior parte das noites",
        "Beber água ao longo do dia, não só quando bate a sede",
        "Trocar a fronha duas vezes por semana",
      ],
      p: [
        "Não existe creme que compense uma semana de privação de sono. Quando restabeleci os horários, a pele voltou ao normal em poucos dias.",
        "A alimentação também conta, sem radicalismo: frutas, legumes e comida de verdade ajudam mais do que qualquer suplemento da moda.",
      ],
      q: ["A pele é o espelho do nosso descanso.", "Dona Odete, minha avó"],
      t: "Beleza que vem de dentro: hábitos que aparecem na pele",
    },
    {
      e: "Como montar uma necessaire de viagem enxuta, sem abrir mão do que faz diferença.",
      end: "Na volta, anote o que sobrou intacto. Na próxima viagem, esse item fica em casa.",
      h: "Potes pequenos, ideias grandes",
      intro:
        "Já viajei com uma necessaire do tamanho de uma mala de mão. Hoje cabe tudo numa bolsinha, e eu sinto falta de muito pouco.",
      li: [
        "Versões em miniatura do shampoo e do condicionador",
        "Um produto multiuso para lábios, mãos e pontas dos cabelos",
        "Protetor solar em bastão, que não vaza na mochila",
      ],
      p: [
        "Compro frascos recarregáveis e transfiro só a quantidade que vou usar. É mais barato, gera menos lixo e evita surpresas na inspeção do aeroporto.",
        "Outro hábito útil é deixar uma necessaire pronta em casa. Quando surge uma viagem de última hora, a arrumação leva dois minutos.",
      ],
      q: [
        "Viajar leve é decidir com antecedência o que realmente importa.",
        "Paulo, companheiro de estrada",
      ],
      t: "Necessaire de viagem enxuta: o que levar e o que deixar",
    },
    {
      e: "Unhas fortes e bonitas sem depender do salão toda semana.",
      end: "Dê uma pausa de vez em quando. Unha também precisa respirar entre uma cor e outra.",
      h: "Cuidado em três gestos",
      intro:
        "Durante anos eu roía as unhas e achava que não tinha jeito. A mudança veio com um ritual simples de cinco minutos, uma vez por semana.",
      li: [
        "Lixar em um só sentido, sem serrar de um lado para o outro",
        "Hidratar as cutículas com óleo à noite",
        "Usar uma base fortalecedora antes de qualquer esmalte",
      ],
      p: [
        "A hidratação foi o que mais trouxe resultado. Unhas ressecadas descamam e quebram; com óleo e creme, elas ficaram flexíveis em poucas semanas.",
        "Quando faço o esmalte em casa, escolho cores neutras: erro menos e retoco rápido. Para ocasiões especiais, deixo a ousadia para o salão.",
      ],
      q: [
        "Quem cuida das mãos cuida de tudo o que elas tocam.",
        "Tia Lúcia, manicure há trinta anos",
      ],
      t: "Unhas fortes em casa: o ritual de cinco minutos",
    },
  ],
  "bem-estar": [
    {
      e: "Cinco minutos de respiração para acalmar a mente em dias de agenda cheia.",
      end: "Respirar é gratuito e está sempre à mão. Experimente antes de uma reunião ou de dormir.",
      h: "Como começar",
      intro:
        "Em semanas intensas, eu percebia que prendia a respiração sem notar. Um exercício simples me ajudou a reconhecer esse padrão e a mudar.",
      li: [
        "Sentar com as costas apoiadas e os pés no chão",
        "Inspirar contando até quatro, soltar contando até seis",
        "Repetir por cinco minutos, sem se cobrar",
      ],
      p: [
        "No início, a mente divaga o tempo todo, e está tudo bem. Basta voltar ao ar que entra e sai, sem se julgar.",
        "Com o tempo, passei a usar o exercício em momentos de tensão, como antes de uma conversa difícil ou numa fila longa.",
      ],
      q: [
        "A respiração é o único botão de pausa que sempre carregamos.",
        "Professora Marta, instrutora de yoga",
      ],
      t: "Respiração consciente: cinco minutos que mudam o dia",
    },
    {
      e: "Como criar o hábito de caminhar todos os dias, mesmo sem tempo para a academia.",
      end: "Caminhar é o exercício mais acessível que existe. O importante é sair de casa.",
      h: "Passo a passo",
      intro:
        "Nunca me dei bem com academias. A caminhada diária foi a atividade que finalmente deu certo, justamente por ser simples e flexível.",
      li: [
        "Começar com dez minutos e aumentar aos poucos",
        "Caminhar em horários fixos, como depois do almoço",
        "Escolher um trajeto agradável, com árvores ou vista",
      ],
      p: [
        "O segredo foi associar a caminhada a algo prazeroso: um podcast, um café no caminho ou um telefonema com uma amiga.",
        "Em poucas semanas, percebi mais energia durante a tarde e um sono mais profundo. Foi um ganho que não esperava.",
      ],
      q: [
        "Quem caminha todos os dias nunca fica parado na vida.",
        "Seu Raimundo, 82 anos e caminhante diário",
      ],
      t: "Caminhada diária: como transformar em hábito",
    },
    {
      e: "Ideias de refeições simples, nutritivas e rápidas para a correria da semana.",
      end: "Comer bem não precisa ser complicado. Escolha comida de verdade e respeite a sua fome.",
      h: "Prato colorido, cabeça tranquila",
      intro:
        "Cozinhar todo dia nunca foi a minha praia, mas descobri que organização simples faz muita diferença. Hoje deixo a semana adiantada em duas horas no domingo.",
      li: [
        "Cozinhar uma base de grãos e legumes assados para a semana",
        "Deixar uma proteína pronta para variar nas refeições",
        "Manter frutas à vista para os lanches",
      ],
      p: [
        "A variedade vem dos temperos e dos molhos. Com a mesma base, consigo fazer uma salada, uma tigela morna ou um recheio de omelete.",
        "Também parei de ver comida como inimiga. Comer com atenção, sem tela, melhora a digestão e a relação com a refeição.",
      ],
      q: [
        "A comida de verdade é a melhor forma de cuidado.",
        "Nutricionista Ana Paula, em uma palestra aberta",
      ],
      t: "Refeições rápidas e nutritivas para a semana corrida",
    },
    {
      e: "O que fazer para dormir melhor quando a cabeça não desliga no fim do dia.",
      end: "Se o sono não vem, não brigue com ele. Respire fundo e tente de novo amanhã.",
      h: "Um ritual para a noite",
      intro:
        "Passei meses acordando às três da manhã, com a cabeça acelerada. Uma sequência de hábitos simples ajudou a trazer o sono de volta.",
      li: [
        "Desligar telas uma hora antes de deitar",
        "Escrever três coisas que deram certo no dia",
        "Manter o quarto escuro, fresco e silencioso",
      ],
      p: [
        "O diário da noite foi o que mais ajudou. Colocar os pensamentos no papel tira o peso da cabeça e permite descansar de verdade.",
        "Também aprendi a evitar cafeína depois das duas da tarde. Parece um detalhe, mas foi o que fez a maior diferença no começo.",
      ],
      q: [
        "Dormir bem é a base de tudo o que queremos fazer amanhã.",
        "Doutor Henrique, médico do sono",
      ],
      t: "Dormir melhor: um ritual simples para a noite",
    },
    {
      e: "Como criar pequenos momentos de pausa para reduzir o estresse e aumentar o foco.",
      end: "Pausa não é preguiça. É o que permite continuar com qualidade.",
      h: "Micro-pausas ao longo do dia",
      intro:
        "Trabalhando de casa, eu emendava uma tarefa na outra sem levantar da cadeira. As pequenas pausas mudaram a qualidade do meu dia.",
      li: [
        "Levantar a cada hora para alongar o pescoço e os ombros",
        "Olhar pela janela por um minuto, sem celular",
        "Tomar um copo de água e respirar fundo",
      ],
      p: [
        "A cada pausa, eu volto à tarefa com a cabeça mais fresca. O rendimento melhora e o cansaço no fim do dia diminui.",
        "Programei lembretes discretos no relógio. No começo foi estranho, mas hoje o corpo pede o intervalo sozinho.",
      ],
      q: [
        "Quem para por um minuto avança mais rápido depois.",
        "Fabiana, terapeuta ocupacional",
      ],
      t: "Micro-pausas: um minuto que muda o seu foco",
    },
    {
      e: "Atividades para fazer sozinha ou em família que desaceleram o fim de semana.",
      end: "Descansar é uma tarefa importante. Marque na agenda como qualquer outro compromisso.",
      h: "Fim de semana de verdade",
      intro:
        "Durante muito tempo, meus fins de semana eram uma extensão da semana: tarefas, mensagens e correria. Decidi reservar um dia para não fazer nada importante.",
      li: [
        "Cozinhar sem pressa uma receita nova",
        "Passear em um parque, sem destino definido",
        "Jogar um jogo de tabuleiro com a família",
      ],
      p: [
        "No início sentia culpa por não produzir. Aos poucos, percebi que voltava à segunda-feira com mais ânimo e menos irritação.",
        "Também deixei o celular em outro cômodo durante algumas horas. A ausência de notificações foi um presente.",
      ],
      q: [
        "Descansar é um jeito de agradecer pelo que a gente construiu.",
        "Vó Cecília, em uma tarde de domingo",
      ],
      t: "Fim de semana sem pressa: um dia para desacelerar",
    },
  ],
  "estilo-de-vida": [
    {
      e: "Um método de domingo para começar a semana com a casa em ordem e a cabeça leve.",
      end: "Não precisa ser perfeito. O objetivo é que segunda-feira chegue sem sustos.",
      h: "Planejar também é descansar",
      intro:
        "Aos domingos à tarde eu separo meia hora para organizar a semana. Parece pouco, mas é o que evita a correria de segunda de manhã.",
      li: [
        "Olhar a agenda e marcar os três compromissos mais importantes",
        "Definir o cardápio básico das refeições do almoço",
        "Separar as roupas e a bolsa dos dois primeiros dias",
      ],
      p: [
        "Escrevo tudo em papel, porque o gesto de escrever me ajuda a decidir. Depois fotografo a página e deixo no celular para consultar.",
        "O ritual também serve para soltar pendências: o que não cabe na semana vai para uma lista de depois, sem culpa.",
      ],
      q: [
        "Organizar a semana é um presente que damos ao nosso eu do futuro.",
        "Helena, leitora e amiga de longa data",
      ],
      t: "Planejamento de domingo: uma semana mais leve em 30 minutos",
    },
    {
      e: "Pequenas mudanças de decoração que transformam a casa sem obras nem gastos altos.",
      end: "A casa é o seu abrigo. Se ela contar a sua história, já está decorada o suficiente.",
      h: "Começar pelos detalhes",
      intro:
        "Moro de aluguel e, durante muito tempo, achei que não valia a pena investir em decoração. Estava errada: pequenos gestos mudam completamente o clima de um cômodo.",
      li: [
        "Trocar as cortinas por um tecido leve e claro",
        "Reunir livros e plantas em uma prateleira só",
        "Usar luz quente e indireta à noite, no lugar da lâmpada do teto",
      ],
      p: [
        "A iluminação foi a mudança mais barata e a que mais surtiu efeito. Duas luminárias de mesa deixaram a sala acolhedora em uma noite.",
        "Outra aposta são os objetos com história: uma xícara de viagem, uma foto de família, um tecido herdado. Eles dão personalidade sem custar caro.",
      ],
      q: [
        "Casa bonita é casa em que a gente tem vontade de ficar.",
        "Arquiteta Juliana Ramos, em uma conversa de bairro",
      ],
      t: "Decoração de aluguel: cinco mudanças que não exigem obra",
    },
    {
      e: "Como organizar o orçamento do mês sem planilhas complicadas e sem abrir mão do lazer.",
      end: "Dinheiro organizado é liberdade. Comece pequeno e deixe o hábito crescer.",
      h: "O método dos três grupos",
      intro:
        "Eu fugia de falar de dinheiro. Foi um amigo que me mostrou que a organização cabe em uma folha com três colunas, e mudou minha relação com as contas.",
      li: [
        "Gastos fixos: aluguel, contas e transporte",
        "Gastos variáveis: mercado, saídas e imprevistos",
        "Objetivos: reserva de emergência e viagem do próximo ano",
      ],
      p: [
        "No começo do mês defino quanto vai para cada grupo. O que sobra no variável é o que posso gastar sem culpa; o que não gastei passa para os objetivos.",
        "Semanalmente dou uma olhada rápida nos extratos. São cinco minutos que evitam sustos e ajudam a lembrar por que estou economizando.",
      ],
      q: [
        "Quem controla o próprio dinheiro dorme melhor.",
        "Seu Antônio, meu pai",
      ],
      t: "Orçamento sem drama: o método dos três grupos",
    },
    {
      e: "Dicas práticas para ler mais, mesmo com uma rotina cheia e o celular sempre por perto.",
      end: "Ler é um prazer, não uma meta. Se um livro não prende, largue sem remorso.",
      h: "Pequenas brechas, grandes histórias",
      intro:
        "Passei um ano lendo apenas cinco livros. No ano seguinte, ao mudar alguns hábitos, terminei vinte e dois sem sentir que estava me esforçando.",
      li: [
        "Deixar o livro à vista, na mesa de cabeceira ou na bolsa",
        "Ler quinze minutos antes de dormir, no lugar de rolar a tela",
        "Alternar um livro denso com um leve para manter o ritmo",
      ],
      p: [
        "O segredo foi trocar a obrigação pelo prazer. Escolho histórias que me deixam curiosa e não me cobro de terminar leituras que me entediam.",
        "Também passei a anotar trechos em um caderno. Reler essas frases dá vontade de voltar ao livro e ajuda a fixar o que li.",
      ],
      q: [
        "Um livro bom é uma conversa que continua depois da última página.",
        "Professor Eduardo Nunes, de uma aula de literatura",
      ],
      t: "Como ler mais com uma rotina cheia (e sem culpa)",
    },
    {
      e: "Um guia simples para plantas que sobrevivem a quem não tem tempo nem mão boa.",
      end: "Planta é paciência. Observe, ajuste e comemore cada folha nova.",
      h: "Escolha o vaso certo para o seu canto",
      intro:
        "Já matei mais plantas do que gostaria de admitir. Depois de entender o básico de luz e rega, minha casa virou um pequeno jardim.",
      li: [
        "Jiboia, que aceita pouca luz e perdoa esquecimentos",
        "Espada-de-são-jorge, resistente e de rega espaçada",
        "Zamioculca, ótima para ambientes internos",
      ],
      p: [
        "A regra de ouro é enfiar o dedo na terra: se estiver úmida, não regue. O excesso de água mata mais plantas do que a falta.",
        "Outro cuidado é observar a luz da casa durante o dia. Anoto onde o sol bate em cada horário antes de escolher o lugar de cada vaso.",
      ],
      q: [
        "Quem cuida de uma planta aprende a esperar.",
        "Dona Neide, vizinha e jardineira de varanda",
      ],
      t: "Plantas para quem não tem mão boa: cinco espécies fáceis",
    },
    {
      e: "Como criar uma rotina de manhã que não exige acordar de madrugada.",
      end: "Teste por uma semana e ajuste. A rotina ideal é a que respeita o seu ritmo.",
      h: "Começar o dia do seu jeito",
      intro:
        "Li muito sobre rotinas matinais que exigiam acordar às cinco. Descobri que o que importa é ter um começo de dia calmo, não cedo.",
      li: [
        "Acordar quinze minutos mais cedo do que o necessário",
        "Beber água e abrir a janela antes de olhar o celular",
        "Tomar o café sentada, sem pressa e sem telas",
      ],
      p: [
        "Essa pequena folga mudou meu humor. Em vez de começar o dia apagando incêndios, eu me dou uns minutos só para mim.",
        "Também deixo tudo pronto na noite anterior: a roupa, a mochila e o café programado. Menos decisões de manhã significam mais calma.",
      ],
      q: [
        "A manhã é o primeiro capítulo do dia: vale escrevê-lo com carinho.",
        "Clara, a autora, em seu caderno de anotações",
      ],
      t: "Rotina da manhã sem acordar de madrugada",
    },
  ],
  moda: [
    {
      e: "Doze peças, muitas combinações: como montar um guarda-roupa que facilita a vida.",
      end: "Um guarda-roupa enxuto é um guarda-roupa que você realmente usa. Comece revisando o que já tem.",
      h: "Peças-chave que se repetem bem",
      intro:
        "Depois de uma mudança de casa, percebi que usava só um quarto das minhas roupas. Foi o empurrão para montar um guarda-roupa menor e mais inteligente.",
      li: [
        "Uma calça de alfaiataria em tom neutro",
        "Duas camisetas de algodão de boa qualidade",
        "Um blazer leve que funciona com jeans e com saia",
      ],
      p: [
        "A regra é escolher cores que conversam entre si. Com uma paleta de quatro ou cinco tons, quase tudo combina com quase tudo.",
        "Antes de comprar algo novo, faço um teste simples: consigo montar pelo menos três looks com essa peça usando o que já tenho?",
      ],
      q: [
        "Estilo é repetir o que fica bem em você com personalidade.",
        "Camila Barros, consultora de imagem",
      ],
      t: "Guarda-roupa cápsula: 12 peças e dezenas de looks",
    },
    {
      e: "Ideias de looks confortáveis e bonitos para os dias quentes, sem abrir mão da elegância.",
      end: "No calor, conforto é o novo luxo. Escolha tecidos que respiram e cortes que acompanham o corpo.",
      h: "Tecidos que respiram",
      intro:
        "Eu sofria para me vestir no verão: ou ficava bonita e suada, ou confortável e desleixada. Descobri que dá para ter as duas coisas.",
      li: [
        "Linho e algodão em cores claras",
        "Vestidos soltos, com decote que ventila",
        "Sandálias confortáveis para caminhar o dia inteiro",
      ],
      p: [
        "O corte faz tanta diferença quanto o tecido. Peças soltas e fluidas deixam o ar circular e continuam elegantes, mesmo amassadas.",
        "Também gosto de camadas leves, como uma camisa aberta sobre o vestido, que protegem do sol e do ar-condicionado.",
      ],
      q: [
        "Elegância é estar à vontade na própria roupa.",
        "Dona Olga, costureira de uma vida inteira",
      ],
      t: "Looks de verão: conforto e elegância no calor",
    },
    {
      e: "Como misturar estampas com segurança e criar visuais divertidos sem exageros.",
      end: "Brinque, erre e ajuste. A moda também é um jeito de se divertir.",
      h: "Regras para ousar sem medo",
      intro:
        "Durante anos achei que estampa com estampa era proibido. Um dia misturei listras com flores por acaso e a combinação rendeu elogios.",
      li: [
        "Escolher estampas com uma cor em comum",
        "Variar o tamanho: uma maior e outra menor",
        "Manter o resto do visual em tons neutros",
      ],
      p: [
        "O segredo é ter um ponto de equilíbrio. Se uma estampa chama muita atenção, deixe a outra mais discreta, como um xadrez miúdo ou um pequeno poá.",
        "Os acessórios ajudam a fechar a ideia: um cinto liso ou uma bolsa neutra deixam o conjunto mais limpo.",
      ],
      q: [
        "Quem se veste com alegria costuma acertar.",
        "Tereza, amiga e dona de brechó",
      ],
      t: "Misturar estampas sem errar: três regras simples",
    },
    {
      e: "Um guia para comprar menos, melhor e com mais consciência, sem perder o estilo.",
      end: "Pense na roupa como um investimento de longo prazo. Pergunte: eu vou usar isso daqui a um ano?",
      h: "Compras que fazem sentido",
      intro:
        "Já comprei muita coisa por impulso e deixei na gaveta com a etiqueta. Mudar a forma de comprar foi uma das decisões mais acertadas dos últimos anos.",
      li: [
        "Esperar 48 horas antes de fechar uma compra não planejada",
        "Priorizar tecidos duráveis e costuras bem feitas",
        "Frequentar brechós e feiras de troca",
      ],
      p: [
        "Encontrar uma peça boa em um brechó dá uma satisfação diferente. Além de mais barata, ela tem uma história e evita novo consumo.",
        "Aprendi também a cuidar melhor do que tenho: lavar do avesso, secar à sombra e consertar pequenas falhas prolonga a vida das roupas.",
      ],
      q: [
        "A roupa mais sustentável é aquela que já está no seu armário.",
        "Dani, organizadora de trocas de roupas",
      ],
      t: "Moda consciente: comprar menos e usar mais",
    },
    {
      e: "Aprenda a combinar acessórios para dar um toque especial aos looks mais básicos.",
      end: "Acessório bom é aquele que combina com você e com as suas rotinas.",
      h: "Detalhes que mudam tudo",
      intro:
        "Quando o orçamento aperta, é nos acessórios que eu invisto. Um lenço, um brinco ou um cinto podem transformar um look do dia a dia.",
      li: [
        "Um lenço de seda que serve de faixa, gola ou alça de bolsa",
        "Brincos médios que combinam com a maior parte das roupas",
        "Um cinto de couro em tom médio",
      ],
      p: [
        "A regra que sigo é escolher um acessório de destaque por vez. Se os brincos são grandes, o colar fica de lado; se o lenço é colorido, o resto é discreto.",
        "Também gosto de misturar metais, o que deixou de ser proibido. O importante é manter o visual coerente com o clima do dia.",
      ],
      q: [
        "O detalhe é o que faz o básico parecer escolha.",
        "Rita, designer de acessórios independente",
      ],
      t: "Acessórios que transformam o look básico",
    },
    {
      e: "O que vestir para parecer arrumada em uma reunião sem sacrificar o conforto.",
      end: "Vista-se para o dia que você vai ter. Conforto e segurança aparecem na postura.",
      h: "Alfaiataria confortável",
      intro:
        "Em reuniões, eu me sentia fantasiada de executiva. Foi quando descobri a alfaiataria macia e os tecidos com elasticidade que tudo ficou mais fácil.",
      li: [
        "Calça de cintura alta em tecido com elastano",
        "Camisa de algodão que não amassa em excesso",
        "Sapatilha ou mocassim no lugar do salto alto",
      ],
      p: [
        "O segredo é investir no caimento. Uma peça bem ajustada passa profissionalismo mesmo sem ser sofisticada.",
        "Outro conselho é ter um look pronto para dias de pressa: uma combinação que você sabe que funciona e não exige pensar demais.",
      ],
      q: [
        "A roupa certa é a que deixa você livre para pensar no que importa.",
        "Larissa, gerente de projetos e leitora do blog",
      ],
      t: "Looks de trabalho: arrumada sem perder o conforto",
    },
  ],
  viagem: [
    {
      e: "Um roteiro de três dias em uma cidade serrana, com passeios gratuitos e boa comida.",
      end: "Viajar perto também é viajar. Às vezes, basta trocar de cenário para recarregar as energias.",
      h: "Entre trilhas e cafés",
      intro:
        "Em um feriado prolongado, peguei a estrada para uma cidade de montanha a poucas horas de casa. Voltei com a sensação de ter ficado uma semana fora.",
      li: [
        "Manhã: trilha curta até um mirante com vista para o vale",
        "Tarde: cafés e feiras de artesanato no centro histórico",
        "Noite: jantar em uma casa de comida mineira",
      ],
      p: [
        "A cidade é pequena e quase tudo se faz a pé. Isso deixou o ritmo tranquilo: acordávamos sem despertador e decidíamos o dia no café da manhã.",
        "O que mais me marcou foram as conversas com os moradores. Cada dica de caminho rendeu uma história e um endereço novo.",
      ],
      q: [
        "A cidade pequena ensina a olhar com calma.",
        "Seu Zé, dono da pousada",
      ],
      t: "Fim de semana na serra: roteiro de três dias sem gastar muito",
    },
    {
      e: "Como planejar uma viagem de trem pela paisagem do interior, do bilhete ao lanche.",
      end: "Viagens lentas devolvem o prazer do caminho. Leve um livro, um caderno e disposição.",
      h: "O charme de ir devagar",
      intro:
        "Sempre quis fazer uma viagem de trem pelo interior e finalmente reservei um fim de semana para isso. Foi uma das experiências mais tranquilas que tive.",
      li: [
        "Reservar com antecedência, principalmente em feriados",
        "Levar um lanche e uma garrafa de água",
        "Escolher a poltrona do lado da janela",
      ],
      p: [
        "O trem não corre, e a paisagem muda aos poucos: pastos, pequenas estações e vilarejos com sinos tocando. Dá vontade de descer em todos.",
        "Aproveitei para escrever no caderno e ouvir as pessoas ao lado. Viajar sem pressa abre espaço para pensamentos que a rotina não deixa chegar.",
      ],
      q: [
        "O caminho também faz parte da viagem.",
        "Maestro Álvaro, condutor aposentado",
      ],
      t: "Viagem de trem pelo interior: tudo o que aprendi",
    },
    {
      e: "Dicas de quem viaja sozinha para aproveitar cada destino com segurança e tranquilidade.",
      end: "Viajar sozinha é um exercício de confiança. A cada passeio, você descobre mais sobre si.",
      h: "Preparar-se faz parte da aventura",
      intro:
        "Minha primeira viagem sozinha foi um misto de medo e entusiasmo. Hoje é uma das coisas que mais gosto de fazer, e algumas regrinhas facilitam bastante.",
      li: [
        "Avisar alguém de confiança sobre o roteiro e as hospedagens",
        "Escolher acomodações bem avaliadas e perto do centro",
        "Guardar cópias digitais dos documentos",
      ],
      p: [
        "A parte mais surpreendente foi perceber como é fácil conhecer gente. Em cafés e hostels, sempre aparece alguém com quem dividir uma mesa.",
        "Também aprendi a respeitar o meu ritmo: se quero ficar duas horas em um museu, fico; se prefiro pular o passeio, pulo sem dar explicações.",
      ],
      q: [
        "Quando viajamos sozinhas, a companhia mais interessante é a nossa.",
        "Fernanda, mochileira há doze anos",
      ],
      t: "Viajar sozinha: um guia de segurança e liberdade",
    },
    {
      e: "O que comer, visitar e fotografar em uma cidade litorânea fora de temporada.",
      end: "A praia fora de temporada tem outro encanto. Se puder, viaje em dia de semana.",
      h: "O mar em voz baixa",
      intro:
        "Sempre vi a praia cheia e barulhenta. Em um maio chuvoso, descobri uma versão silenciosa do litoral, que se tornou a minha favorita.",
      li: [
        "Caminhar na areia no começo da manhã, quando o mar está calmo",
        "Almoçar em quiosques de pescadores, com peixe do dia",
        "Visitar a feira de artesanato nos fins de tarde",
      ],
      p: [
        "Sem multidões, os preços caem e o atendimento melhora. Conversei muito com os donos de pousadas, que contaram como a cidade muda ao longo do ano.",
        "Mesmo com céu nublado, as fotos ficam bonitas: a luz é suave e o mar ganha tons de cinza e verde que eu nunca tinha notado.",
      ],
      q: [
        "O mar tem muito a dizer para quem escuta fora de temporada.",
        "Pescador Joaquim, em um fim de tarde na praia",
      ],
      t: "Litoral fora de temporada: o lado calmo do mar",
    },
    {
      e: "Como arrumar uma mala de mão que dá conta de uma semana inteira de viagem.",
      end: "Quanto menos você leva, mais livre fica para improvisar. Arrume uma vez e teste o peso.",
      h: "Leve só o que se repete",
      intro:
        "A primeira vez que viajei com mala de mão achei impossível. Hoje não consigo imaginar outra forma, e a ideia é mais simples do que parece.",
      li: [
        "Escolher uma paleta de cores e peças que combinam entre si",
        "Enrolar as roupas, em vez de dobrar, para ganhar espaço",
        "Usar o calçado mais pesado no próprio trajeto",
      ],
      p: [
        "Lavar uma peça na pia do hotel resolve muita coisa. Com tecidos de secagem rápida, não preciso levar roupa para sete dias.",
        "Na volta, deixo espaço para lembrancinhas e levo uma sacola dobrável. Assim, a viagem não termina com a mala estourando.",
      ],
      q: ["Bagagem leve, cabeça leve.", "Roberto, piloto de linha regional"],
      t: "Mala de mão para uma semana: o método que uso",
    },
    {
      e: "Ideias de passeios culturais e gratuitos para conhecer bem uma cidade grande.",
      end: "Toda cidade guarda boas histórias. Basta caminhar com os olhos abertos.",
      h: "Cultura sem gastar muito",
      intro:
        "Uma cidade grande pode assustar o bolso, mas também oferece muita cultura de graça. Em uma semana, montei um roteiro sem pagar um único ingresso.",
      li: [
        "Visitar bibliotecas e centros culturais públicos",
        "Participar de caminhadas guiadas oferecidas por voluntários",
        "Passear por parques e feiras de livros ao ar livre",
      ],
      p: [
        "Descobri uma programação enorme: exposições, saraus e apresentações de rua. Pesquisar nos murais e nos sites da prefeitura vale ouro.",
        "O melhor foi conversar com moradores. Cada um tinha uma indicação diferente, e acabei saindo do roteiro original sem arrependimento.",
      ],
      q: [
        "A cidade se revela a quem anda a pé.",
        "Guia Tadeu, voluntário em caminhadas culturais",
      ],
      t: "Cidade grande sem gastar muito: roteiro cultural gratuito",
    },
  ],
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70)
    .replace(/-$/, "");

let seq = 0;
const text = (t: string): Block => ({
  id: `dd-pb-${seq++}`,
  props: { text: t },
  type: "text",
});

const bodyOf = (e: Entry): Block[] => [
  text(e.intro),
  text(`## ${e.h}`),
  text(e.p[0]),
  text(e.p[1]),
  text(e.li.map(i => `- ${i}`).join("\n")),
  text(`> ${e.q[0]} — ${e.q[1]}`),
  text(e.end),
];

/** Intercala as categorias (a home mostra um pouco de cada) e distribui datas decrescentes em 2026. */
function build(): Post[] {
  const queues = CATEGORIES.map(([slug]) => ({
    items: [...(ENTRIES[slug] ?? [])],
    slug,
  }));
  const order: { entry: Entry; slug: string }[] = [];
  let added = true;
  while (added) {
    added = false;
    for (const q of queues) {
      const next = q.items.shift();
      if (next) {
        order.push({ entry: next, slug: q.slug });
        added = true;
      }
    }
  }
  const start = Date.UTC(2026, 10, 10, 9, 0, 0);
  return order.map(({ entry, slug }, i) => ({
    blocks: bodyOf(entry),
    categoryId: `cat-${slug}`,
    coverImage: photo(PHOTO_IDS[(i * 7) % PHOTO_IDS.length] as string),
    excerpt: entry.e,
    id: `dd-post-${i + 1}`,
    publishedAt: new Date(start - i * 3 * 24 * 3600 * 1000).toISOString(),
    slug: slugify(entry.t),
    status: "published" as const,
    title: entry.t,
  }));
}

export const posts: Post[] = build();
