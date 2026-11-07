import type { PostSeed } from "./post-seed.js";

export const POSTS_B: PostSeed[] = [
  {
    body: [
      [
        "t",
        "Muita gente abre o Google Analytics, o painel da loja e as estatísticas das redes sociais, passa meia hora olhando gráficos e fecha tudo sem saber o que fazer. O problema raramente é falta de dados: é excesso de números sem uma pergunta clara por trás.\n\nA saída é montar um painel pequeno, que caiba numa única tela, e olhar para ele sempre no mesmo dia da semana. Neste post você vai ver cinco métricas que funcionam para quase todo pequeno negócio e, mais importante, o que fazer quando cada uma delas cai.",
      ],
      ["h2", "Como montar o painel em 20 minutos"],
      [
        "t",
        "Não precisa de ferramenta cara. Uma planilha com uma linha por semana e uma coluna por métrica resolve. Toda segunda-feira, reserve 15 minutos para preencher os números da semana anterior e comparar com as quatro semanas anteriores.\n\nComparar com a média do último mês evita sustos falsos: uma semana com feriado quase sempre parece pior que a anterior. O que interessa é a **tendência**, não o número isolado.",
      ],
      ["h2", "As 5 métricas que valem a sua segunda-feira"],
      ["h3", "1. Visitas ao site (ou alcance do perfil)"],
      [
        "t",
        "É a porta de entrada: se ninguém chega, nada mais acontece. Anote o total de visitas da semana e de onde vieram — busca, redes sociais, anúncios ou acesso direto.\n\n**Quando cai:** descubra primeiro qual origem caiu. Se foi a busca, confira se alguma página importante saiu do ar ou mudou de endereço. Se foram as redes, revise a frequência de postagens. Se foram os anúncios, verifique o orçamento e se alguma campanha foi pausada sem querer.",
      ],
      ["h3", "2. Taxa de conversão"],
      [
        "t",
        "É a porcentagem de visitantes que fazem a ação principal: comprar, pedir orçamento, chamar no WhatsApp. Imagine um site com 2.000 visitas e 30 pedidos na semana: a conversão é de 1,5%.\n\n**Quando cai:** se as visitas estão normais e a conversão despencou, o problema costuma estar no caminho até a compra. Faça você mesmo uma compra de teste pelo celular, confira se o formulário está enviando e se o preço ou o frete mudaram.",
      ],
      ["h3", "3. Custo por cliente (ou por contato)"],
      [
        "t",
        "Divida o que você gastou em anúncios na semana pelo número de clientes ou contatos gerados. Se investiu R$ 600 e recebeu 20 pedidos de orçamento, cada contato custou R$ 30.\n\n**Quando sobe:** olhe os anúncios com pior resultado e pause os que gastam sem gerar contato. Muitas vezes um único público ou uma peça cansada puxa a média inteira para cima.",
      ],
      [
        "i",
        "Pessoa analisando gráficos de desempenho em um notebook sobre a mesa do escritório",
      ],
      ["h3", "4. Ticket médio"],
      [
        "t",
        "É o faturamento dividido pelo número de pedidos. Mostra se as pessoas estão gastando mais ou menos a cada compra.\n\n**Quando cai:** veja se uma promoção concentrou as vendas em itens baratos, se o kit mais vendido saiu do estoque ou se a sugestão de produtos complementares sumiu da página.",
      ],
      ["h3", "5. Clientes que voltam"],
      [
        "t",
        "Conte quantos pedidos da semana vieram de quem já tinha comprado antes. Para quem vende serviços, conte renovações e indicações.\n\n**Quando cai:** é sinal de que o relacionamento esfriou. Retome o contato com quem comprou há 60 ou 90 dias, peça uma avaliação do último atendimento e confira se há reclamações recentes sem resposta.",
      ],
      ["h2", "Erros comuns ao ler o painel"],
      [
        "t",
        "• Reagir a uma única semana ruim sem olhar a tendência.\n• Mudar várias coisas ao mesmo tempo e não saber o que funcionou.\n• Acompanhar números de vaidade, como curtidas, no lugar de contatos e vendas.\n• Preencher a planilha só quando lembra — é a regularidade que dá valor ao painel.",
      ],
      [
        "t",
        "Comece simples: crie a planilha hoje, preencha as últimas quatro semanas com o que conseguir recuperar e marque na agenda um horário fixo para a revisão. Em um mês você vai enxergar padrões que antes passavam despercebidos, e cada queda deixa de ser um susto para virar uma tarefa clara na sua lista.",
      ],
    ],
    category: "dados",
    date: "2026-10-21",
    excerpt:
      "Um painel que cabe numa tela e leva 15 minutos por semana: as cinco métricas que todo pequeno negócio deveria acompanhar e o que fazer quando cada uma delas cai.",
    slug: "5-metricas-para-acompanhar-toda-semana",
    title: "5 métricas para acompanhar toda semana (e o que fazer quando caem)",
  },
  {
    body: [
      [
        "t",
        "“Vendi bem este mês, mas não sei se foi o anúncio, o post no Instagram ou o e-mail.” Se essa frase soa familiar, você não está sozinho. Sem uma forma de marcar os links, boa parte do tráfego aparece como “direto” ou “social” no relatório, e fica impossível saber o que realmente trouxe o cliente.\n\nOs parâmetros UTM resolvem isso com um pequeno complemento no final do endereço. Não exigem programação e funcionam com o Google Analytics e com a maioria das plataformas de loja virtual.",
      ],
      ["h2", "O que são os parâmetros UTM"],
      [
        "t",
        "São etiquetas adicionadas ao endereço de uma página, depois de um ponto de interrogação. Quem clica nem percebe, mas a ferramenta de análise lê essas etiquetas e registra de onde veio a visita.\n\nSão cinco parâmetros:\n\n• **utm_source** — de onde vem o clique: instagram, newsletter, google.\n• **utm_medium** — o tipo de canal: social, email, cpc (anúncio pago), qrcode.\n• **utm_campaign** — o nome da ação: black-friday, lancamento-curso.\n• **utm_content** — diferencia peças da mesma campanha: banner-azul, video-depoimento.\n• **utm_term** — usado principalmente para a palavra-chave em anúncios de busca.\n\nOs três primeiros são essenciais; os outros dois, opcionais.",
      ],
      ["h2", "Um exemplo prático"],
      [
        "t",
        "Imagine uma loja de cosméticos que vai divulgar a mesma promoção no Instagram, numa lista de e-mails e num QR code impresso na sacola. Em vez de usar o mesmo endereço nos três lugares, ela cria três versões, cada uma terminando de um jeito:\n\n• Instagram: ?utm_source=instagram&utm_medium=social&utm_campaign=dia-das-maes\n• E-mail: ?utm_source=newsletter&utm_medium=email&utm_campaign=dia-das-maes\n• Sacola: ?utm_source=sacola&utm_medium=qrcode&utm_campaign=dia-das-maes\n\nNo fim da campanha, o relatório de aquisição mostra quantas visitas e vendas vieram de cada versão. Se o e-mail trouxe metade das vendas com um terço das visitas, a loja sabe onde vale caprichar na próxima vez.",
      ],
      [
        "i",
        "Equipe de marketing reunida em volta de um notebook revisando uma planilha de campanhas",
      ],
      ["h2", "Um padrão de nomes para a equipe inteira"],
      [
        "t",
        "O maior inimigo do UTM é a bagunça. Se uma pessoa escreve “Instagram”, outra “insta” e uma terceira “IG”, o relatório mostra três origens diferentes para o mesmo canal. Combine regras simples e deixe-as por escrito:\n\n• **Tudo em minúsculas**, sem acentos e sem espaços.\n• **Hífen para separar palavras**: dia-das-maes, nunca dia_das_maes ou DiaDasMaes.\n• **Lista fechada de origens e meios**: defina de uma vez quais valores existem (instagram, facebook, newsletter, whatsapp, google; social, email, cpc, qrcode) e não invente novos sem combinar.\n• **Campanha com período**: acrescente ano e mês quando a ação se repete, como black-friday-2026-11.\n• **Uma planilha central**: cada link criado entra numa linha com data, responsável, destino e o endereço completo.\n\nA planilha central também evita retrabalho: antes de criar um link novo, a equipe consulta se ele já existe.",
      ],
      ["h2", "Cuidados que evitam dados errados"],
      [
        "t",
        "Nunca use UTM em links internos do próprio site, como um banner da página inicial que leva para a categoria. Isso reinicia a origem da visita e apaga a informação verdadeira de onde o cliente veio.\n\nTeste cada link antes de publicar: clique, confira se a página abre corretamente e veja se a visita aparece no relatório em tempo real. E para links longos em materiais impressos, use um encurtador ou um QR code — ninguém vai digitar um endereço de três linhas.",
      ],
      [
        "t",
        "Para começar, escolha a próxima campanha e crie links marcados para cada canal em que ela vai aparecer. Monte a planilha de padrões junto com a equipe, nem que tenha só cinco linhas no início. Depois de algumas semanas, você vai responder com segurança a pergunta que antes ficava no chute: de onde estão vindo as suas vendas.",
      ],
    ],
    category: "dados",
    date: "2026-08-12",
    excerpt:
      "Com um pequeno complemento no final dos links você descobre qual canal realmente traz vendas. Veja como usar os parâmetros UTM e um padrão de nomes que a equipe toda consegue seguir.",
    slug: "parametros-utm-de-onde-vem-suas-vendas",
    title: "Parâmetros UTM: descubra de onde vêm as suas vendas",
  },
  {
    body: [
      [
        "t",
        "Pergunte a dez donos de pequenos negócios o que torna a empresa deles diferente e a maioria vai responder algo como “qualidade e bom atendimento”. O problema é que o concorrente da esquina diz exatamente a mesma coisa.\n\nPosicionamento de marca é a decisão sobre qual lugar você quer ocupar na cabeça do cliente. E um bom teste para saber se essa decisão está clara é conseguir resumi-la em uma única frase.",
      ],
      ["h2", "A fórmula da frase"],
      [
        "t",
        "Uma estrutura simples ajuda a organizar o raciocínio:\n\n**Para** [quem é o seu cliente], **a** [sua marca] **é** [o que você oferece] **que** [o benefício principal], **porque** [o motivo para acreditar].\n\nCada parte responde a uma pergunta:\n\n• **Para quem?** Um público específico, não “todo mundo”.\n• **O quê?** A categoria em que você compete, dita de forma que o cliente entenda.\n• **Que benefício?** O resultado que a pessoa ganha, não a característica técnica.\n• **Por que você?** Uma prova concreta: método, experiência, garantia, processo.\n\nA frase não precisa ser bonita. Ela é uma ferramenta interna, não um slogan. A comunicação vem depois, inspirada nela.",
      ],
      ["h2", "Três exemplos hipotéticos"],
      [
        "t",
        "**Uma padaria de bairro:** “Para famílias que tomam café da manhã em casa, a Padaria Trigal é a padaria que entrega pão quente na porta até as 7h, porque assa em três fornadas e tem entregadores próprios no bairro.”\n\n**Uma contadora autônoma:** “Para pequenos negócios de serviços que estão saindo do MEI, a Ana Contábil é o escritório que explica cada imposto em linguagem simples, porque atende só esse perfil de empresa e manda um resumo mensal em vídeo.”\n\n**Um estúdio de pilates:** “Para pessoas acima de 50 anos que querem voltar a se exercitar sem dor, o Estúdio Equilíbrio é o espaço de pilates em turmas de no máximo quatro alunos, porque cada aula é acompanhada por fisioterapeuta.”\n\nRepare que nenhuma das frases diz “qualidade”. Todas escolhem um público, prometem algo verificável e explicam por que a promessa é crível.",
      ],
      [
        "i",
        "Mesa de trabalho com cadernos, post-its e esboços de marca durante uma sessão de planejamento",
      ],
      ["h2", "Como testar se o posicionamento é bom"],
      [
        "t",
        "Depois de escrever a sua frase, passe por estas perguntas:\n\n• **Um concorrente poderia assinar a mesma frase?** Se sim, ela ainda está genérica.\n• **O cliente ideal se reconheceria nela?** Leia em voz alta para um cliente real e observe a reação.\n• **Você consegue cumprir a promessa todos os dias?** Posicionamento que a operação não sustenta vira reclamação.\n• **A frase exclui alguém?** Deveria. Escolher um público é, também, abrir mão de outros.\n\nO medo de excluir clientes é o que mais trava pequenos negócios. Na prática, falar com um grupo específico costuma atrair mais gente desse grupo, sem impedir que outros comprem.",
      ],
      ["h2", "Do papel para a comunicação"],
      [
        "t",
        "Com a frase definida, revise os pontos de contato: a bio das redes sociais, o título da página inicial do site, a mensagem de boas-vindas do WhatsApp e o texto dos anúncios. Cada um deve refletir pelo menos uma parte da frase — de preferência o público e o benefício.\n\nTambém vale compartilhar a frase com quem atende clientes. Quando a equipe sabe qual é a promessa, fica mais fácil decidir o que priorizar no dia a dia.",
      ],
      [
        "t",
        "Reserve uma hora esta semana para escrever três versões da sua frase de posicionamento, escolha a mais específica e teste com dois ou três clientes. Ajuste o que soar vago e só então leve para o site e as redes. Uma frase clara não resolve tudo, mas faz cada decisão de marketing ficar mais fácil.",
      ],
    ],
    category: "marca",
    date: "2026-09-30",
    excerpt:
      "Para quem, o quê e por que você: uma fórmula simples para resumir o posicionamento da sua marca em uma frase, com exemplos hipotéticos e perguntas para testar se ela está boa.",
    slug: "posicionamento-de-marca-em-uma-frase",
    title:
      "Posicionamento de marca em uma frase: para quem, o quê e por que você",
  },
  {
    body: [
      [
        "t",
        "Você investe em anúncios, o cliente clica, chega à página do produto e… vai embora. Muitas vezes o problema não está no preço nem no tráfego, e sim na própria página: falta uma informação, a foto não mostra o que importa ou o frete só aparece no último passo.\n\nUse este checklist para revisar cada página de produto da sua loja. Ele vale tanto para lojas virtuais completas quanto para catálogos simples que fecham a venda pelo WhatsApp.",
      ],
      ["h2", "Fotos que respondem perguntas"],
      [
        "t",
        "Na loja física, o cliente pega o produto na mão. Na internet, as fotos fazem esse papel. Confira se a sua página tem:\n\n• **Foto principal com fundo limpo**, mostrando o produto inteiro.\n• **Detalhes de perto**: textura, acabamento, etiqueta, costura, embalagem.\n• **Foto em uso**, com uma pessoa ou num ambiente real, para dar noção de tamanho.\n• **Todas as variações**: se existem cinco cores, mostre as cinco.\n• **Imagens leves**, que carregam rápido no celular.\n\nUm bom exercício é listar as dúvidas que os clientes mandam por mensagem e ver quais delas uma foto poderia responder.",
      ],
      ["h2", "Descrição que vende (e informa)"],
      [
        "t",
        "Comece pelo benefício e depois traga os detalhes técnicos. Em vez de “garrafa térmica de aço inox 500 ml”, experimente “mantém o café quente por toda a manhã de trabalho” e, logo abaixo, a ficha com material, capacidade e medidas.\n\nItens que não podem faltar:\n\n• Medidas e peso, de preferência com uma referência comparativa.\n• Material e cuidados de uso ou lavagem.\n• O que vem na caixa.\n• Para quem o produto é indicado — e para quem não é.\n\nTextos copiados do fornecedor são comuns, mas deixam a página igual à de todos os concorrentes. Reescreva com as suas palavras.",
      ],
      [
        "i",
        "Mesa com produtos, câmera e iluminação simples preparados para uma sessão de fotos de e-commerce",
      ],
      ["h2", "Preço, frete e prazo sem surpresas"],
      [
        "t",
        "A surpresa no frete é um dos motivos mais frequentes para o abandono da compra. Por isso:\n\n• Coloque um **calculador de frete na própria página do produto**, não só no carrinho.\n• Mostre o **prazo de entrega** junto com o valor.\n• Deixe claras as **formas de pagamento** e o parcelamento disponível.\n• Se existe frete grátis a partir de certo valor, avise logo perto do preço.\n\nQuanto mais cedo o cliente souber o custo total, menor a chance de desistir no último clique.",
      ],
      ["h2", "Prova social e respostas às dúvidas"],
      [
        "t",
        "Avaliações de outros compradores pesam muito na decisão. Peça uma avaliação alguns dias depois da entrega e publique também as notas medianas — uma página só com cinco estrelas parece pouco confiável. Fotos enviadas por clientes valem ainda mais.\n\nPor fim, inclua uma pequena seção de perguntas frequentes com as três ou quatro dúvidas que mais chegam pelo atendimento: troca, garantia, tamanho, compatibilidade. Cada dúvida respondida na página é uma mensagem a menos e uma venda a mais com chance de acontecer sem atrito.\n\nNão esqueça de um botão de compra visível sem precisar rolar a tela no celular e de um canal de contato fácil para quem ainda tiver dúvida.",
      ],
      [
        "t",
        "Escolha os cinco produtos que mais recebem visitas e passe o checklist em cada um deles, anotando o que falta. Corrija primeiro o que é rápido — frete visível, descrição reescrita, perguntas frequentes — e depois invista nas fotos. Acompanhe a taxa de conversão dessas páginas por algumas semanas para ver o efeito das mudanças.",
      ],
    ],
    category: "vendas-online",
    date: "2026-10-02",
    excerpt:
      "Fotos, descrição, frete, avaliações e perguntas frequentes: um checklist prático para revisar as páginas de produto da sua loja e tirar os obstáculos entre o clique e a compra.",
    slug: "checklist-pagina-de-produto-que-converte",
    title: "Checklist da página de produto que converte",
  },
  {
    body: [
      [
        "t",
        "Todo lojista virtual conhece a cena: o cliente escolhe o produto, coloca no carrinho, começa a preencher os dados e some. Carrinho abandonado faz parte do comércio online, e não dá para zerar. Mas dá para recuperar uma parte dessas vendas com lembretes bem feitos — sem transformar a loja numa liquidação permanente.",
      ],
      ["h2", "Por que as pessoas abandonam o carrinho"],
      [
        "t",
        "Antes de mandar qualquer mensagem, vale entender os motivos mais comuns:\n\n• O frete ou o prazo apareceram só no final e assustaram.\n• O cliente estava só pesquisando e comparando preços.\n• O cadastro era longo ou pediu dados demais.\n• A forma de pagamento preferida não estava disponível.\n• Faltou confiança: poucas avaliações, nenhuma política de troca visível.\n• Simplesmente foi interrompido — o ônibus chegou, o filho chamou.\n\nAlguns desses motivos se resolvem na própria loja, antes de qualquer lembrete. Mostrar o frete na página do produto e permitir compra sem cadastro completo costumam reduzir o abandono logo de saída.",
      ],
      ["h2", "Uma sequência simples de lembretes"],
      [
        "t",
        "A maioria das plataformas de loja virtual permite enviar e-mails automáticos para quem deixou o carrinho com o contato preenchido. Uma sequência enxuta funciona bem:\n\n• **Primeira mensagem, uma a três horas depois:** um lembrete gentil, com a foto do produto e um botão para voltar ao carrinho. Sem desconto. Muita gente só esqueceu.\n• **Segunda mensagem, no dia seguinte:** responda às objeções. Reforce a política de troca, o prazo de entrega, as avaliações e as formas de pagamento.\n• **Terceira mensagem, dois ou três dias depois:** a última chamada. Aqui, se fizer sentido para a sua margem, entra um incentivo.\n\nSe o cliente autorizou contato por WhatsApp, uma mensagem curta e pessoal pode funcionar melhor que o e-mail — mas use com moderação para não soar invasivo.",
      ],
      [
        "i",
        "Pessoa segurando um celular com uma loja virtual aberta na tela, ao lado de um notebook",
      ],
      ["h2", "Quando oferecer (e quando não oferecer) desconto"],
      [
        "t",
        "O desconto é a ferramenta mais tentadora e a mais perigosa. Se todo carrinho abandonado recebe 10% de desconto, os clientes aprendem rápido: basta abandonar para pagar menos. E você passa a dar desconto para quem compraria de qualquer jeito.\n\nAlgumas regras práticas:\n\n• **Não ofereça desconto na primeira mensagem.** Dê ao cliente a chance de voltar pelo preço cheio.\n• **Prefira incentivos que custam menos que desconto:** frete grátis, um brinde pequeno, parcelamento maior.\n• **Defina um limite de margem.** Imagine um produto de R$ 120 com lucro de R$ 30: um cupom de 20% elimina quase todo o ganho.\n• **Evite cupom para o mesmo cliente repetidamente.** Se a pessoa já abandonou e recebeu oferta no mês anterior, mande só o lembrete.",
      ],
      ["h2", "Como medir se está funcionando"],
      [
        "t",
        "Acompanhe três números todo mês: quantos carrinhos foram abandonados, quantos receberam mensagem e quantos foram recuperados. Compare também o valor recuperado com o que foi gasto em descontos e brindes.\n\nTeste uma mudança de cada vez — o horário da primeira mensagem, o assunto do e-mail, o tipo de incentivo — e observe por algumas semanas antes de concluir qualquer coisa.",
      ],
      [
        "t",
        "Comece ativando a recuperação automática na sua plataforma com duas mensagens sem desconto. Revise a página de checkout com olhar de cliente: frete visível, poucos campos, formas de pagamento claras. Só depois de um mês de dados decida se vale incluir uma terceira mensagem com incentivo — e qual incentivo cabe na sua margem.",
      ],
    ],
    category: "vendas-online",
    date: "2026-07-29",
    excerpt:
      "Lembretes bem planejados recuperam parte das vendas perdidas no carrinho. Veja uma sequência simples de mensagens e quando o desconto ajuda ou apenas ensina o cliente a esperar.",
    slug: "como-recuperar-carrinhos-abandonados",
    title:
      "Carrinho abandonado: como recuperar vendas sem viciar o cliente em desconto",
  },
  {
    body: [
      [
        "t",
        "Vídeos curtos dominam as redes sociais, mas muita gente trava na hora de gravar: começa falando “oi, pessoal, tudo bem?”, enrola, perde o fio e termina sem pedir nada ao espectador. O resultado é um vídeo que ninguém assiste até o fim.\n\nUm roteiro simples em quatro partes resolve a maior parte desses problemas. Ele serve para vídeos de 30 a 90 segundos e funciona para qualquer tipo de negócio.",
      ],
      ["h2", "1. Gancho: os primeiros três segundos"],
      [
        "t",
        "O gancho tem uma única função: fazer a pessoa parar de rolar a tela. Ele precisa ser direto e despertar curiosidade ou identificação. Alguns formatos que funcionam:\n\n• **Uma pergunta incômoda:** “Você também perde clientes no WhatsApp sem perceber?”\n• **Um erro comum:** “Pare de fazer isso na sua vitrine.”\n• **Uma promessa específica:** “Três frases para responder quem diz que está caro.”\n• **Um resultado visual:** mostrar o antes e depois logo na abertura.\n\nEvite apresentações longas. Seu nome e sua marca podem aparecer na legenda ou no fim.",
      ],
      ["h2", "2. Contexto: por que isso importa"],
      [
        "t",
        "Em uma ou duas frases, explique o problema ou a situação. É aqui que o espectador decide se o vídeo é para ele. Seja concreto: em vez de “muitas empresas têm dificuldade com atendimento”, diga “quando a resposta demora mais de uma hora, o cliente já está conversando com outra loja”.\n\nO contexto não deve passar de 10 a 15 segundos. Se você precisa de mais tempo para explicar, talvez o tema caiba melhor em dois vídeos.",
      ],
      [
        "i",
        "Celular apoiado em um tripé de mesa gravando um vídeo em um escritório iluminado",
      ],
      ["h2", "3. Entrega: o conteúdo de verdade"],
      [
        "t",
        "Esta é a parte que cumpre a promessa do gancho. Entregue algo que a pessoa possa aplicar: um passo a passo, uma dica, uma demonstração. Regras que ajudam:\n\n• **Uma ideia por vídeo.** Três dicas rasas valem menos que uma bem explicada.\n• **Mostre em vez de só falar.** Tela do celular, produto na mão, o antes e depois.\n• **Corte as pausas.** Edições rápidas mantêm o ritmo.\n• **Legende tudo.** Boa parte das pessoas assiste sem som.",
      ],
      ["h2", "4. Chamada: o próximo passo"],
      [
        "t",
        "Termine dizendo claramente o que o espectador deve fazer: salvar o vídeo, comentar uma palavra, mandar mensagem, acessar o site pela bio. Escolha **uma** chamada só — pedir tudo ao mesmo tempo dilui a resposta.\n\nA chamada funciona melhor quando conversa com a entrega. Se você ensinou três frases para responder objeções, faz sentido dizer: “Salve este vídeo para consultar na próxima vez que um cliente reclamar do preço.”",
      ],
      ["h2", "Exemplo completo"],
      [
        "t",
        "Imagine uma floricultura gravando um vídeo de 40 segundos:\n\n• **Gancho (3 s):** “Seu buquê murcha em dois dias? O problema pode ser a água.”\n• **Contexto (8 s):** “A maioria das pessoas só coloca as flores no vaso e esquece. Em um dia quente, a água fica turva e as hastes param de absorver.”\n• **Entrega (22 s):** mostrar, com as mãos, o corte das hastes em diagonal, a retirada das folhas que ficam submersas e a troca da água a cada dois dias.\n• **Chamada (7 s):** “Salve este vídeo e, se quiser um buquê que dure, chame a gente no link da bio.”\n\nO roteiro cabe em meia página e pode ser gravado em poucas tentativas.",
      ],
      [
        "t",
        "Antes da próxima gravação, escreva as quatro partes num bloco de notas, mesmo que em tópicos. Leia em voz alta cronometrando e corte o que passar do tempo. Grave, publique e observe em que momento as pessoas param de assistir: se é nos primeiros segundos, o gancho precisa melhorar; se é no meio, a entrega está longa demais.",
      ],
    ],
    category: "video",
    date: "2026-09-09",
    excerpt:
      "Gancho, contexto, entrega e chamada: um roteiro em quatro partes para gravar vídeos curtos que prendem a atenção do começo ao fim, com um exemplo completo para adaptar ao seu negócio.",
    slug: "roteiro-de-video-curto-em-4-partes",
    title:
      "Roteiro de vídeo curto em 4 partes: gancho, contexto, entrega e chamada",
  },
  {
    body: [
      [
        "t",
        "Pense na última vez em que você clicou num site e ele demorou a abrir. Provavelmente você voltou e escolheu outro resultado. Seus clientes fazem o mesmo. Um site lento perde visitas antes mesmo de mostrar o que você vende, e isso acontece principalmente no celular, com internet móvel instável.\n\nA boa notícia é que boa parte da lentidão vem de poucas causas, e várias delas têm solução sem precisar de um programador.",
      ],
      ["h2", "Por que a velocidade importa"],
      [
        "t",
        "Velocidade afeta três coisas ao mesmo tempo:\n\n• **Experiência:** cada segundo de espera aumenta a chance de a pessoa desistir.\n• **Conversão:** formulários e páginas de compra lentas geram abandono.\n• **Busca:** os mecanismos de busca consideram a experiência da página, incluindo o tempo de carregamento, ao organizar os resultados.\n\nPara medir, use ferramentas gratuitas de teste de velocidade, como o PageSpeed Insights. Teste a página inicial e as páginas que mais recebem visitas, sempre na versão para celular, e anote o resultado antes de mudar qualquer coisa.",
      ],
      ["h2", "Imagens: o vilão mais comum"],
      [
        "t",
        "Fotos tiradas com o celular ou baixadas de bancos de imagem costumam ter vários megabytes. Colocadas direto no site, deixam qualquer página pesada.\n\n• **Redimensione antes de enviar.** Uma foto que aparece com 1.200 pixels de largura não precisa ter 4.000.\n• **Comprima.** Ferramentas gratuitas reduzem o tamanho do arquivo sem perda visível de qualidade.\n• **Prefira formatos modernos**, como WebP, quando a sua plataforma aceitar.\n• **Use carregamento sob demanda** para imagens que ficam mais abaixo na página.\n\nImagine uma página inicial com dez fotos de 3 MB cada: são 30 MB para o visitante baixar. Com as imagens ajustadas, o total pode cair para menos de 2 MB.",
      ],
      [
        "i",
        "Tela de notebook exibindo um painel de desempenho de site com gráficos de carregamento",
      ],
      ["h2", "Hospedagem: a base de tudo"],
      [
        "t",
        "Não adianta otimizar imagens se o servidor demora para responder. Hospedagens muito baratas costumam colocar centenas de sites dividindo os mesmos recursos, e nos horários de pico todos ficam lentos.\n\nSinais de que a hospedagem pode ser o problema: o site demora a começar a carregar mesmo em páginas simples, fica fora do ar com frequência ou oscila muito ao longo do dia. Ao avaliar um plano, verifique se ele oferece cache, certificado de segurança, servidores próximos do seu público e suporte que responde rápido.",
      ],
      ["h2", "Plugins e scripts em excesso"],
      [
        "t",
        "Cada plugin instalado, cada pixel de rastreamento, cada widget de chat e cada fonte diferente adiciona arquivos que o navegador precisa baixar. Com o tempo, o site acumula ferramentas que ninguém usa mais.\n\nFaça uma faxina periódica:\n\n• Liste todos os plugins e scripts ativos e pergunte, um por um, se ainda são necessários.\n• Remova códigos de rastreamento de campanhas antigas.\n• Limite as fontes a uma ou duas famílias.\n• Evite carrosséis pesados e vídeos que tocam sozinhos no topo da página.\n\nDepois de cada remoção, teste se tudo continua funcionando.",
      ],
      [
        "t",
        "Comece medindo as cinco páginas mais visitadas do seu site no celular. Ajuste as imagens primeiro, porque é o que dá mais resultado com menos esforço. Em seguida, faça a faxina de plugins e scripts e, se a lentidão continuar, avalie a hospedagem. Repita o teste a cada poucos meses: sites tendem a ficar pesados aos poucos, sem ninguém perceber.",
      ],
    ],
    category: "sites",
    date: "2026-08-05",
    excerpt:
      "Um site lento perde clientes antes de mostrar o que vende. Entenda por que a velocidade importa e veja ajustes simples em imagens, hospedagem e excesso de plugins e scripts.",
    slug: "site-lento-ajustes-simples-de-velocidade",
    title: "Site lento perde clientes: ajustes simples para ganhar velocidade",
  },
  {
    body: [
      [
        "t",
        "Ferramentas de inteligência artificial que escrevem textos, sugerem ideias e criam imagens viraram parte da rotina de muitos profissionais de marketing. Para pequenos negócios, a promessa é tentadora: produzir mais com menos tempo.\n\nO risco é que todo mundo passe a soar igual. Textos genéricos, cheios das mesmas expressões, não constroem marca nenhuma. A questão não é se usar IA, e sim como usar sem perder aquilo que faz o cliente reconhecer a sua voz.",
      ],
      ["h2", "Onde a IA ajuda de verdade"],
      [
        "t",
        "A inteligência artificial é ótima em tarefas que tomam tempo, mas não exigem a sua opinião:\n\n• **Gerar ideias de pauta** a partir das dúvidas que seus clientes fazem.\n• **Criar variações** de título, assunto de e-mail ou chamada de anúncio para testar.\n• **Resumir** reuniões, pesquisas e avaliações de clientes.\n• **Adaptar formatos:** transformar um artigo em roteiro de vídeo ou numa sequência de posts.\n• **Revisar** ortografia, clareza e tamanho de frases.\n\nNesses casos, a IA funciona como um assistente que entrega um primeiro rascunho. O trabalho final continua sendo seu.",
      ],
      ["h2", "Crie um guia de voz da marca"],
      [
        "t",
        "Para a IA escrever de um jeito parecido com o seu, ela precisa saber qual é esse jeito. Monte um documento curto com:\n\n• **Como você fala com o cliente:** “você” ou “o senhor”, frases curtas ou mais explicativas, uso de humor ou não.\n• **Palavras que você usa e palavras que evita.** Uma clínica pode preferir “paciente” a “cliente”; uma loja de roupas pode evitar termos técnicos de moda.\n• **Três ou quatro textos seus** que você considera bons exemplos.\n• **O posicionamento da marca** em uma frase.\n\nCole esse guia no início de cada pedido à ferramenta. A diferença no resultado é grande.",
      ],
      [
        "i",
        "Profissional de marketing escrevendo em um notebook com anotações e uma xícara de café ao lado",
      ],
      ["h2", "Onde a revisão humana é obrigatória"],
      [
        "t",
        "Algumas partes do trabalho não devem sair da ferramenta direto para o público:\n\n• **Dados e afirmações:** a IA pode inventar números, datas e fontes com total confiança. Confira tudo.\n• **Promessas e condições comerciais:** preço, prazo, garantia e regras de promoção precisam bater com o que você realmente oferece.\n• **Temas sensíveis:** saúde, finanças, questões jurídicas e reclamações de clientes pedem cuidado e responsabilidade.\n• **Opinião e experiência:** o que você viu na prática, os casos que atendeu, os erros que cometeu. É isso que diferencia o seu conteúdo e nenhuma ferramenta tem acesso.\n\nUma boa regra: se você não assinaria o texto com o seu nome, ele não está pronto.",
      ],
      ["h2", "Um fluxo de trabalho simples"],
      [
        "t",
        "Imagine uma pequena agência que publica três posts por semana. Um fluxo possível:\n\n• A equipe define o tema e o ponto de vista em duas ou três frases.\n• A IA, com o guia de voz, gera um rascunho e algumas opções de título.\n• Uma pessoa reescreve trechos, acrescenta exemplos reais e corta o que soa genérico.\n• Outra pessoa revisa dados, promessas e tom antes de publicar.\n\nO tempo economizado fica no rascunho e na pesquisa. A parte criativa e a responsabilidade continuam com a equipe.",
      ],
      [
        "t",
        "Para começar, escreva o guia de voz da sua marca esta semana, mesmo que tenha só uma página. Escolha uma tarefa repetitiva, como criar variações de títulos, e teste a IA nela por um mês. Revise tudo antes de publicar e ajuste o guia sempre que um texto sair diferente do que você diria. A ferramenta acelera o trabalho; a voz continua sendo sua.",
      ],
    ],
    category: "ferramentas",
    date: "2026-10-10",
    excerpt:
      "A inteligência artificial pode acelerar ideias, rascunhos e revisões, mas não substitui o seu jeito de falar com o cliente. Veja onde ela ajuda e onde a revisão humana é indispensável.",
    slug: "ia-no-marketing-sem-perder-a-voz-da-marca",
    title: "Inteligência artificial no marketing sem perder a voz da marca",
  },
];
