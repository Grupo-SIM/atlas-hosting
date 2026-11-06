import type { Block, Post } from "../../model/index.js";
import { BODIES } from "./post-bodies.js";

let seq = 0;
const block = (type: string, props: Record<string, unknown>): Block => ({
  id: `seed-post-${seq++}`,
  props,
  type,
});

interface Seed {
  body?: Block[];
  category: string;
  cover: string;
  date: string;
  excerpt: string;
  slug: string;
  title: string;
}

/** Posts do site original (dados do WordPress), mais recente primeiro — empates de data seguem esta ordem. */
const seeds: Seed[] = [
  {
    category: "inbound-marketing",
    cover:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
    date: "2026-06-30",
    excerpt:
      "Inbound Marketing é a abordagem que transformou a maneira como empresas se comunicam com seus clientes no ambiente digital. Em vez de interromper, você atrai. Em vez de empurrar, você encanta. O Inbound Marketing é um conjunto de estratégias de marketing focada em atrair, converter e encantar clientes. Ao contrário do Marketing tradicional, o Inbound",
    slug: "o-que-e-inbound-marketing-conheca-tudo",
    title:
      "O que é Inbound Marketing? Conheça tudo sobre o Marketing de Atração e desenvolva estratégias para atrair e conquistar clientes",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop",
    date: "2025-11-25",
    excerpt:
      "No competitivo universo do marketing digital, a forma como um produto é apresentado faz toda a diferença entre ser apenas mais uma oferta na multidão ou se destacar como uma oportunidade irresistível. E é justamente nesse ponto que entram os criativos de alta conversão. Eles são responsáveis por transformar anúncios comuns em verdadeiras máquinas de",
    slug: "como-criar-criativos-de-alta-conversao-hoje",
    title:
      "Como Criar Criativos de Alta Conversão para Produtos Digitais e Transformar Cliques em Vendas",
  },
  {
    category: "funil-de-vendas",
    cover:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&q=80&auto=format&fit=crop",
    date: "2025-11-18",
    excerpt:
      "Se você já ouviu falar em low ticket, mas ainda não entende totalmente como essa estratégia funciona, este guia vai abrir sua visão sobre o universo dos infoprodutos. No cenário atual do marketing digital, onde a atenção do consumidor é cada vez mais disputada, os produtos low ticket se tornaram uma porta de entrada poderosa",
    slug: "o-que-e-low-ticket-como-aplicar-estrategia",
    title: "O Que é Low Ticket? Guia Completo Para Aplicar em Seu Infoproduto",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&auto=format&fit=crop",
    date: "2025-11-10",
    excerpt:
      "A maioria dos empreendedores digitais comete o mesmo erro: querem crescer rápido entrando em nichos lotados, disputando atenção com gigantes, copiando o que já está saturado. Resultado? Frustração, tráfego caro e poucas vendas. Mas o que poucos enxergam é que existem nichos específicos, quase invisíveis, com baixa concorrência e alto potencial de conversão, os chamados",
    slug: "micro-nichos-lucrativos-como-encontrar-hoje",
    title:
      "Micro Nichos Lucrativos: Como Encontrar e Explorar Nichos Pouco Concorridos",
  },
  {
    category: "inbound-marketing",
    cover:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80&auto=format&fit=crop",
    date: "2025-11-04",
    excerpt:
      "Você pode estar fazendo tudo certo. Publicando conteúdo todo dia, postando no Instagram, escrevendo legendas criativas e até pagando tráfego. Mas se ninguém clica, ninguém compra. E se ninguém compra, nada disso importa. Aqui vai uma verdade dura, mas necessária: marketing que não gera ação imediata é só barulho. Não é venda. Não é resultado.",
    slug: "direct-response-que-funciona-esta-preparado",
    title:
      "Direct Response Que Funciona: Está Preparado Para Vender Imediatamente?",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
    date: "2025-10-27",
    excerpt:
      "Criar um produto digital pode ser arriscado. Você investe tempo, energia e dinheiro em algo que acredita que o público quer, mas só descobre a verdade depois que tudo está pronto. E se ninguém comprar? E se a ideia não gerar interesse? É por isso que o lançamento semente vem ganhando força no marketing digital.",
    slug: "lancamento-semente-como-vender-seu-produto",
    title:
      "Lançamento Semente: Como Vender Seu Produto Digital Antes Mesmo de Criá-lo",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop",
    date: "2025-10-22",
    excerpt:
      "Você provavelmente já ouviu histórias de pessoas que criaram um produto digital, colocaram no ar e, meses depois, estavam comemorando faturamentos de seis dígitos. À primeira vista, parece algo fora da realidade. Mas a verdade é que essa é uma possibilidade real e está mais acessível do que nunca. Com o crescimento das vendas online,",
    slug: "como-escalar-um-produto-digital-a-6-digitos",
    title: "Como Escalar um Produto Digital e Bater R$100 Mil em Faturamento",
  },
  {
    category: "neuromarketing",
    cover:
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80&auto=format&fit=crop",
    date: "2025-10-13",
    excerpt:
      "Você já se perguntou por que escolheu aquela marca de celular em vez de outra? Ou por que clicou em um anúncio específico enquanto ignorava todos os outros? A resposta não está apenas no preço, nas especificações ou no design, está na forma como o seu cérebro foi estimulado antes mesmo de você perceber. Vivemos",
    slug: "o-poder-do-neuromarketing-nas-vendas-online",
    title:
      "O Poder do Neuromarketing: Por Que Algumas Histórias Vendem e Outras São Esquecidas",
  },
  {
    category: "sites",
    cover:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop",
    date: "2025-10-06",
    excerpt:
      "Se você quer que seu site seja reconhecido pelos motores de busca e atraia mais visitantes qualificados, entender e aplicar link building é essencial. Essa estratégia é uma das bases do SEO, pois ajuda a aumentar a autoridade do seu site e a melhorar o posicionamento nas páginas de resultados do Google. Ao longo deste",
    slug: "link-building-como-aumentar-sua-autoridade",
    title: "Link Building na Prática: Como Aumentar a Autoridade do Seu Site",
  },
  {
    category: "gestao-de-trafego",
    cover:
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=1200&q=80&auto=format&fit=crop",
    date: "2025-09-30",
    excerpt:
      "No universo do Marketing Digital, os números são fundamentais para mostrar se uma estratégia realmente funciona. Não basta apenas criar campanhas bonitas, investir em design criativo ou escolher boas palavras para um anúncio: o que realmente importa é o retorno que esse investimento gera. Quando falamos de anúncios pagos, a atenção precisa ser redobrada, já",
    slug: "como-calcular-roas-e-usar-em-seus-anuncios",
    title:
      "Como Calcular o ROAS, Usar Nos Anúncios Pagos e Não Confundir Com ROI",
  },
  {
    category: "seo",
    cover:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80&auto=format&fit=crop",
    date: "2025-09-23",
    excerpt:
      "Quando falamos em conquistar espaço nos primeiros resultados do Google, a maioria das pessoas pensa imediatamente em produzir conteúdos relevantes, recheados de palavras-chave e com apelo direto ao público-alvo. No entanto, existe um fator muitas vezes negligenciado e que pode ser decisivo para o sucesso de qualquer projeto digital: o SEO Técnico. Ele é a",
    slug: "por-que-o-seo-tecnico-e-a-base-oculta-hoje",
    title: "Por Que o SEO Técnico é a Base Oculta do Sucesso no Ranqueamento?",
  },
  {
    category: "redes-sociais",
    cover:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
    date: "2025-09-16",
    excerpt:
      "Nos últimos anos, as vendas digitais se consolidaram como uma das formas mais eficientes de gerar receita, independentemente do tamanho do negócio ou da base de clientes. Plataformas como Instagram, WhatsApp e Facebook se tornaram vitrines essenciais, permitindo que marcas e empreendedores alcancem seu público-alvo de forma direta e personalizada. Apesar disso, muitos ainda acreditam",
    slug: "veja-o-papel-dos-directs-em-vendas-digitais",
    title: "O Papel Dos Directs na Estratégia de Vendas Digitais",
  },
  {
    category: "neuromarketing",
    cover:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop",
    date: "2025-09-08",
    excerpt:
      "No universo dos produtos digitais, criar anúncios que realmente convertem não é apenas uma questão de estética ou design atraente; trata-se de compreender profundamente como a mente do consumidor reage às mensagens que recebe. Os criativos de produtos digitais desempenham um papel central nesse processo, funcionando como a primeira conexão entre a oferta e o",
    slug: "criativos-de-produtos-digitais-e-psicologia",
    title: "Psicologia e Persuasão em Criativos de Produtos Digitais",
  },
  {
    category: "design",
    cover:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80&auto=format&fit=crop",
    date: "2025-09-01",
    excerpt:
      "No cenário atual do marketing digital, cada detalhe pode significar a diferença entre conquistar ou perder um cliente em segundos. É nesse contexto que surge a importância da Landing Page. Diferente de páginas comuns de um site, uma boa Landing Page é criada com um único objetivo: converter visitantes em leads ou clientes. Seja através",
    slug: "landing-page-que-converte-o-guia-definitivo",
    title:
      "Landing Page Que Converte: O Guia Definitivo Para Criar Páginas Intuitivas com VSL de Impacto",
  },
  {
    category: "redes-sociais",
    cover:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80&auto=format&fit=crop",
    date: "2025-08-25",
    excerpt:
      "O Instagram deixou de ser apenas uma rede social para compartilhar fotos e momentos do dia a dia e se tornou uma das plataformas mais estratégicas do mundo digital. Hoje, empresas, influenciadores, criadores de conteúdo e até pequenos empreendedores enxergam a rede como uma verdadeira vitrine, capaz de ampliar a visibilidade e gerar resultados reais.",
    slug: "alcance-no-instagram-5-dicas-para-aumentar",
    title: "Alcance no Instagram: 5 Dicas Práticas Para Crescer de Verdade",
  },
  {
    category: "copy",
    cover:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
    date: "2025-08-18",
    excerpt:
      "O universo do Copywriting sempre foi cercado de mitos e fórmulas prontas. Por anos, muitos profissionais repetiram as mesmas estruturas e os mesmos discursos como se fossem verdades absolutas. O problema é que o consumidor atual já está saturado. Ele percebe quando está diante de um texto ensaiado demais, quando uma promessa soa exagerada ou",
    slug: "copywriting-de-alta-performance-tecnicas",
    title:
      "Copywriting de Alta Performance: Técnicas Inovadoras que Vendem e Poucos Estão Usando",
  },
  {
    category: "sites",
    cover:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop",
    date: "2025-08-13",
    excerpt:
      "Na era digital, onde a atenção do usuário é cada vez mais disputada, a velocidade do site tornou-se um dos fatores mais determinantes para o sucesso online. Um carregamento rápido não apenas melhora a experiência do visitante, mas também influencia diretamente o posicionamento nos mecanismos de busca e as taxas de conversão. Afinal, um usuário",
    slug: "velocidade-do-site-5-estrategias-eficientes",
    title:
      "Como Melhorar a Velocidade do Site: 5 Estratégias Infalíveis para um Carregamento Rápido e Resultados Reais",
  },
  {
    category: "neuromarketing",
    cover:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&q=80&auto=format&fit=crop",
    date: "2025-08-04",
    excerpt:
      "Você já parou para pensar por que algumas abordagens comerciais funcionam com extrema precisão enquanto outras simplesmente falham? A resposta pode estar na forma como o cérebro humano reage às mensagens e estímulos durante uma jornada de compra. E é exatamente aí que entra o poder das neurovendas. Essa abordagem vem ganhando cada vez mais",
    slug: "domine-as-neurovendas-4-tecnicas-poderosas",
    title:
      "Domine as Neurovendas: 4 Técnicas Poderosas para Aumentar suas Conversões Imediatamente",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&auto=format&fit=crop",
    date: "2025-07-28",
    excerpt:
      "O comércio digital nunca esteve tão aquecido, mas também nunca foi tão competitivo. Todos os dias, novos negócios surgem, novas ofertas aparecem e a atenção do consumidor se divide entre milhares de promessas. Em meio a tudo isso, surge uma pergunta incômoda: por que suas vendas online não estão decolando como deveriam? Se você já",
    slug: "3-passos-que-multiplicam-suas-vendas-online",
    title: "3 Passos Que Multiplicam Suas Vendas Online (Sem Gastar Mais)",
  },
  {
    category: "branding",
    cover:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80&auto=format&fit=crop",
    date: "2025-07-21",
    excerpt:
      "Você pode não perceber, mas sua marca já está se comunicando com o mundo o tempo todo, seja pelo tom das suas postagens, pelo visual do seu site ou até pelo jeito como responde um comentário nas redes sociais. Mesmo quando você acha que não está dizendo nada, sua marca está transmitindo algo. E esse",
    slug: "voce-sabe-qual-e-o-arquetipo-da-sua-marca",
    title: "Você Sabe Qual Arquétipo Sua Marca Transmite (Mesmo Sem Querer)?",
  },
  {
    category: "neuromarketing",
    cover:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
    date: "2025-05-20",
    excerpt:
      "A psicologia das cores é uma das ferramentas mais poderosas e frequentemente negligenciadas no mundo do marketing e da construção de marcas. Embora muitas vezes as decisões sobre cores sejam feitas com base em preferências pessoais ou tendências do momento, as cores têm um papel psicológico profundo no modo como percebemos e reagimos a mensagens",
    slug: "psicologia-das-cores-como-cada-cor-impacta",
    title: "Psicologia das Cores: Como cada Cor pode Impactar seu Público-Alvo",
  },
  {
    category: "seo",
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "O SEO continua sendo um dos pilares fundamentais para quem deseja alcançar bons resultados na internet. Em um cenário cada vez mais competitivo, entender e aplicar boas práticas de SEO pode ser a diferença entre um site invisível e uma página bem ranqueada nos mecanismos de busca. A otimização não apenas melhora a visibilidade do",
    slug: "12-ferramentas-de-seo-que-voce-nao-conhece",
    title: "12 Ferramentas de SEO que você não conhece e precisar usar",
  },
  {
    category: "produtividade",
    cover:
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "Você já teve a sensação de estudar por horas e, no fim do dia, perceber que quase nada ficou gravado na mente? Esse sentimento é mais comum do que parece, principalmente em um cenário onde a sobrecarga de informação, as redes sociais e a pressão por resultados acabam minando nossa produtividade. Por isso, mais do",
    slug: "6-segredos-para-voce-estudar-melhor",
    title: "6 Dicas Para Você Estudar Melhor e Ter Resultados Que Surpreendem",
  },
  {
    category: "funil-de-vendas",
    cover:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "No cenário atual dos negócios digitais, onde a concorrência é cada vez mais acirrada e o comportamento do consumidor muda rapidamente, entender o processo de compra do cliente se tornou uma necessidade estratégica. Empresas que desejam crescer de forma sustentável precisam não apenas atrair visitantes, mas também conduzi-los por uma jornada até que estejam prontos",
    slug: "funil-de-vendas-o-que-e-e-qual-importancia",
    title:
      "Funil de Vendas: O Guia Definitivo para Atrair Clientes e Aumentar a Conversão de Leads",
  },
  {
    category: "afiliados",
    cover:
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "A tributação para afiliados é um tema que está ganhando cada vez mais relevância no mercado digital. Isso acontece porque milhares de pessoas atuam como afiliados em plataformas, gerando receitas consideráveis com a venda de produtos digitais como ebooks, cursos online e mentorias. No entanto, muitos desses profissionais ainda não sabem como declarar esses rendimentos",
    slug: "tributacao-para-afiliados-impostos",
    title:
      "Tributação para Afiliados: Impostos Sobre CNPJ com CNAE de Intermediação de Negócios",
  },
  {
    category: "copy",
    cover:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "Imagine que você está prestes a tomar uma decisão de compra. Você acessa uma página de vendas e, em segundos, sente-se convencido de que aquele produto ou serviço é exatamente o que precisa. Mas o que fez você chegar a essa conclusão? Como aquela página fez parecer que tudo que você precisava estava nela? O",
    slug: "como-escrever-copy-persuasiva",
    title: "Como Escrever Copy Persuasiva para Vender Mais",
  },
  {
    category: "crm",
    cover:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "Medir a satisfação e a lealdade dos clientes é essencial para qualquer empresa que deseja crescer de forma sustentável. Muitas marcas investem em estratégias para entender melhor a experiência dos consumidores, garantindo que eles voltem a comprar e ainda recomendem os produtos ou serviços para outras pessoas. Nesse cenário, existe uma métrica amplamente utilizada para",
    slug: "nps-entenda-o-que-e-net-promoter-score",
    title: "NPS: Entenda o que é Net Promoter Score e como Implementar",
  },
  {
    category: "inbound-marketing",
    cover:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "O marketing de conteúdo é uma das estratégias mais eficazes para impulsionar vendas e engajamento no ambiente digital. À medida que avançamos em 2025, é crucial que os profissionais de marketing estejam atentos às tendências e estratégias que podem maximizar o impacto de suas campanhas. O marketing de conteúdo não apenas ajuda a atrair novos",
    slug: "marketing-de-conteudo-estrategias-atuais",
    title: "Marketing de Conteúdo: Estratégias para Vender mais em 2025",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "O Marketing Digital é uma das áreas que mais crescem no mercado atual, oferecendo diversas oportunidades para quem deseja construir uma carreira promissora e lucrativa. Com a digitalização dos negócios, a demanda por profissionais especializados nunca foi tão alta. Independentemente de você estar buscando uma transição de carreira, querendo empreender ou simplesmente se interessando pelo",
    slug: "as-profissoes-do-marketing-digital-em-alta",
    title:
      "Quais são as Profissões do Marketing Digital e Como Você pode Começar",
  },
  {
    category: "edicao-de-videos",
    cover:
      "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "Nos últimos anos, o consumo de conteúdo audiovisual disparou, impulsionado pelo crescimento de plataformas como YouTube, Instagram, TikTok e até mesmo o streaming. Com isso, a demanda por profissionais qualificados na edição de vídeos nunca esteve tão alta. Se você deseja ingressar nessa área promissora, entender como se tornar um editor de vídeos, quais são",
    slug: "editor-de-videos-como-comecar-hoje-em-dia",
    title:
      "Editor de Vídeos: Como Começar, Quanto Ganha e Melhores Ferramentas do Mercado",
  },
  {
    category: "redes-sociais",
    cover:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "As redes sociais se tornaram um dos principais canais de comunicação entre marcas e consumidores, gerando novas oportunidades e exigindo estratégias bem planejadas. Dentro desse cenário, o profissional de Social Media desempenha um papel fundamental ao gerenciar e otimizar a presença digital de empresas, garantindo que sua comunicação seja eficaz e alinhada com os objetivos",
    slug: "social-media-o-que-e-o-que-faz-quanto-ganha",
    title:
      "Social Media: O Que É, O Que Faz e Quanto Pode Ganhar Esse Profissional em Alta",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "O marketing digital tem se consolidado como uma das áreas de maior crescimento no mercado, oferecendo diversas oportunidades profissionais. O avanço da tecnologia, a transformação digital e a mudança no comportamento do consumidor criaram um cenário dinâmico, cheio de desafios e novas possibilidades. Hoje, ele é essencial para a construção e manutenção de marcas, independentemente",
    slug: "profissoes-em-alta-no-marketing-digital",
    title: "As Profissões em Alta: Como Atuar no Marketing Digital em 2025",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "O marketing digital se tornou uma das formas mais acessíveis e rentáveis de gerar dinheiro na era digital. Com o avanço da internet e a popularização das redes sociais, empresas e profissionais têm cada vez mais buscado explorar o ambiente online para atrair clientes e aumentar suas vendas. Isso abriu uma ampla gama de oportunidades",
    slug: "como-ganhar-dinheiro-com-marketing-digital",
    title: "Como Ganhar Dinheiro trabalhando com o Marketing Digital",
  },
  {
    category: "copy",
    cover:
      "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "No mundo digital, onde a atenção do público é disputada a cada segundo, saber persuadir por meio das palavras é uma habilidade valiosa. E é aqui que entra o copywriting. Mas afinal, o que é copywriting? Trata-se da arte da escrita de textos estratégicos e persuasivos que tem como objetivo promover produtos, serviços ou ideias.",
    slug: "o-que-e-copy-primeiros-passos",
    title: "O que é Copy? Os Primeiros Passos para se tornar um Copywriter",
  },
  {
    category: "inbound-marketing",
    cover:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "No cenário atual, a internet se tornou o principal meio para conectar empresas e consumidores de forma estratégica. Diante desse contexto, entender o que é marketing digital e seus principais conceitos é essencial para qualquer profissional ou empreendedor que deseja se destacar no mercado. O marketing digital engloba um conjunto de estratégias utilizadas para atrair,",
    slug: "o-que-e-marketing-digital",
    title:
      "O que é Marketing Digital? Guia Completo Com os Principais Conceitos e Estratégias",
  },
  {
    category: "gestao-de-trafego",
    cover:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "Investir em tráfego pago é uma das maneiras mais rápidas e eficazes de atrair clientes e aumentar as vendas online. Diferente do tráfego orgânico, que exige tempo e consistência, os anúncios pagos entregam resultados imediatos. Com o crescimento do marketing digital, entender o que é tráfego pago e como utilizá-lo corretamente pode ser um diferencial",
    slug: "os-principios-do-trafego-pago",
    title:
      "Os Princípios do Tráfego Pago: Tudo que Você Precisa Saber Antes de Começar",
  },
  {
    category: "gestao-de-trafego",
    cover:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "O tráfego pago é uma das estratégias mais eficazes para acelerar o crescimento no digital com o intuito de atrair visitantes. Diferente do tráfego orgânico, que leva tempo para gerar resultados, o tráfego pago permite que você atraia visitantes qualificados para seu site, redes sociais ou loja online e até mesmo uma página de vendas,",
    slug: "primeiros-passos-no-trafego-pago-guia",
    title: "Os seus Primeiros Passos no Tráfego Pago – Guia Completo",
  },
  {
    category: "inbound-marketing",
    cover:
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-07",
    excerpt:
      "O marketing digital é uma das estratégias mais poderosas e acessíveis para empresas e profissionais que desejam conquistar espaço no mercado online. Com a crescente digitalização, o marketing tradicional perdeu força frente às ferramentas digitais, que permitem maior precisão, alcance e personalização. Nos dias de hoje, o marketing tradicional tem dado lugar ao digital, o",
    slug: "o-que-e-marketing-digital-guia-completo",
    title:
      "O que é Marketing Digital? Guia Completo para Entender, Fazer e Começar sua Estratégia Online em 2025",
  },
  {
    category: "design",
    cover:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-02",
    excerpt:
      "No mundo digital e altamente visual de hoje, a identidade de uma marca é um fator essencial para seu sucesso. É aqui que entra o papel fundamental do designer gráfico. Esse profissional é responsável por transformar conceitos e ideias em elementos visuais impactantes, ajudando empresas a se comunicarem de maneira eficaz com seu público. Desde",
    slug: "designer-grafico-o-que-faz-como-trabalhar",
    title:
      "Designer Gráfico: O Que Faz, Como Trabalhar na Área e Quanto Você Pode Ganhar",
  },
  {
    category: "copy",
    cover:
      "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-02",
    excerpt:
      "A escrita tem o poder de transformar ideias em histórias inesquecíveis, discursos marcantes e conteúdos que geram impacto. No entanto, nem todos conseguem traduzir seus pensamentos em palavras com clareza e profundidade. Muitas pessoas têm conhecimentos valiosos para compartilhar, mas esbarram na dificuldade de estruturar suas ideias ou encontrar o tom certo para se conectar",
    slug: "ghost-writer-o-escritor-fantasma-o-que-e-e",
    title: "Ghost Writer, o Escritor Fantasma: O Que é e Como Trabalha",
  },
  {
    category: "branding",
    cover:
      "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-02",
    excerpt:
      "“Ele transforma negócios comuns em marcas memoráveis.” Nos últimos anos, o conceito de branding ganhou uma importância ainda maior no universo empresarial. Com a crescente competitividade e as mudanças rápidas nas preferências dos consumidores, as marcas precisam se destacar de maneira autêntica e consistente. Cada vez mais, o branding se torna uma das principais estratégias",
    slug: "branding-o-que-e-como-criar-e-sua-gestao",
    title:
      "Branding: O que é, como criar e como fazer a gestão da sua marca em 2025",
  },
  {
    category: "monetizacao-vendas",
    cover:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-02",
    excerpt:
      "Técnicas de vendas ajudam a conquistar ótimos resultados. Conduzir reuniões e envolver clientes é um trabalho que exige o cumprimento de alguns requisitos, sempre avaliando cada caso e suas particularidades. Boas técnicas de vendas ajudam a tomar as melhores decisões e conseguir gerar mais vendas, independentemente de objeções que surjam. Não há fórmula mágica para",
    slug: "quais-as-principais-tecnicas-de-vendas",
    title:
      "Quais as principais técnicas de vendas e como conquistar um cliente",
  },
  {
    category: "email-marketing",
    cover:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-02",
    excerpt:
      "E-mail marketing é uma estratégia essencial do Marketing Digital que permite a comunicação direta entre empresas e sua base de contatos. Por meio dessa abordagem, as marcas conseguem nutrir leads, fortalecer o relacionamento com clientes e impulsionar vendas de maneira eficaz. Apesar de sua alta taxa de ROI, o e-mail marketing ainda é subestimado por",
    slug: "e-mail-marketing-o-que-voce-precisa-saber",
    title:
      "O que é E-mail Marketing: tudo que você precisa saber para colocar essa estratégia em prática",
  },
  {
    category: "inbound-marketing",
    cover:
      "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=1200&q=80&auto=format&fit=crop",
    date: "2025-04-02",
    excerpt:
      "O marketing digital continua a evoluir rapidamente, impulsionado por novas tecnologias, mudanças no comportamento do consumidor e a necessidade crescente de personalização. Em 2025, diversas tendências estão moldando a maneira como marcas e empresas se conectam com seus públicos. Desde a inteligência artificial e a automação até a transparência e responsabilidade social, o marketing digital",
    slug: "tendencias-do-marketing-digital",
    title: "Tendências do Marketing Digital em 2025: O Que Está Bombando",
  },
];

/** Categorias com os nomes do WordPress, na ordem do seletor (alfabética). */
export const categorySeeds = [
  ["afiliados", "Afiliados"],
  ["branding", "Branding"],
  ["copy", "Copy"],
  ["crm", "CRM"],
  ["design", "Design"],
  ["edicao-de-videos", "Edição de Vídeos"],
  ["email-marketing", "Email-Marketing"],
  ["funil-de-vendas", "Funil de Vendas"],
  ["gestao-de-trafego", "Gestão de Tráfego"],
  ["inbound-marketing", "Inbound Marketing"],
  ["monetizacao-vendas", "Monetização & Vendas"],
  ["neuromarketing", "Neuromarketing"],
  ["produtividade", "Produtividade"],
  ["redes-sociais", "Redes Sociais"],
  ["seo", "SEO"],
  ["sites", "Sites"],
] as const;

/** Corpo completo do site original; sem ele, o corpo escrito à mão ou o resumo. */
function bodyOf(s: Seed): Block[] {
  const full = BODIES[s.slug];
  if (full?.length) return full.map(b => block(b.type, b.props));
  return s.body ?? [block("text", { text: s.excerpt })];
}

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
