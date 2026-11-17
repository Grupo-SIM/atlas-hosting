/**
 * Marca do template "Comunidade Viva — Igreja": tudo que identifica a igreja fica aqui (nome, liderança, contatos,
 * redes, endereço). É uma marca **fictícia** — o layout foi medido no site de uma igreja real, mas a marca, as pessoas,
 * os textos, as fotos, os endereços e os links não vieram de lá. Trocar a marca = editar este arquivo (ou o site no
 * editor, em "Página inteira").
 */
export const BRAND = {
  address: "Rua Exemplo, 100 – Centro – Cidade/UF",
  domain: "exemplo.com.br",
  email: "contato@exemplo.com",
  /** Liderança fictícia (assinatura da página de história). */
  leaders: "Pr. Marcos e Pra. Lúcia Andrade",
  legalName: "Comunidade Viva",
  motto: "Uma igreja para todas as gerações",
  name: "Comunidade Viva",
  /** Redes padrão do submenu: só as páginas iniciais de cada rede (o cliente informa os perfis dele). */
  socials: [
    ["YouTube", "https://www.youtube.com/"],
    ["Instagram", "https://www.instagram.com/"],
    ["Facebook", "https://www.facebook.com/"],
    ["Comunidade no WhatsApp", "https://www.whatsapp.com/"],
    ["TikTok", "https://www.tiktok.com/"],
    ["Telegram", "https://telegram.org/"],
  ] as [string, string][],
  /** Só números, com DDI e DDD: o mesmo número vale para as células e as sedes que não têm o próprio. */
  whatsapp: "5500000000000",
} as const;

/**
 * Vídeo de boas-vindas de exemplo (um filme livre do Blender): é só um espaço reservado para o popup funcionar na
 * demonstração — o cliente troca pelo vídeo da igreja em "Página inteira".
 */
export const SAMPLE_VIDEO = "https://www.youtube.com/watch?v=aqz-KE-bpKQ";
