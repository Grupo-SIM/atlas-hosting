/**
 * Marca do template "Vereda Viva — Pousada e Camping": tudo que identifica a pousada fica aqui (nome, contatos,
 * redes, textos). É uma marca **fictícia** — o layout foi medido numa pousada real, a marca, os textos, as fotos e
 * os contatos não. Trocar a marca = editar este arquivo (ou o site no editor, em "Página inteira").
 */
export const BRAND = {
  address: "Chapada dos Veadeiros, GO",
  copyright: "Pousada Vereda Viva",
  domain: "exemplo.com.br",
  email: "contato@exemplo.com",
  legalName: "Pousada Vereda Viva",
  name: "Pousada Vereda Viva",
  socials: [
    ["Instagram", "https://instagram.com/"],
    ["Facebook", "https://facebook.com/"],
    ["YouTube", "https://youtube.com/"],
  ] as [string, string][],
  /** Só números, com DDI e DDD: o mesmo número vale para o botão flutuante, o "Fale Conosco" e o rodapé. */
  whatsapp: "5500000000000",
} as const;
