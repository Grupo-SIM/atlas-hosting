/**
 * Textos legais do template SAUT (modelo genérico, baseado na LGPD): trocar a marca em `index.ts` troca os textos.
 * Revise com um advogado antes de publicar. `body`: linha em branco separa parágrafos; linhas com "- " viram lista.
 */
export interface LegalBrand {
  domain: string;
  email: string;
  name: string;
}

export interface LegalSection {
  body: string;
  title: string;
}

export const privacidade = (b: LegalBrand): LegalSection[] => [
  {
    body: `A ${b.name} respeita a sua privacidade. Esta política explica como tratamos dados pessoais no site ${b.domain}, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).`,
    title: "Quem somos",
  },
  {
    body: "- Dados que você informa, como nome, telefone e e-mail ao entrar em contato conosco.\n- Dados de navegação, como páginas acessadas, tipo de dispositivo e endereço IP, coletados por cookies e ferramentas de análise.",
    title: "Quais dados coletamos",
  },
  {
    body: "- Responder mensagens e propostas solicitadas por você.\n- Medir audiência e melhorar o conteúdo e a experiência do site.\n- Cumprir obrigações legais e proteger o negócio contra fraudes.",
    title: "Como usamos os dados",
  },
  {
    body: "Usamos cookies para lembrar preferências e medir o uso do site. Você pode desativá-los nas configurações do navegador, mas algumas funções podem deixar de funcionar.",
    title: "Cookies",
  },
  {
    body: "Não vendemos dados pessoais. Podemos compartilhá-los com prestadores de serviço (hospedagem, análise e mídia) que atuam sob contrato, ou por determinação legal.",
    title: "Compartilhamento",
  },
  {
    body: "Adotamos medidas técnicas e administrativas para proteger os dados contra acesso não autorizado, perda ou alteração.",
    title: "Segurança",
  },
  {
    body: "Você pode solicitar confirmação de tratamento, acesso, correção, anonimização, portabilidade e exclusão dos seus dados, além de revogar consentimentos.",
    title: "Seus direitos",
  },
  {
    body: `Para exercer seus direitos ou tirar dúvidas, escreva para ${b.email}.`,
    title: "Contato",
  },
];

export const termos = (b: LegalBrand): LegalSection[] => [
  {
    body: `Ao acessar o site ${b.domain}, você concorda com estes termos de uso da ${b.name}. Se não concordar com algum ponto, pedimos que não utilize o site.`,
    title: "Aceitação",
  },
  {
    body: "O site apresenta a empresa, seus serviços e formas de contato. Você se compromete a usá-lo de forma lícita, sem tentar prejudicar seu funcionamento ou o acesso de outras pessoas.",
    title: "Uso do site",
  },
  {
    body: "Textos, imagens, logotipos e demais materiais são protegidos por direitos autorais. A reprodução depende de autorização prévia, salvo nos casos permitidos em lei.",
    title: "Propriedade intelectual",
  },
  {
    body: "Os resultados e números citados descrevem projetos específicos e não garantem desempenho igual em outros negócios. Propostas e condições comerciais são combinadas por escrito antes da contratação.",
    title: "Resultados e propostas",
  },
  {
    body: "O site pode apontar para páginas de terceiros. Não controlamos esses conteúdos e não nos responsabilizamos por eles.",
    title: "Links externos",
  },
  {
    body: `Estes termos podem ser atualizados a qualquer momento. Dúvidas: ${b.email}.`,
    title: "Alterações e contato",
  },
];
