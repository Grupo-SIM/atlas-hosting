/**
 * Textos legais de exemplo do template (escritos para ele, com nome da marca, domínio e e-mail
 * parametrizados). São um ponto de partida genérico: revise com um advogado antes de publicar.
 */
export type LegalItem = ["h" | "li" | "p", string];

export interface LegalBrand {
  domain: string;
  email: string;
  name: string;
}

export const termos = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Estes Termos de Uso explicam as regras para navegar em ${b.domain} e usar os conteúdos publicados pela ${b.name}. Eles foram escritos em linguagem direta para que você saiba exatamente o que esperar de nós e o que esperamos de você.`,
  ],
  ["h", "1. Aceitação"],
  [
    "p",
    "Ao acessar o site, você declara que leu e concorda com estes termos. Se não concordar com algum ponto, pedimos que não utilize o site. Podemos atualizar este documento; a data da última revisão fica sempre no fim da página, e o uso contínuo depois de uma mudança significa que você aceita a nova versão.",
  ],
  ["h", "2. O que oferecemos"],
  [
    "p",
    `A ${b.name} publica artigos, vídeos, guias e materiais sobre marketing digital com finalidade educativa. O conteúdo é geral e não substitui uma consultoria feita para o seu caso: resultados dependem do seu mercado, do seu produto e da forma como cada estratégia é aplicada.`,
  ],
  ["h", "3. Uso permitido"],
  [
    "p",
    "Você pode ler, compartilhar links e usar as ideias dos conteúdos no seu próprio negócio. Não é permitido:",
  ],
  [
    "li",
    "copiar textos, imagens ou materiais inteiros e publicá-los como se fossem seus;",
  ],
  [
    "li",
    "vender, revender ou distribuir materiais gratuitos ou pagos sem autorização por escrito;",
  ],
  [
    "li",
    "tentar acessar áreas restritas, sobrecarregar o site ou coletar dados de forma automatizada;",
  ],
  [
    "li",
    "publicar comentários ofensivos, discriminatórios, enganosos ou que violem direitos de terceiros.",
  ],
  ["h", "4. Propriedade intelectual"],
  [
    "p",
    `Textos, marcas, logotipos, layouts e materiais do site pertencem à ${b.name} ou a parceiros que autorizaram o uso. Citações curtas são bem-vindas, desde que indiquem a fonte e tragam o link para a página original.`,
  ],
  ["h", "5. Links e serviços de terceiros"],
  [
    "p",
    "Algumas páginas trazem links, vídeos incorporados ou ferramentas de outras empresas. Esses serviços têm regras e políticas próprias, e não respondemos pelo conteúdo, pela disponibilidade ou pelas práticas de privacidade deles.",
  ],
  ["h", "6. Produtos e materiais pagos"],
  [
    "p",
    "Quando um material for vendido, as condições de pagamento, entrega, acesso e reembolso aparecem na página de compra antes da finalização. Em compras pela internet, vale o direito de arrependimento de 7 dias previsto no Código de Defesa do Consumidor.",
  ],
  ["h", "7. Limitação de responsabilidade"],
  [
    "p",
    "Trabalhamos para manter as informações corretas e atualizadas, mas o mercado digital muda rápido. Não garantimos resultados específicos e não nos responsabilizamos por decisões tomadas exclusivamente com base no conteúdo do site.",
  ],
  ["h", "8. Contato"],
  [
    "p",
    `Dúvidas sobre estes termos podem ser enviadas para ${b.email}. Respondemos em até 5 dias úteis.`,
  ],
  ["p", "Última revisão: novembro de 2026."],
];

export const privacidade = (b: LegalBrand): LegalItem[] => [
  [
    "p",
    `Esta Política de Privacidade descreve como a ${b.name} trata os dados pessoais de quem visita ${b.domain}, em linha com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Coletamos apenas o necessário e explicamos para que cada informação serve.`,
  ],
  ["h", "1. Quais dados coletamos"],
  [
    "li",
    "Dados que você informa: nome e e-mail ao assinar a newsletter, baixar um material ou falar com a gente.",
  ],
  [
    "li",
    "Dados de navegação: páginas visitadas, tempo de leitura, tipo de dispositivo, navegador e região aproximada.",
  ],
  [
    "li",
    "Dados de compra, quando houver: os necessários para emitir a nota e liberar o acesso. Os dados de pagamento ficam com a empresa que processa a transação, não com a gente.",
  ],
  ["h", "2. Para que usamos"],
  ["li", "enviar os conteúdos e materiais que você pediu;"],
  ["li", "responder mensagens e prestar suporte;"],
  ["li", "entender quais conteúdos são mais úteis e melhorar o site;"],
  [
    "li",
    "cumprir obrigações legais, como guardar registros de acesso pelo prazo exigido em lei.",
  ],
  ["h", "3. Cookies"],
  [
    "p",
    "Usamos cookies essenciais para o site funcionar e, com o seu consentimento, cookies de medição de audiência. Você pode apagar ou bloquear cookies nas configurações do navegador; algumas partes do site podem deixar de funcionar como esperado.",
  ],
  ["h", "4. Compartilhamento"],
  [
    "p",
    "Não vendemos dados pessoais. Compartilhamos informações apenas com fornecedores que nos ajudam a operar o site (hospedagem, envio de e-mails, medição de audiência e pagamentos), sempre no limite do necessário, ou quando houver obrigação legal ou ordem judicial.",
  ],
  ["h", "5. Por quanto tempo guardamos"],
  [
    "p",
    "Mantemos os dados enquanto forem necessários para a finalidade informada ou enquanto você mantiver a inscrição. Ao cancelar a newsletter, seu e-mail sai da lista de envios; registros exigidos por lei são guardados pelo prazo legal.",
  ],
  ["h", "6. Seus direitos"],
  [
    "p",
    "Pela LGPD, você pode a qualquer momento pedir a confirmação de que tratamos seus dados, acesso a eles, correção, anonimização, portabilidade ou exclusão, além de revogar consentimentos dados antes.",
  ],
  ["h", "7. Segurança"],
  [
    "p",
    "Adotamos conexão criptografada (HTTPS), controle de acesso às ferramentas internas e fornecedores com boas práticas de segurança. Nenhum sistema é totalmente imune a falhas; se ocorrer um incidente relevante, avisaremos os titulares afetados e a autoridade competente.",
  ],
  ["h", "8. Contato"],
  [
    "p",
    `Para exercer seus direitos ou tirar dúvidas sobre esta política, escreva para ${b.email} com o assunto “Privacidade”.`,
  ],
  ["p", "Última revisão: novembro de 2026."],
];
