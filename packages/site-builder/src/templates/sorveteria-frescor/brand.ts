/**
 * Marca do template "Frescor — Sorveteria, Açaí e Pizza": tudo que identifica a loja fica aqui (nome, unidades,
 * contatos, redes). É uma marca **fictícia** — o layout foi medido no site de uma sorveteria real, mas nome, logo,
 * mascote, fotos, endereços, telefones e textos não vieram de lá. Trocar a marca = editar este arquivo (ou o site no
 * editor: "Unidades" no rodapé, o resto em "Página inteira").
 */
export interface BrandUnit {
  address: string;
  city: string;
  close: string;
  days: string;
  hours: string;
  name: string;
  neighborhood: string;
  open: string;
  phone: string;
}

const CITY = "Cidade Exemplo - UF";

export const BRAND = {
  copyright: "Frescor Sorvetes & Açaí",
  domain: "exemplo.com.br",
  email: "contato@exemplo.com",
  instagram: "https://instagram.com/",
  /** Link do direct do Instagram (`https://ig.me/m/<usuario>`). */
  instagramDirect: "https://ig.me/m/exemplo",
  legalName: "Frescor Sorvetes & Açaí",
  name: "Frescor Sorvetes & Açaí",
  timezone: "America/Sao_Paulo",
  units: [
    {
      address: "Rua Exemplo, 100",
      city: CITY,
      close: "23:00",
      days: "todos",
      hours: "",
      name: "Centro",
      neighborhood: "Centro",
      open: "14:00",
      phone: "5500000000000",
    },
    {
      address: "Rua Exemplo, 200",
      city: CITY,
      close: "23:00",
      days: "todos",
      hours: "",
      name: "Jardim das Flores",
      neighborhood: "Jardim das Flores",
      open: "13:00",
      phone: "5500000000000",
    },
    {
      address: "Rua Exemplo, 300",
      city: CITY,
      close: "22:00",
      days: "seg-sab",
      hours: "",
      name: "Vila Nova",
      neighborhood: "Vila Nova",
      open: "15:00",
      phone: "5500000000000",
    },
  ] satisfies BrandUnit[],
  /** Só números, com DDI e DDD. */
  whatsapp: "5500000000000",
} as const;
