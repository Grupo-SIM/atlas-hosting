/**
 * Catálogo de áreas com permissão por nível (nenhum / visualiza / edita). É a fonte única de verdade: a tela de
 * acessos, a validação no servidor e as checagens das páginas e ações leem daqui.
 *
 * `available: false` = a área aparece na tela como "em breve" e **não pode ser concedida** (as páginas do painel
 * do cliente ainda não checam permissão por área; liberar de mentira seria pior que não liberar).
 */
export type AreaLevel = "edit" | "view";
export type Level = AreaLevel | "none";

export interface AreaDef {
  available: boolean;
  description: string;
  key: string;
  label: string;
  /** Área que pede cuidado (credenciais, cobrança, gente): ganha o aviso ⚠ na tela. */
  sensitive?: boolean;
}

export interface AreaGroup {
  areas: AreaDef[];
  key: string;
  label: string;
}

export const AREA_GROUPS: AreaGroup[] = [
  {
    areas: [
      {
        available: true,
        description: "Painel da administração e estatísticas da plataforma.",
        key: "admin_overview",
        label: "Visão geral e estatísticas",
      },
      {
        available: true,
        description: "Servidores VPS da plataforma e seus recursos.",
        key: "admin_vps",
        label: "Servidores VPS",
      },
      {
        available: true,
        description:
          "Saldo e dados dos fornecedores (ex.: Namecheap, Contabo).",
        key: "admin_suppliers",
        label: "Fornecedores",
      },
    ],
    key: "operacao",
    label: "Operação",
  },
  {
    areas: [
      {
        available: true,
        description:
          "Planos VPS, assinaturas e links de pagamento: mexe em cobrança.",
        key: "admin_vps_plans",
        label: "Planos VPS e links de pagamento",
        sensitive: true,
      },
      {
        available: true,
        description: "Planos de hospedagem oferecidos aos clientes.",
        key: "admin_plans",
        label: "Planos de hospedagem",
      },
      {
        available: true,
        description: "Cria e gerencia vouchers de desconto.",
        key: "admin_vouchers",
        label: "Vouchers",
      },
      {
        available: true,
        description: "Afiliados, indicações e comissões.",
        key: "admin_affiliates",
        label: "Afiliados",
      },
    ],
    key: "financeiro",
    label: "Financeiro",
  },
  {
    areas: [
      {
        available: true,
        description:
          "Cadastra pessoas e define o que cada uma acessa. Fica fora de “todas as áreas” e se libera à parte.",
        key: "admin_users",
        label: "Usuários",
        sensitive: true,
      },
      {
        available: true,
        description: "Templates com exclusividade, preços e revendas.",
        key: "admin_exclusivity",
        label: "Exclusividade de templates",
      },
    ],
    key: "plataforma",
    label: "Plataforma",
  },
  {
    areas: [
      {
        available: false,
        description:
          "Painel, hospedagem, domínios, e-mail, sites e faturas da conta.",
        key: "client_panel",
        label: "Painel do cliente",
      },
    ],
    key: "cliente",
    label: "Conta do cliente (em breve)",
  },
];

export const ALL_AREAS: AreaDef[] = AREA_GROUPS.flatMap(g => g.areas);
export const GRANTABLE_AREAS = ALL_AREAS.filter(a => a.available);
export type AreaKey = string;

/** Área que nunca entra em "todas as áreas": só se concede à parte. */
export const OUTSIDE_ALL_AREAS = "admin_users";

export const areaDef = (key: string): AreaDef | undefined =>
  ALL_AREAS.find(a => a.key === key);

export const isGrantableArea = (key: string): boolean =>
  GRANTABLE_AREAS.some(a => a.key === key);

/** Áreas de administração (as que mostram o painel /admin para quem tem ao menos uma). */
export const ADMIN_AREA_KEYS = GRANTABLE_AREAS.map(a => a.key);

/** Qual área protege cada rota de administração (prefixo mais longo vence). */
export const ADMIN_ROUTE_AREAS: { area: string; prefix: string }[] = [
  { area: "admin_overview", prefix: "/admin/estatisticas" },
  { area: "admin_users", prefix: "/admin/users" },
  { area: "admin_vps_plans", prefix: "/admin/vps-plans" },
  { area: "admin_vps", prefix: "/admin/vps" },
  { area: "admin_suppliers", prefix: "/admin/suppliers" },
  { area: "admin_plans", prefix: "/admin/plans" },
  { area: "admin_vouchers", prefix: "/admin/vouchers" },
  { area: "admin_affiliates", prefix: "/admin/affiliates" },
  { area: "admin_exclusivity", prefix: "/admin/exclusividade" },
  { area: "admin_overview", prefix: "/admin" },
];

export function areaForAdminPath(pathname: string): string | undefined {
  return ADMIN_ROUTE_AREAS.filter(
    r => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`)
  ).sort((a, b) => b.prefix.length - a.prefix.length)[0]?.area;
}

export type AccessProfile = "admin" | "editor" | "viewer";

export const PROFILE_LABELS: Record<AccessProfile, string> = {
  admin: "Administrador",
  editor: "Editor",
  viewer: "Visualizador",
};

/** Nível de `granted` cobre o exigido `needed`? (edit cobre view) */
export const covers = (granted: Level, needed: AreaLevel): boolean =>
  granted === "edit" || (granted === "view" && needed === "view");

/** Mapa área → nível de um conjunto de permissões, aplicando `accessAll` e o perfil Administrador. */
export function resolveLevels(input: {
  accessAll: AreaLevel | null;
  permissions: { area: string; level: AreaLevel }[];
  profile: AccessProfile;
}): Record<string, Level> {
  const levels: Record<string, Level> = {};
  for (const area of GRANTABLE_AREAS) {
    if (input.profile === "admin") {
      levels[area.key] = "edit";
      continue;
    }
    levels[area.key] =
      input.accessAll && area.key !== OUTSIDE_ALL_AREAS
        ? input.accessAll
        : "none";
  }
  if (input.profile !== "admin") {
    for (const p of input.permissions) {
      if (isGrantableArea(p.area)) levels[p.area] = p.level;
    }
  }
  return levels;
}
