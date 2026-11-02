/** Textos-modelo genéricos. Revise com um advogado e troque "Meu Diário" pelo nome do seu site antes de publicar. */
export type LegalItem = ["h" | "li" | "p", string];

export const TERMOS: LegalItem[] = [
  [
    "p",
    "Bem-vindo ao Meu Diário. Ao acessar este site, você concorda com as regras descritas abaixo. Se não concordar com algum ponto, pedimos que não utilize o site.",
  ],
  ["h", "1. Uso do site"],
  [
    "p",
    "O conteúdo é oferecido para fins informativos. Você se compromete a usar o site de forma lícita e respeitosa, sem tentar prejudicar seu funcionamento ou o acesso de outras pessoas.",
  ],
  ["h", "2. Propriedade intelectual"],
  [
    "p",
    "Textos, imagens, logotipos e demais materiais são protegidos por direitos autorais. A reprodução depende de autorização prévia, salvo nos casos permitidos em lei.",
  ],
  ["h", "3. Links e conteúdo de terceiros"],
  [
    "p",
    "O site pode conter links para páginas de terceiros. Não controlamos esses conteúdos e não nos responsabilizamos por eles.",
  ],
  ["h", "4. Limitação de responsabilidade"],
  [
    "p",
    "Buscamos manter as informações corretas e atualizadas, mas não garantimos que estejam livres de erros. Preços, horários e condições de viagem mudam: confirme sempre nas fontes oficiais.",
  ],
  ["h", "5. Alterações"],
  [
    "p",
    "Estes termos podem ser atualizados a qualquer momento. A versão vigente é sempre a publicada nesta página.",
  ],
];

export const PRIVACIDADE: LegalItem[] = [
  [
    "p",
    "Esta política explica como o Meu Diário trata os dados de quem visita o site, em conformidade com a Lei Geral de Proteção de Dados (LGPD).",
  ],
  ["h", "1. Dados que coletamos"],
  [
    "li",
    "Dados informados por você, como nome e e-mail, quando entra em contato.",
  ],
  [
    "li",
    "Dados de navegação, como páginas visitadas, tipo de dispositivo e navegador.",
  ],
  ["h", "2. Como usamos os dados"],
  [
    "p",
    "Usamos as informações para responder mensagens, melhorar o conteúdo e entender como o site é utilizado. Não vendemos seus dados.",
  ],
  ["h", "3. Compartilhamento"],
  [
    "p",
    "Os dados só são compartilhados com prestadores de serviço necessários ao funcionamento do site ou quando houver obrigação legal.",
  ],
  ["h", "4. Seus direitos"],
  [
    "p",
    "Você pode solicitar acesso, correção ou exclusão dos seus dados a qualquer momento pelo e-mail de contato informado no rodapé.",
  ],
  ["h", "5. Cookies"],
  [
    "p",
    "Podemos usar cookies para lembrar preferências e medir o uso do site. Você pode bloquear cookies nas configurações do navegador.",
  ],
];
