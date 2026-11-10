/**
 * Textos legais do template Zyrion (genéricos, baseados na LGPD), parametrizados pela marca: trocar a marca
 * em `brand.ts` troca os textos. Formato: "h" = título de seção, "p" = parágrafo, "li" = item de lista.
 * Mesma estrutura de seções do site original: o que coletamos, como usamos, cookies, compartilhamento,
 * segurança, direitos do titular e contato.
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
    `A ${b.name} respeita a sua privacidade. Esta política explica como tratamos dados pessoais no site ${b.domain}, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`,
  ],
  ["h", "Quais dados coletamos"],
  [
    "li",
    "Dados que você informa, como nome e e-mail ao se inscrever na newsletter ou entrar em contato.",
  ],
  [
    "li",
    "Dados de navegação, como páginas acessadas, tipo de dispositivo e endereço IP, coletados por cookies e ferramentas de análise.",
  ],
  ["h", "Como usamos os dados"],
  ["li", "Enviar newsletters e responder mensagens enviadas por você."],
  ["li", "Medir audiência e melhorar o conteúdo e a experiência de leitura."],
  [
    "li",
    "Exibir anúncios, quando houver, de forma compatível com a nossa política de anúncios.",
  ],
  ["h", "Cookies"],
  [
    "p",
    "Usamos cookies para lembrar preferências e medir o uso do site. Você pode desativá-los nas configurações do navegador, mas algumas funções podem deixar de funcionar.",
  ],
  ["h", "Compartilhamento"],
  [
    "p",
    "Não vendemos dados pessoais. Podemos compartilhá-los com prestadores de serviço (hospedagem, análise e anúncios) que atuam sob contrato, ou por determinação legal.",
  ],
  ["h", "Segurança"],
  [
    "p",
    "Adotamos medidas técnicas e administrativas para proteger os dados contra acesso não autorizado, perda ou alteração.",
  ],
  ["h", "Seus direitos"],
  [
    "p",
    "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade e exclusão dos seus dados, além de revogar consentimentos.",
  ],
  ["h", "Contato"],
  [
    "p",
    `Para exercer seus direitos ou tirar dúvidas, escreva para ${b.email}.`,
  ],
];

export const termos = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Ao acessar o site ${b.domain}, você concorda com estes termos de uso da ${b.name}.`,
  ],
  ["h", "Uso do conteúdo"],
  [
    "p",
    "Os textos, imagens e marcas publicados são protegidos por direitos autorais. É permitido compartilhar links e trechos curtos com citação da fonte; a reprodução integral exige autorização.",
  ],
  ["h", "Responsabilidades"],
  [
    "p",
    "Buscamos publicar informações corretas e atualizadas, mas não garantimos que o conteúdo esteja livre de erros. Para sugerir correções, veja a página de política de correções.",
  ],
  ["h", "Links externos"],
  [
    "p",
    "O site pode apontar para páginas de terceiros. Não nos responsabilizamos pelo conteúdo ou pelas práticas desses sites.",
  ],
  ["h", "Comentários e envio de conteúdo"],
  [
    "p",
    "Conteúdo enviado por leitores pode ser editado ou recusado. Ao enviar, você declara ter os direitos sobre o material.",
  ],
  ["h", "Alterações"],
  [
    "p",
    `Estes termos podem ser atualizados a qualquer momento. Dúvidas: ${b.email}.`,
  ],
];

export const anuncios = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `A ${b.name} exibe anúncios para manter o jornalismo gratuito. Esta política explica como eles funcionam.`,
  ],
  ["h", "Separação entre notícia e publicidade"],
  [
    "p",
    "Todo anúncio é identificado com o rótulo “Publicidade” e não interfere na decisão editorial.",
  ],
  ["h", "Conteúdo não aceito"],
  ["li", "Desinformação, discurso de ódio ou conteúdo ilegal."],
  [
    "li",
    "Promessas de ganho garantido e produtos sem autorização dos órgãos competentes.",
  ],
  ["h", "Anunciar"],
  ["p", `Para anunciar, escreva para ${b.email}.`],
];

export const editorial = (b: LegalBrand): LegalItem[] => [
  ["p", `Esta política resume os princípios editoriais da ${b.name}.`],
  ["h", "Princípios"],
  ["li", "Apuração com mais de uma fonte sempre que possível."],
  ["li", "Clareza ao distinguir fato, análise e opinião."],
  ["li", "Respeito às pessoas citadas e direito de resposta."],
  ["h", "Fontes e independência"],
  [
    "p",
    "Citamos as fontes de dados e imagens. Anunciantes e parceiros não têm influência sobre o conteúdo editorial.",
  ],
  ["h", "Contato com a redação"],
  ["p", `Sugestões de pauta e denúncias: ${b.email}.`],
];

export const correcoes = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Errar é possível; corrigir é obrigação. Se você encontrou um erro em uma matéria da ${b.name}, avise.`,
  ],
  ["h", "Como pedir uma correção"],
  [
    "li",
    "Envie o endereço da matéria, o trecho com erro e, se possível, a fonte da informação correta.",
  ],
  ["li", `Escreva para ${b.email} com o assunto “Correção”.`],
  ["h", "O que fazemos"],
  [
    "p",
    "Corrigimos o texto, registramos a alteração no final da matéria e respondemos ao leitor quando houver contato.",
  ],
];
