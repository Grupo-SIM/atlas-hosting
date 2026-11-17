/**
 * Marca do template "Semente Viva — Fundação / ONG": tudo que identifica a fundação fica aqui (nome, lema, CNPJ,
 * endereço, contatos, redes, PIX). É uma marca **fictícia** — o layout foi medido numa fundação real, mas nome, pessoas,
 * documentos, contatos, textos e fotos são próprios (`fundacao-semente-viva.test.ts` impede que voltem). O CNPJ é
 * claramente inválido (zeros) e o PIX é de exemplo: o editor avisa para trocar antes de publicar.
 */
export const BRAND = {
  address: "Rua Exemplo, 100 – Centro – Cidade/UF",
  cnpj: "00.000.000/0001-00",
  copyright: "Copyright © {ano} {nome}. Todos os direitos reservados.",
  domain: "exemplo.org.br",
  email: "contato@exemplo.org.br",
  hours: "Segunda a sexta, das 8h às 12h e das 14h às 18h",
  legalName: "Fundação Semente Viva",
  name: "Fundação Semente Viva",
  /** Telefone para exibir e discar. */
  phone: "+55 (00) 0000-0000",
  /** Chave PIX de exemplo (tem a palavra "exemplo": o editor avisa para trocar). */
  pix: {
    city: "CIDADE EXEMPLO",
    key: "pix@exemplo.org.br",
    keyType: "email",
    receiver: "FUNDACAO SEMENTE VIVA",
  },
  socials: [
    ["Instagram", "https://instagram.com/"],
    ["Facebook", "https://facebook.com/"],
    ["YouTube", "https://youtube.com/"],
    ["WhatsApp", "https://wa.me/5500000000000"],
  ] as [string, string][],
  tagline: "Plantando hoje o futuro da nossa comunidade",
  /** Só números, com DDI e DDD. */
  whatsapp: "5500000000000",
} as const;
