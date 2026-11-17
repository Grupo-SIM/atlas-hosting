/**
 * Textos-modelo de privacidade e termos para uma sorveteria com pedidos por WhatsApp e delivery (LGPD, dados de
 * pedido e entrega), parametrizados pela marca. São genéricos: revise com um advogado antes de publicar.
 * Formato: "h" = título, "p" = parágrafo, "li" = item de lista.
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
    `A ${b.name} respeita a sua privacidade. Esta política explica como tratamos dados pessoais no site ${b.domain} e nos pedidos feitos por WhatsApp ou aplicativos de entrega, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`,
  ],
  ["h", "Quais dados coletamos"],
  [
    "li",
    "Dados que você informa ao fazer um pedido ou falar com a gente: nome, telefone, endereço de entrega e os itens pedidos.",
  ],
  [
    "li",
    "Dados do clube de vantagens, quando você participa: nome, telefone e histórico de compras.",
  ],
  [
    "li",
    "Dados de navegação, como páginas acessadas e tipo de dispositivo, coletados por cookies e ferramentas de análise.",
  ],
  ["h", "Para que usamos"],
  [
    "p",
    "Usamos os dados para preparar e entregar o seu pedido, responder mensagens, oferecer os benefícios do clube e melhorar o site. Não vendemos os seus dados.",
  ],
  ["h", "Compartilhamento"],
  [
    "p",
    "Os dados podem ser compartilhados apenas com quem participa do pedido (entregadores, plataformas de delivery e meios de pagamento) ou quando a lei exigir.",
  ],
  ["h", "Seus direitos"],
  [
    "p",
    `Você pode pedir acesso, correção ou exclusão dos seus dados, e sair do clube a qualquer momento, escrevendo para ${b.email}.`,
  ],
  ["h", "Alterações"],
  [
    "p",
    "Esta política pode ser atualizada. A versão vigente é sempre a publicada nesta página.",
  ],
];

export const termos = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Ao usar o site ${b.domain} e fazer pedidos na ${b.name}, você concorda com as regras abaixo. Se não concordar com algum ponto, pedimos que não utilize o site.`,
  ],
  ["h", "1. Pedidos"],
  [
    "p",
    "Os pedidos são confirmados pela unidade escolhida, por WhatsApp ou pelo aplicativo de entrega. Cardápio, preços e sabores podem mudar sem aviso e dependem da disponibilidade de cada unidade.",
  ],
  ["h", "2. Entrega e horários"],
  [
    "p",
    "Cada unidade tem horário e área de entrega próprios. O horário mostrado no site é informativo; em feriados e datas especiais ele pode mudar.",
  ],
  ["h", "3. Clube de vantagens"],
  [
    "p",
    "Os benefícios, a pontuação e as regras do clube são definidos pela loja e podem ser alterados. A participação é opcional e gratuita.",
  ],
  ["h", "4. Propriedade intelectual"],
  [
    "p",
    "Textos, imagens, logotipos e demais materiais do site são protegidos por direitos autorais. A reprodução depende de autorização prévia.",
  ],
  ["h", "5. Links de terceiros"],
  [
    "p",
    "O site pode conter links para aplicativos e redes sociais. Não controlamos esses conteúdos e não nos responsabilizamos por eles.",
  ],
  ["h", "6. Alterações"],
  [
    "p",
    "Estes termos podem ser atualizados a qualquer momento. A versão vigente é sempre a publicada nesta página.",
  ],
];
