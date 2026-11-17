/**
 * Textos-modelo de privacidade e termos para uma igreja (LGPD: visitantes, pedidos de oração, células e voluntários),
 * parametrizados pela marca. São genéricos: revise com um advogado antes de publicar. Formato: "h" = título,
 * "p" = parágrafo, "li" = item de lista.
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
    "Dados que você informa ao falar com a gente: nome, telefone, e-mail e a mensagem enviada, por exemplo ao pedir informações sobre uma célula.",
  ],
  [
    "li",
    "Dados de navegação, como páginas acessadas e tipo de dispositivo, coletados por cookies e ferramentas de análise.",
  ],
  ["h", "Para que usamos"],
  [
    "li",
    "Responder às suas mensagens e apresentar os encontros e células mais próximos de você.",
  ],
  ["li", "Enviar avisos da igreja, somente a quem pediu para recebê-los."],
  ["li", "Melhorar o site e entender quais conteúdos ajudam mais as pessoas."],
  ["h", "Pedidos de oração e informações sensíveis"],
  [
    "p",
    "Pedidos de oração e assuntos pessoais compartilhados com a nossa equipe são tratados com sigilo e usados apenas para o acolhimento de quem os enviou. Não publicamos nomes nem detalhes sem autorização.",
  ],
  ["h", "Compartilhamento"],
  [
    "p",
    "Não vendemos dados pessoais. Podemos compartilhá-los com prestadores que operam o site e os canais de contato, sempre sob dever de confidencialidade, ou quando a lei exigir.",
  ],
  ["h", "Seus direitos"],
  [
    "p",
    `Você pode pedir acesso, correção ou exclusão dos seus dados, ou retirar um consentimento, escrevendo para ${b.email}.`,
  ],
  ["h", "Atualizações"],
  [
    "p",
    "Esta política pode ser atualizada. A versão em vigor é sempre a publicada nesta página.",
  ],
];

export const termos = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Ao usar o site ${b.domain} você concorda com estes termos. Se não concordar, pedimos que não o utilize.`,
  ],
  ["h", "Sobre o site"],
  [
    "p",
    `O site da ${b.name} apresenta a nossa igreja, a agenda, as células e as sedes. As informações podem mudar sem aviso; confirme horários e endereços antes de ir.`,
  ],
  ["h", "Conteúdo"],
  [
    "p",
    "Textos, imagens e vídeos publicados aqui pertencem à igreja ou são usados com autorização. Você pode compartilhar os links, mas não pode copiar o conteúdo para fins comerciais.",
  ],
  ["h", "Uso adequado"],
  ["li", "Não use o site para enviar mensagens ofensivas, falsas ou ilegais."],
  [
    "li",
    "Não tente acessar áreas restritas nem prejudicar o funcionamento do site.",
  ],
  ["h", "Links externos"],
  [
    "p",
    "O site pode apontar para páginas de terceiros (redes sociais, lojas de aplicativos, vídeos). Não controlamos esses endereços nem respondemos pelo conteúdo deles.",
  ],
  ["h", "Contato"],
  ["p", `Dúvidas sobre estes termos: ${b.email}.`],
];
