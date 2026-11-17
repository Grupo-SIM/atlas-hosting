/**
 * Textos-modelo de privacidade e termos para uma pousada (LGPD, reservas e dados de hóspedes), parametrizados pela
 * marca. São genéricos: revise com um advogado antes de publicar. Formato: "h" = título, "p" = parágrafo,
 * "li" = item de lista.
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
    `A ${b.name} respeita a sua privacidade. Esta política explica como tratamos dados pessoais no site ${b.domain} e nas reservas, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`,
  ],
  ["h", "Quais dados coletamos"],
  [
    "li",
    "Dados que você informa ao reservar ou falar com a gente: nome, telefone, e-mail, datas e número de pessoas.",
  ],
  [
    "li",
    "Dados de hospedagem exigidos por lei, como documento de identificação no check-in.",
  ],
  [
    "li",
    "Dados de navegação, como páginas acessadas e tipo de dispositivo, coletados por cookies e ferramentas de análise.",
  ],
  ["h", "Como usamos os dados"],
  [
    "li",
    "Confirmar reservas, atender pedidos e enviar informações da estadia.",
  ],
  ["li", "Cumprir obrigações legais e fiscais da atividade de hospedagem."],
  ["li", "Medir o uso do site e melhorar a experiência de quem nos visita."],
  ["h", "Compartilhamento"],
  [
    "p",
    "Não vendemos dados pessoais. Podemos compartilhá-los com prestadores de serviço (motor de reservas, pagamento, hospedagem do site) que atuam sob contrato, ou por determinação legal.",
  ],
  ["h", "Cookies"],
  [
    "p",
    "Usamos cookies para lembrar preferências e medir o uso do site. Você pode desativá-los nas configurações do navegador, mas algumas funções podem deixar de funcionar.",
  ],
  ["h", "Seus direitos"],
  [
    "p",
    "Você pode pedir confirmação de tratamento, acesso, correção, anonimização, portabilidade e exclusão dos seus dados, além de revogar consentimentos.",
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
    `Ao usar o site ${b.domain}, você concorda com estes termos de uso da ${b.name}.`,
  ],
  ["h", "Informações do site"],
  [
    "p",
    "Descrições, fotos, valores e disponibilidade são informativos e podem mudar. A reserva só vale depois da confirmação por escrito.",
  ],
  ["h", "Reservas, cancelamentos e hospedagem"],
  [
    "p",
    "Regras de pagamento, cancelamento, entrada e saída, animais de estimação e silêncio são combinadas na reserva e valem durante a estadia. Pedimos cuidado com a natureza e com os outros hóspedes.",
  ],
  ["h", "Propriedade intelectual"],
  [
    "p",
    "Textos, imagens e marcas publicados são protegidos por direitos autorais. A reprodução depende de autorização prévia, salvo nos casos permitidos em lei.",
  ],
  ["h", "Links externos"],
  [
    "p",
    "O site pode apontar para páginas de terceiros, como o motor de reservas. Não controlamos esses conteúdos nem nos responsabilizamos por eles.",
  ],
  ["h", "Alterações"],
  [
    "p",
    `Estes termos podem ser atualizados a qualquer momento. Dúvidas: ${b.email}.`,
  ],
];
