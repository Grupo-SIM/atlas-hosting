/**
 * Textos legais do template Semente Viva (genéricos, baseados na LGPD), escritos para uma fundação que recebe doações
 * por PIX, parametrizados pela marca. Revise com um advogado e troque pelos dados reais da fundação antes de publicar.
 * Formato: "h" = título de seção, "p" = parágrafo, "li" = item de lista.
 */
export interface LegalBrand {
  cnpj: string;
  domain: string;
  email: string;
  name: string;
}

export type LegalItem = ["h" | "li" | "p", string];

export const privacidade = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `A ${b.name} (CNPJ ${b.cnpj}) respeita a sua privacidade. Esta política explica como tratamos dados pessoais no site ${b.domain}, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`,
  ],
  ["h", "Quais dados coletamos"],
  [
    "p",
    "Coletamos apenas o que você nos envia: nome, e-mail, telefone e mensagem, quando usa o formulário de contato ou escreve para nós. Dados de navegação (como páginas visitadas e tipo de aparelho) podem ser registrados de forma agregada, para melhorar o site.",
  ],
  ["h", "Como usamos"],
  ["li", "Responder às suas mensagens e pedidos de informação."],
  ["li", "Organizar visitas, voluntariado e matrículas nos projetos."],
  ["li", "Melhorar o conteúdo e o funcionamento do site."],
  ["h", "Doações"],
  [
    "p",
    "As doações são feitas por PIX, diretamente no aplicativo do seu banco. O site não recebe nem guarda dados bancários. O banco informa à fundação apenas os dados que o próprio PIX divulga, como nome e valor, usados para prestar contas e agradecer.",
  ],
  ["h", "Cookies"],
  [
    "p",
    "O site pode usar cookies técnicos e de medição de audiência. Você pode bloquear ou apagar cookies nas configurações do navegador; algumas partes do site podem funcionar de forma limitada.",
  ],
  ["h", "Compartilhamento"],
  [
    "p",
    "Não vendemos dados pessoais. Podemos compartilhá-los com prestadores de serviço (hospedagem e envio de e-mails) que atuam sob contrato, ou por determinação legal.",
  ],
  ["h", "Segurança e retenção"],
  [
    "p",
    "Adotamos medidas razoáveis para proteger os dados e os guardamos pelo tempo necessário para as finalidades acima ou para cumprir obrigações legais.",
  ],
  ["h", "Seus direitos"],
  [
    "p",
    "Você pode pedir acesso, correção, anonimização ou exclusão dos seus dados, e a revogação do consentimento, a qualquer momento.",
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
    `Bem-vindo ao site da ${b.name} (CNPJ ${b.cnpj}). Ao acessá-lo, você concorda com as regras abaixo. Se não concordar com algum ponto, pedimos que não utilize o site.`,
  ],
  ["h", "1. Uso do site"],
  [
    "p",
    "O conteúdo é informativo e tem como objetivo divulgar o trabalho da fundação. Você se compromete a usar o site de forma lícita e respeitosa.",
  ],
  ["h", "2. Doações"],
  [
    "p",
    "As doações são voluntárias, feitas por PIX, e não geram contrapartida. Confira sempre o nome do recebedor e a chave informada na página de doação antes de confirmar o pagamento.",
  ],
  ["h", "3. Propriedade intelectual"],
  [
    "p",
    "Textos, imagens e logotipos são protegidos por direitos autorais. A reprodução depende de autorização prévia, salvo nos casos permitidos em lei.",
  ],
  ["h", "4. Links de terceiros"],
  [
    "p",
    "O site pode ter links para páginas de terceiros (redes sociais, álbuns de fotos, mapas). Não controlamos esses conteúdos e não nos responsabilizamos por eles.",
  ],
  ["h", "5. Limitação de responsabilidade"],
  [
    "p",
    "Buscamos manter as informações corretas e atualizadas, mas horários e atividades podem mudar. Em caso de dúvida, fale com a gente.",
  ],
  ["h", "6. Alterações"],
  [
    "p",
    `Estes termos podem ser atualizados a qualquer momento. A versão vigente é sempre a publicada nesta página. Dúvidas: ${b.email}.`,
  ],
];
