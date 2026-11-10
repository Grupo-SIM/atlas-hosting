/**
 * Textos legais do Seguidores em Alta (Política de Privacidade e Termos de Uso), como estão no site original.
 * Nome, e-mail e domínio vêm da marca (`brand.ts`): trocar a marca troca os textos.
 * Formato: "h" = título de seção, "p" = parágrafo, "li" = item de lista.
 */
export interface LegalBrand {
  domain: string;
  email: string;
  name: string;
}

export type LegalItem = [kind: "h" | "p" | "li", text: string];

export const privacidade = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Bem-vindo a ${b.name}! Nosso compromisso é proteger a integridade e a segurança dos dados pessoais de nossos usuários e leitores.`,
  ],
  [
    "p",
    `Esta Política de Privacidade aplica-se a todas as interações realizadas em nosso site ${b.domain}, bem como em quaisquer serviços, páginas, formulários ou plataformas digitais sob nosso controle.`,
  ],
  [
    "p",
    "Ao utilizar nossas plataformas, você concorda com as práticas descritas aqui. Tratamos seus dados pessoais de forma responsável, transparente e sempre visando sua proteção.",
  ],
  ["h", "1. Definições"],
  [
    "li",
    "Dados Pessoais: Informações que identificam ou podem identificar uma pessoa natural.",
  ],
  [
    "li",
    "Dados Pessoais Sensíveis: Informações sobre origem racial, crenças, opiniões políticas, dados biométricos etc.",
  ],
  [
    "li",
    "Tratamento: Qualquer operação com dados pessoais, como coleta, armazenamento, uso, compartilhamento ou exclusão.",
  ],
  [
    "li",
    "Leis de Proteção de Dados: Conjunto de normas aplicáveis, incluindo a LGPD (Lei nº 13.709/18).",
  ],
  ["h", "2. Dados Coletados"],
  ["h", "2.1. Informações fornecidas voluntariamente"],
  ["p", "Como:"],
  ["li", "Nome"],
  ["li", "E-mail"],
  [
    "li",
    "Dados enviados em formulários, comentários, newsletters ou downloads",
  ],
  ["li", "Qualquer informação adicional fornecida voluntariamente"],
  ["h", "2.2. Informações coletadas automaticamente"],
  ["p", "Quando você acessa o site, coletamos:"],
  ["li", "Endereço IP"],
  ["li", "Tipo de navegador"],
  ["li", "Páginas visitadas"],
  ["li", "Tempo de permanência"],
  ["li", "Informações do dispositivo"],
  ["li", "Origem do tráfego"],
  ["li", "Termos de busca utilizados"],
  ["li", "Dados de navegação e engajamento"],
  [
    "p",
    "Esses dados são utilizados apenas para análise, segurança, personalização de experiência e melhorias do site.",
  ],
  ["h", "3. Cookies e Tecnologias de Rastreamento"],
  [
    "p",
    "Utilizamos cookies para melhorar a navegação e compreender como o site é utilizado. Os tipos incluem:",
  ],
  ["li", "Essenciais: garantem o funcionamento do site."],
  [
    "li",
    "Desempenho/analíticos: ajudam a entender interações e otimizar o conteúdo.",
  ],
  ["li", "Funcionais: personalizam a experiência (idioma, preferências)."],
  [
    "li",
    "Publicidade e redes sociais: exibem anúncios mais relevantes, sempre respeitando sua privacidade.",
  ],
  ["h", "4. Finalidade do Uso dos Dados"],
  ["p", "Os dados coletados são utilizados para:"],
  ["li", "Melhorar a experiência no site"],
  [
    "li",
    "Enviar conteúdos, newsletters e comunicações (com seu consentimento)",
  ],
  [
    "li",
    "Fornecer materiais, e-books, atualizações e respostas a solicitações",
  ],
  ["li", "Realizar análises internas de performance e conteúdo"],
  ["li", "Cumprir requisitos legais"],
  [
    "p",
    `Importante: A ${b.name} não incentiva, promove ou comercializa compra ou venda de seguidores. Todo conteúdo possui caráter informativo e educativo, com foco em boas práticas e estratégias legítimas de marketing digital.`,
  ],
  ["h", "5. Compartilhamento de Dados"],
  ["p", "Seus dados podem ser compartilhados apenas quando necessário:"],
  [
    "li",
    "Com prestadores de serviços (hospedagem, ferramentas de e-mail, plataformas analíticas)",
  ],
  ["li", "Para cumprimento de obrigações legais"],
  [
    "li",
    "Em eventual mudança estrutural da empresa, desde que mantida a proteção dos dados",
  ],
  ["p", "Não vendemos ou repassamos dados pessoais para fins comerciais."],
  ["h", "6. Links Externos"],
  [
    "p",
    `Nosso site pode conter links para plataformas externas, como redes sociais, ferramentas e blogs parceiros. Cada site possui sua própria política de privacidade, pela qual a ${b.name} não se responsabiliza.`,
  ],
  [
    "p",
    "Recomendamos a leitura de tais políticas antes de fornecer qualquer informação pessoal.",
  ],
  ["h", "7. Direitos dos Titulares (LGPD)"],
  ["p", "Você pode exercer os seguintes direitos:"],
  ["li", "Confirmar a existência de tratamento"],
  ["li", "Acessar seus dados pessoais"],
  ["li", "Corrigir ou atualizar dados"],
  ["li", "Solicitar exclusão de dados"],
  ["li", "Solicitar portabilidade"],
  ["li", "Revogar consentimentos"],
  ["li", "Opor-se ao tratamento"],
  [
    "p",
    `Para exercer qualquer direito, basta enviar uma solicitação para: ${b.email}`,
  ],
  ["h", "8. Segurança dos Dados"],
  [
    "p",
    "Adotamos medidas técnicas e administrativas para proteger seus dados contra acessos não autorizados, perdas, alterações ou uso indevido. Caso ocorra algum incidente de segurança, você será notificado nos termos da legislação vigente.",
  ],
  ["h", "9. Atualizações da Política"],
  [
    "p",
    "Esta Política de Privacidade pode ser modificada periodicamente. A versão mais recente estará sempre disponível em nosso site, incluindo a data da última atualização.",
  ],
  ["p", "Recomendamos revisitar esta página regularmente."],
  ["h", "10. Contato"],
  [
    "p",
    `Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato através do nosso e-mail oficial: ${b.email}`,
  ],
];

export const termos = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Seja bem-vindo ao site da ${b.name}. Antes de acessar nossos conteúdos, é importante que você leia e concorde com algumas regras básicas que orientam o uso do nosso site ${b.domain} e qualquer outro serviço digital que oferecemos.`,
  ],
  [
    "p",
    "Ao utilizar nosso site, você automaticamente concorda com estes Termos de Uso. Caso não concorde com algum ponto, recomendamos que não utilize nossos serviços. Nosso objetivo é garantir transparência, segurança e uma experiência positiva para cada visitante.",
  ],
  ["h", "1. Aceitação dos Termos"],
  [
    "p",
    `Ao navegar e utilizar a ${b.name}, você concorda com todas as regras e condições aqui apresentadas.`,
  ],
  [
    "p",
    "Esses termos podem ser atualizados periodicamente para refletir melhorias, mudanças legais ou novos serviços. Sempre que realizarmos alterações relevantes, atualizaremos este documento no site.",
  ],
  [
    "p",
    "Seu uso contínuo da plataforma após a publicação de novos termos significa que você aceita as atualizações.",
  ],
  ["h", "2. Como Utilizar o Nosso Site"],
  [
    "p",
    `Grande parte do conteúdo da ${b.name} está disponível sem necessidade de cadastro. Em algumas situações, no entanto, você pode precisar fornecer informações (como nome e e-mail) para acessar materiais, newsletters ou conteúdos exclusivos.`,
  ],
  ["p", "Ao fornecer seus dados, você concorda em:"],
  ["li", "Oferecer informações verdadeiras"],
  ["li", "Não utilizar dados de terceiros"],
  ["li", "Manter sua conta segura (caso haja criação de login)"],
  [
    "li",
    "Utilizar os espaços de interação, como comentários, de forma respeitosa e dentro da lei",
  ],
  [
    "p",
    `A ${b.name} não permite qualquer uso abusivo, ilegal ou que viole direitos de terceiros.`,
  ],
  ["h", "3. Privacidade"],
  [
    "p",
    "A privacidade dos usuários é essencial para nós. Ao interagir com nosso site, você aceita nossa Política de Privacidade, que explica de maneira clara como coletamos, armazenamos e utilizamos seus dados pessoais.",
  ],
  [
    "p",
    "Nós protegemos suas informações usando práticas seguras e compatíveis com a legislação vigente (incluindo a LGPD). Seus dados somente serão compartilhados com terceiros quando houver:",
  ],
  ["li", "Sua autorização"],
  ["li", "Necessidade operacional direta"],
  ["li", "Exigência legal"],
  ["p", "Para saber mais, consulte nossa Política de Privacidade completa."],
  ["h", "4. Direitos de Conteúdo"],
  [
    "p",
    `Todo o conteúdo disponibilizado na ${b.name}, incluindo textos, imagens, gráficos, vídeos, PDFs, e-books e demais materiais, é protegido por direitos autorais e legislação de propriedade intelectual.`,
  ],
  [
    "p",
    "Você recebe uma licença limitada para acessar e visualizar esse conteúdo exclusivamente para fins pessoais e não comerciais.",
  ],
  ["p", "É proibido, sem autorização prévia e por escrito:"],
  ["li", "Copiar"],
  ["li", "Reproduzir"],
  ["li", "Redistribuir"],
  ["li", "Modificar"],
  ["li", "Publicar em outros canais"],
  ["li", "Utilizar comercialmente qualquer conteúdo do site"],
  [
    "p",
    `Essas restrições incluem tanto conteúdos produzidos pela ${b.name} quanto materiais de terceiros utilizados sob licença.`,
  ],
  ["h", "5. Cookies e Tecnologias de Rastreamento"],
  ["p", "Utilizamos cookies para melhorar sua experiência, como:"],
  ["li", "Registrar preferências de navegação"],
  ["li", "Entender como você utiliza o site"],
  ["li", "Analisar desempenho e estatísticas"],
  ["li", "Personalizar conteúdo"],
  [
    "p",
    "Você pode desativar os cookies nas configurações do navegador, mas isso pode limitar certas funcionalidades.",
  ],
  ["h", "6. Links Externos"],
  [
    "p",
    "Nosso site pode conter links para plataformas externas, como redes sociais, ferramentas, serviços de terceiros e sites parceiros.",
  ],
  ["p", `A ${b.name} não controla esses sites e não se responsabiliza por:`],
  ["li", "Conteúdo externo"],
  ["li", "Práticas de privacidade"],
  ["li", "Segurança das informações fornecidas nesses ambientes"],
  [
    "p",
    "Recomendamos que você leia as políticas de privacidade dos sites externos antes de interagir com eles.",
  ],
  ["h", "7. Alterações e Atualizações"],
  [
    "p",
    "Podemos atualizar estes Termos de Uso a qualquer momento. Sempre exibiremos neste documento a data da última atualização. Caso as mudanças sejam significativas, poderemos utilizar meios adicionais para notificá-lo, como e-mail (se você nos forneceu contato). O uso contínuo do site após a atualização significa que você aceita os novos termos.",
  ],
  ["h", "8. Limitação de Responsabilidade"],
  [
    "p",
    `A ${b.name} se compromete a oferecer informações de qualidade sobre redes sociais, marketing digital, crescimento orgânico e boas práticas. Entretanto:`,
  ],
  ["li", "Não garantimos que todo o conteúdo estará sempre atualizado"],
  ["li", "Não podemos garantir ausência total de erros ou interrupções"],
  [
    "li",
    "Nossas informações são de caráter informativo e não constituem aconselhamento profissional específico",
  ],
  [
    "p",
    `Ao utilizar o site, você concorda que a ${b.name}, seus proprietários e colaboradores não serão responsáveis por quaisquer danos, diretos ou indiretos, derivados do uso ou da incapacidade de uso do site.`,
  ],
  ["h", "9. Conteúdo Gerado por Usuários"],
  [
    "p",
    "Ao enviar comentários, depoimentos ou qualquer tipo de conteúdo ao site, você declara:",
  ],
  ["li", "Ser o autor legítimo do material"],
  ["li", "Não violar direitos de terceiros"],
  [
    "li",
    `Autorizar a ${b.name} a utilizar, reproduzir e exibir esse conteúdo gratuitamente, sem limites territoriais, sempre respeitando a sua autoria`,
  ],
  [
    "p",
    "Essa autorização inclui divulgação em nossas páginas, redes sociais e materiais institucionais.",
  ],
  ["h", "Dúvidas ou Comentários?"],
  [
    "p",
    `Se tiver qualquer dúvida sobre estes Termos de Uso, entre em contato: ${b.email}`,
  ],
];
