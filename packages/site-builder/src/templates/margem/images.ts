/**
 * Fotos de demonstração do template Margem (Unsplash, licença livre, sem atribuição obrigatória).
 * Registro com autor e papel de cada uma: `plans/margem-imagens.md`. Trocar uma foto = editar aqui
 * (ou, num site já criado, no editor).
 */
export interface Photo {
  /** ID do Unsplash (`images.unsplash.com/photo-<id>`). */
  id: string;
  /** Largura ÷ altura do original (vira o formato do plano no túnel). */
  ratio: number;
}

/** Paredes do túnel t01–t28, na ordem. */
export const WALL: Photo[] = [
  { id: "1780660231448-7f0aa4d236e9", ratio: 0.668 }, // t01 — sacos kraft com etiquetas brancas
  { id: "1597696929736-6d13bed8e6a8", ratio: 1.5 }, // t02 — coleção de vasos de cerâmica numa prateleira
  { id: "1790345835845-bda0548978b2", ratio: 1.333 }, // t03 — brochura aberta sobre madeira
  { id: "1633414654227-2b5ea828b3ef", ratio: 1.5 }, // t04 — sacola kraft lisa sobre mármore
  { id: "1793100123538-396050d9f5c1", ratio: 0.667 }, // t05 — frasco âmbar conta-gotas sobre pedra (Âmbar Botica)
  { id: "1676747995218-5c38799cd71b", ratio: 0.667 }, // t06 — parede de reboco terracota (Taipa)
  { id: "1579101403413-a02d6b3727fa", ratio: 1.5 }, // t07 — mesa posta, linho terracota e conchas (Sururu)
  { id: "1436918898788-ebce04d38e46", ratio: 1.5 }, // t08 — tipos de madeira de letterpress
  { id: "1654124803533-a51f169e1971", ratio: 0.667 }, // t09 — livro em tecido cru com lombada vermelha
  { id: "1592119748016-a61c40a44320", ratio: 0.667 }, // t10 — garrafa com rótulo em branco sobre mesa de madeira (Engenho Vau)
  { id: "1725169412537-acd1cd15e10f", ratio: 1.5 }, // t11 — copos de cerâmica empilhados ao sol
  { id: "1498075702571-ecb018f3752d", ratio: 1.514 }, // t12 — lettering a lápis em papel vegetal
  { id: "1677753670021-123aba554171", ratio: 1.5 }, // t13 — sacola com padrão gráfico rosa e verde
  { id: "1778567148288-233997494476", ratio: 1.5 }, // t14 — cartão de visita em branco sobre tecido
  { id: "1576501161309-37635f837061", ratio: 0.705 }, // t15 — placa de madeira "Farmshop" em fachada de tijolo
  { id: "1791831611666-ce460985a9b1", ratio: 1.5 }, // t16 — pilha de papéis artesanais coloridos
  { id: "1558707538-c56435bdcdf3", ratio: 1.499 }, // t17 — parede de cartazes tipográficos (Maré Mansa)
  { id: "1557499305-bd68d0ad468d", ratio: 1.658 }, // t18 — capas de cardápio kraft "Food / Menu" (Prato Raso)
  { id: "1536936812504-0e77dc3f0b40", ratio: 0.667 }, // t19 — canecas artesanais numa prateleira
  { id: "1679941279735-b3b35e8bc476", ratio: 0.666 }, // t20 — pote de mel com tampa de tecido e rótulo (Jandaíra)
  { id: "1777151409209-8bdbbe478497", ratio: 1.5 }, // t21 — placa pintada à mão "Groceries / Snacks" (Feira Aurora)
  { id: "1790861286814-0fcb8ed0a4c9", ratio: 1.5 }, // t22 — embalagem kraft lisa sobre fundo branco
  { id: "1635621456241-16e4a3a009a0", ratio: 0.667 }, // t23 — revista aberta, matéria "Island Life" (Quadrante)
  { id: "1643569556871-91ec60671ed7", ratio: 0.728 }, // t24 — vaso de cerâmica bege em anel
  { id: "1675552561484-f11fca689bc4", ratio: 0.667 }, // t25 — envelopes kraft e laranja em grade (Casa Cajá)
  { id: "1633504798516-2cf5e3f94621", ratio: 0.8 }, // t26 — dois livros em tecido vinho e petróleo
  { id: "1508368941103-de02f9ad7b4d", ratio: 1.545 }, // t27 — livro botânico aberto com flores
  { id: "1755830806360-f0d49b40994b", ratio: 1.5 }, // t28 — letreiro "Cinema" de lâmpadas (Cine Ladeira)
];

export const CASE_PHOTOS = {
  preamar: { id: "1759488820765-5cf0755965ea", ratio: 1.5 },
  restinga: { id: "1741118806217-1f38e2faa6be", ratio: 1.5 },
  sol: { id: "1610701596007-11502861dcfa", ratio: 1.5 },
  torraAlta: { id: "1695245503558-5cdb37f49092", ratio: 1.5 },
} satisfies Record<string, Photo>;

export const METHOD_PHOTOS = {
  rascunho: { id: "1742130847739-f7728ae50176", ratio: 0.667 },
  rua: { id: "1777451440988-3995bb93f78f", ratio: 1.5 },
  sistema: { id: "1740324974144-046b3538e89e", ratio: 0.787 },
} satisfies Record<string, Photo>;
