/**
 * Catálogo de áreas com permissão por nível (nenhum / visualiza / edita). É a fonte única de verdade: a tela de
 * acessos, a validação no servidor e as checagens das páginas e ações leem daqui.
 *
 * `available: false` = a área aparece na tela como "em breve" e **não pode ser concedida** (liberar de mentira seria
 * pior que não liberar). As áreas `client_*` controlam o menu e as seções do painel do cliente de contas com acesso de
 * equipe (ver `client.ts`); cliente comum, sem acesso de equipe, vê tudo como sempre.
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
  /** Só liga ou desliga (sem "visualiza" e "edita"): as áreas do painel do cliente. */
  binary?: boolean;
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
        description:
          "Dar, mudar e retirar acessos de contas que já existem na plataforma (clientes e outras pessoas), e não só das que a equipe criou. Exige também “Usuários”. Só o admin master libera, admin por admin, e fica fora de “todas as áreas”.",
        key: "admin_users_existing",
        label: "Usuários já cadastrados",
        sensitive: true,
      },
      {
        available: true,
        description: "Templates com exclusividade, preços e revendas.",
        key: "admin_exclusivity",
        label: "Exclusividade de templates",
      },
      {
        available: true,
        description:
          "Editar os templates de demonstração (chave </> Modo Dev em Criador de Sites → Novo site). O que for salvo vale para todo site criado depois. Só o admin master libera, e fica fora de “todas as áreas” e do perfil Administrador.",
        key: "admin_templates",
        label: "Editar templates (modo Dev)",
        sensitive: true,
      },
    ],
    key: "plataforma",
    label: "Plataforma",
  },
  {
    areas: [
      {
        available: true,
        binary: true,
        description:
          "Servidores VPS, contratar servidor, assinaturas, cPanel, bancos de dados, DNS e sites da conta.",
        key: "client_hosting",
        label: "Hospedagem e servidores",
      },
      {
        available: true,
        binary: true,
        description: "Registrar, transferir e gerenciar domínios.",
        key: "client_domains",
        label: "Domínios",
      },
      {
        available: true,
        binary: true,
        description: "Caixas de e-mail da conta.",
        key: "client_email",
        label: "E-mail",
      },
      {
        available: true,
        binary: true,
        description: "Faturas, carteira e pagamentos.",
        key: "client_billing",
        label: "Faturas e carteira",
      },
      {
        available: true,
        binary: true,
        description: "Afiliados, indicações e vouchers.",
        key: "client_affiliate",
        label: "Afiliados e vouchers",
      },
      {
        available: true,
        binary: true,
        description:
          "Criar, editar e publicar sites com a própria conta. Não inclui editar os templates de demonstração (isso é “Editar templates”).",
        key: "client_site_builder",
        label: "Criador de Sites",
      },
    ],
    key: "cliente",
    label: "Painel do cliente",
  },
];

/** Áreas do painel do cliente (o que a conta enxerga no menu dela), por oposição às de administração. */
export const CLIENT_AREA_PREFIX = "client_";
export const isClientArea = (key: string): boolean =>
  key.startsWith(CLIENT_AREA_PREFIX);

export const ALL_AREAS: AreaDef[] = AREA_GROUPS.flatMap(g => g.areas);
export const GRANTABLE_AREAS = ALL_AREAS.filter(a => a.available);
export type AreaKey = string;

/** Área que nunca entra em "todas as áreas": só se concede à parte. */
export const OUTSIDE_ALL_AREAS = "admin_users";

/**
 * Áreas que **só o admin master concede**, uma a uma: ficam fora de "todas as áreas" e do perfil Administrador, e
 * nem outro admin completo as tem (o master as libera pessoa por pessoa).
 */
export const MASTER_ONLY_AREAS: readonly string[] = [
  "admin_templates",
  "admin_users_existing",
];
export const isMasterOnlyArea = (key: string): boolean =>
  MASTER_ONLY_AREAS.includes(key);

export const areaDef = (key: string): AreaDef | undefined =>
  ALL_AREAS.find(a => a.key === key);

export const isGrantableArea = (key: string): boolean =>
  GRANTABLE_AREAS.some(a => a.key === key);

/**
 * Áreas que têm página em /admin (as que mostram o painel /admin para quem tem ao menos uma). As que só o master
 * concede não têm página própria: editar templates é pela galeria em Criador de Sites e "Usuários já cadastrados"
 * vale dentro de Usuários.
 */
export const ADMIN_AREA_KEYS = GRANTABLE_AREAS.filter(
  a => !(isMasterOnlyArea(a.key) || isClientArea(a.key))
).map(a => a.key);

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
    const masterOnly = isMasterOnlyArea(area.key);
    if (input.profile === "admin") {
      levels[area.key] = masterOnly ? "none" : "edit";
      continue;
    }
    levels[area.key] =
      input.accessAll && area.key !== OUTSIDE_ALL_AREAS && !masterOnly
        ? input.accessAll
        : "none";
  }
  for (const p of input.permissions) {
    if (!isGrantableArea(p.area)) continue;
    // Administrador tem tudo, menos o que só o master libera: essas áreas valem só pela permissão dada à pessoa.
    if (input.profile === "admin" && !isMasterOnlyArea(p.area)) continue;
    levels[p.area] = p.level;
  }
  return levels;
}
