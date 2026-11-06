/** Textos legais do template, convertidos das páginas do WordPress original com o nome da marca, o domínio e o e-mail parametrizados. Revise com um advogado antes de publicar. */
export type LegalItem = ["h" | "li" | "p", string];

export interface LegalBrand {
  domain: string;
  email: string;
  name: string;
}

export const termos = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Seja Bem-Vindo ao site da ${b.name}. Antes de explorar tudo o que temos a oferecer, é importante que você entenda e concorde com algumas regras básicas que regem o uso do nosso site ${b.domain}, e qualquer outro serviço digital que nós oferecemos, como lojas e plataformas de e-commerce.`,
  ],
  [
    "p",
    "Ao usar nosso site e serviços, você automaticamente concorda em seguir as regras que estabelecemos aqui. Caso não concorde com algo, por favor, considere não usar nossos serviços. É muito importante para nós que você se sinta seguro e informado a todo momento.",
  ],
  ["h", "1. Aceitando os Termos"],
  [
    "p",
    `Ao navegar e usar o site da ${b.name}, você concorda automaticamente com nossas regras e condições. Estamos sempre procurando melhorar, então esses termos podem mudar de vez em quando. Se fizermos alterações significativas, vamos postar as atualizações aqui no site. Continuar usando o site após essas mudanças significa que você aceita os novos termos.`,
  ],
  ["h", "2. Como Usar o Nosso Site"],
  [
    "p",
    "A maior parte do nosso site está aberta para você sem a necessidade de cadastro. No entanto, algumas seções especiais podem exigir que você crie uma conta. Pedimos que você seja honesto ao fornecer suas informações e que mantenha sua senha e login seguros. Se decidir compartilhar algum conteúdo conosco, como comentários, por favor, faça-o de maneira respeitosa e dentro da lei.",
  ],
  ["h", "3. Sua Privacidade"],
  [
    "p",
    `Na ${b.name}, a privacidade é um valor essencial. Ao interagir com nosso site, você aceita nossa Política de Privacidade, que detalha nossa abordagem responsável e conforme às leis para o manejo dos seus dados pessoais. Nosso compromisso é com a transparência e a segurança: explicamos como coletamos, usamos e protegemos suas informações, garantindo sua privacidade e oferecendo controle sobre seus dados.`,
  ],
  [
    "p",
    "Adotamos práticas de segurança para proteger suas informações contra acesso não autorizado e compartilhamento indevido, assegurando que qualquer cooperação com terceiros ocorra apenas com base na sua aprovação ou exigências legais claras, reafirmando nosso comprometimento com a sua confiança e segurança digital.",
  ],
  ["h", "4. Direitos de Conteúdo"],
  [
    "p",
    `O conteúdo disponível no site da ${b.name}, incluindo, mas não se limitando a, textos, imagens, ilustrações, designs, ícones, fotografias, programas de computador, videoclipes e áudios, constitui propriedade intelectual protegida tanto pela legislação nacional quanto por tratados internacionais sobre direitos autorais e propriedade industrial. Essa propriedade engloba não apenas materiais diretamente produzidos e publicados por nós, mas também conteúdos que são utilizados sob licença ou permissão de terceiros, garantindo que todos os direitos sejam respeitados conforme as normativas vigentes.`,
  ],
  [
    "p",
    `Ao acessar nosso site, você recebe uma licença limitada, não exclusiva e revogável para visualizar e usar o conteúdo para fins pessoais e não comerciais. Isso implica que qualquer reprodução, distribuição, transmissão ou modificação do conteúdo, sem a devida autorização escrita da ${b.name}, é estritamente proibida. Tal restrição visa proteger os direitos de propriedade intelectual associados aos materiais disponibilizados, assegurando que sua utilização não infrinja os direitos dos criadores ou detentores desses direitos, além de promover um ambiente de respeito e valorização da criatividade e inovação.`,
  ],
  ["h", "5. Cookies e Mais"],
  [
    "p",
    "Utilizamos cookies para melhorar sua experiência, coletando informações anônimas durante sua visita, como suas preferências de idioma, duração da visita, páginas acessadas, e outras estatísticas de uso. Esses dados nos ajudam a personalizar seu conteúdo, otimizar a navegação, melhorar continuamente o site em design e funcionalidade, e garantir sua segurança online. Esta prática é essencial para nos permitir oferecer um serviço mais ajustado às suas necessidades e resolver qualquer problema que possa surgir mais rapidamente.",
  ],
  [
    "p",
    "Se você preferir limitar ou recusar o uso de cookies, a configuração pode ser ajustada através do seu navegador. Isso pode afetar a sua experiência no site, pois algumas funcionalidades dependem dos cookies para funcionar corretamente. Entendemos a importância do controle sobre suas informações e queremos que você saiba que, ao ajustar as configurações para bloquear cookies, algumas partes do nosso site podem não oferecer a experiência completa pretendida.",
  ],
  ["h", "6. Explorando Links Externos"],
  [
    "p",
    "Nosso site pode incluir links para sites externos que achamos que podem ser do seu interesse. Note que não temos controle sobre esses sites externos e, portanto, não somos responsáveis pelo seu conteúdo ou políticas.",
  ],
  ["h", "7. Mudanças e Atualizações"],
  [
    "p",
    "A evolução é parte de como operamos, o que significa que estes Termos de Uso podem passar por atualizações para refletir melhor as mudanças em nossos serviços ou na legislação. Sempre que isso acontecer, você encontrará a versão mais recente disponível aqui. Se as mudanças forem significativas, faremos o possível para notificá-lo através dos meios de contato que você nos forneceu.",
  ],
  [
    "p",
    "Continuar a acessar o site após essas mudanças indica que você concorda com os novos termos. Se, por qualquer motivo, você não concordar com as atualizações, pedimos que não continue utilizando nosso site e serviços.",
  ],
  ["h", "8. Limitação de Responsabilidade"],
  [
    "p",
    `A ${b.name} se esforça para fornecer informações precisas, atualizadas e de qualidade. No entanto, não garantimos que todo o conteúdo esteja livre de erros, interrupções ou que seja aplicável a todas as situações individuais. As informações presentes no site têm caráter exclusivamente informativo e não substituem orientações profissionais.`,
  ],
  [
    "p",
    `Ao utilizar o site, você concorda que a ${b.name}, seus proprietários, colaboradores e parceiros não poderão ser responsabilizados por quaisquer danos diretos, indiretos, incidentais, consequenciais ou punitivos decorrentes do uso ou da incapacidade de usar nosso site e seus conteúdos.`,
  ],
  ["h", "9. Conteúdo Gerado por Usuários"],
  [
    "p",
    `Ao enviar comentários, depoimentos ou qualquer outro conteúdo ao site da ${b.name}, você declara ser o autor legítimo do material enviado e nos concede uma licença gratuita, irrevogável e sem restrições territoriais para utilizar, reproduzir e divulgar esse conteúdo em nossas plataformas, sempre respeitando a sua autoria.`,
  ],
  ["h", "Dúvidas ou Comentários?"],
  [
    "p",
    `Se tiver dúvidas sobre estes termos, não hesite em nos contatar através do e-mail *${b.email}*.`,
  ],
  ["p", "Última atualização: 09 de setembro de 2026"],
];

export const privacidade = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Bem-vindo à ${b.name}! Nosso compromisso é com a integridade e a segurança dos dados pessoais dos nossos usuários e clientes. Esta Política de Privacidade aplica-se a todas as interações digitais realizadas em nosso site ${b.domain}, serviços associados, aplicativos móveis e outras plataformas digitais sob nosso controle.`,
  ],
  [
    "p",
    "Ao acessar e utilizar nossas plataformas, você reconhece e concorda com as práticas descritas nesta política. Nós tratamos a proteção de seus dados pessoais com a máxima seriedade e nos comprometemos a processá-los de forma responsável, transparente e segura.",
  ],
  ["h", "Definições"],
  [
    "li",
    "“Dados Pessoais” são informações que identificam ou podem identificar uma pessoa natural.",
  ],
  [
    "li",
    "“Dados Pessoais Sensíveis” são informações que revelam características pessoais íntimas, como origem racial, convicções religiosas, opiniões políticas, dados genéticos ou biométricos.",
  ],
  [
    "li",
    "“Tratamento de Dados Pessoais” abrange qualquer operação com Dados Pessoais, como coleta, registro, armazenamento, uso, compartilhamento ou destruição.",
  ],
  [
    "li",
    "“Leis de Proteção de Dados” são todas as leis que regulamentam o Tratamento de Dados Pessoais, incluindo a LGPD (Lei Geral de Proteção de Dados Pessoais, Lei nº 13.709/18).",
  ],
  ["h", "Dados Coletados e Motivos da Coleta"],
  ["p", "Nós coletamos e processamos os seguintes tipos de dados pessoais:"],
  [
    "li",
    "Informações Fornecidas por Você: Isso inclui, mas não se limita a, nome, sobrenome, endereço de e-mail, endereço físico, informações de pagamento e quaisquer outras informações que você optar por fornecer ao criar uma conta, fazer uma compra ou interagir com nossos serviços de atendimento ao cliente.",
  ],
  [
    "li",
    "Informações Coletadas Automaticamente: Quando você visita nosso site, coletamos automaticamente informações sobre seu dispositivo e sua interação com nosso site. Isso pode incluir dados como seu endereço IP, tipo de navegador, detalhes do dispositivo, fuso horário, páginas visitadas, produtos visualizados, sites ou termos de busca que o direcionaram ao nosso site, e informações sobre como você interage com nosso site.",
  ],
  ["h", "Uso de Cookies e Tecnologias de Rastreamento"],
  [
    "p",
    `A ${b.name} utiliza cookies, que são pequenos arquivos de texto armazenados no seu dispositivo, e outras tecnologias de rastreamento para melhorar a experiência do usuário em nosso site ${b.domain}, entender como nossos serviços são utilizados e otimizar nossas estratégias de marketing.`,
  ],
  ["h", "Tipos de Cookies Utilizados:"],
  [
    "li",
    "Cookies Essenciais: Essenciais para o funcionamento do site, permitindo que você navegue e use suas funcionalidades. Sem esses cookies, serviços como carrinho de compras e processamento de pagamento não podem ser fornecidos.",
  ],
  [
    "li",
    "Cookies de Desempenho e Analíticos: Coletam informações sobre como os visitantes usam o nosso site, quais páginas são visitadas com mais frequência e se eles recebem mensagens de erro. Esses cookies são usados apenas para melhorar o desempenho e a experiência do usuário no site.",
  ],
  [
    "li",
    "Cookies de Funcionalidade: Permitem que o site lembre de escolhas que você faz (como seu nome de usuário, idioma ou a região em que você está) e forneça recursos aprimorados e mais pessoais.",
  ],
  [
    "li",
    "Cookies de Publicidade e Redes Sociais: Usados para oferecer anúncios mais relevantes para você e seus interesses. Eles também são usados para limitar o número de vezes que você vê um anúncio, bem como ajudar a medir a eficácia das campanhas publicitárias.",
  ],
  ["h", "Finalidades do Processamento de Dados"],
  ["p", "Os dados coletados são utilizados para:"],
  ["li", "Proporcionar, operar e melhorar nossos serviços e ofertas;"],
  [
    "li",
    "Processar suas transações e enviar notificações relacionadas a suas compras;",
  ],
  [
    "li",
    "Personalizar sua experiência de usuário e recomendar conteúdo ou produtos que possam ser do seu interesse;",
  ],
  [
    "li",
    "Comunicar informações importantes, ofertas e promoções, conforme sua preferência de comunicação;",
  ],
  [
    "li",
    "Realizar análises internas para desenvolver e aprimorar nossos serviços;",
  ],
  ["li", "Cumprir obrigações legais e regulatórias aplicáveis."],
  ["h", "Compartilhamento e Transferência de Dados Pessoais"],
  [
    "p",
    "Nós podemos compartilhar seus dados pessoais com terceiros nas seguintes circunstâncias:",
  ],
  [
    "li",
    "Com fornecedores de serviços e parceiros que nos auxiliam nas operações de negócio, desde que estes atuem em conformidade com nossas diretrizes de proteção de dados e com a legislação aplicável;",
  ],
  [
    "li",
    "Para cumprir com obrigações legais, responder a processos judiciais, ou proteger nossos direitos e propriedades, bem como a segurança de nossos clientes e do público;",
  ],
  [
    "li",
    "Em caso de reestruturação corporativa, venda, fusão ou outra transferência de ativos, garantindo que a entidade receptora concorde em respeitar a privacidade de seus dados de acordo com uma política equivalente à nossa.",
  ],
  ["h", "Links para outros sites e redes sociais"],
  [
    "p",
    "Nossa plataforma pode incluir links para sites externos de parceiros, anunciantes e fornecedores. Clicar nesses links implica que você será direcionado para fora do nosso site, entrando em domínios que seguem suas próprias políticas de privacidade, pelas quais não somos responsáveis.",
  ],
  [
    "p",
    "Recomendamos a leitura atenta dessas políticas antes de fornecer qualquer dado pessoal. Da mesma forma, não assumimos responsabilidade pelas práticas de privacidade de terceiros como Facebook, Apple, Google e Microsoft. Aconselhamos você a se informar sobre as políticas de privacidade dessas entidades ao utilizar seus serviços ou aplicativos.",
  ],
  ["h", "Direitos dos Titulares dos Dados"],
  [
    "p",
    "Você possui diversos direitos em relação aos seus dados pessoais, incluindo:",
  ],
  [
    "li",
    "O direito de acesso, retificação ou exclusão de seus dados pessoais sob nossa posse;",
  ],
  [
    "li",
    "O direito de limitar ou se opor ao nosso processamento de seus dados;",
  ],
  ["li", "O direito à portabilidade de dados;"],
  [
    "li",
    "O direito de retirar seu consentimento a qualquer momento, quando o processamento for baseado em consentimento.",
  ],
  [
    "p",
    `Para exercer esses direitos, entre em contato conosco através de *${b.email}*.`,
  ],
  ["h", "Segurança dos Dados"],
  [
    "p",
    "Implementamos medidas de segurança técnica e organizacional para proteger seus dados pessoais contra acesso não autorizado, alteração, divulgação ou destruição. No entanto, é importante notar que nenhum sistema é completamente seguro. Nos comprometemos a notificar você e qualquer autoridade aplicável de quaisquer brechas de segurança de acordo com a legislação vigente.",
  ],
  ["h", "Alterações na Política de Privacidade"],
  [
    "p",
    "Nossa Política de Privacidade pode ser atualizada periodicamente. A versão mais atual será sempre publicada em nosso site, indicando a data da última revisão. Encorajamos você a revisar regularmente nossa política para estar sempre informado sobre como estamos protegendo seus dados.",
  ],
  ["h", "Contato"],
  [
    "p",
    `Se tiver dúvidas ou preocupações sobre nossa Política de Privacidade ou práticas de dados, por favor, não hesite em nos contatar em *${b.email}*. Estamos comprometidos em resolver quaisquer questões relacionadas à privacidade de nossos usuários e clientes.`,
  ],
];
