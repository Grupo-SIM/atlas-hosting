import {
  type AccessProfile,
  type AreaLevel,
  covers,
  GRANTABLE_AREAS,
  isGrantableArea,
  type Level,
  OUTSIDE_ALL_AREAS,
} from "./catalog";

export interface GrantInput {
  accessAll: AreaLevel | null;
  permissions: { area: string; level: string }[];
  profile: string;
}

export interface NormalizedGrant {
  accessAll: AreaLevel | null;
  permissions: { area: string; level: AreaLevel }[];
  profile: AccessProfile;
}

export type GrantResult =
  | { ok: false; error: string }
  | { ok: true; value: NormalizedGrant };

const PROFILES: AccessProfile[] = ["viewer", "editor", "admin"];

/**
 * Valida o que quem está concedendo quer dar. Regra de ouro: **ninguém concede mais do que tem**. `actorLevels`
 * é o nível de quem concede em cada área (admin completo = "edit" em tudo).
 *
 * - Visualizador: tudo vira "view". Editor: cada área em "view" ou "edit". Administrador: edita tudo, inclusive
 *   Usuários; só quem já edita todas as áreas pode conceder esse perfil.
 * - "Todas as áreas" dá o nível do perfil a todas as áreas (inclusive as futuras), menos Usuários; exige que
 *   quem concede tenha esse nível em todas elas.
 * - Área inexistente ou "em breve" é recusada (não concede de mentira).
 */
export function normalizeGrant(
  input: GrantInput,
  actorLevels: Record<string, Level>
): GrantResult {
  if (!PROFILES.includes(input.profile as AccessProfile)) {
    return { error: "Perfil inválido.", ok: false };
  }
  const profile = input.profile as AccessProfile;
  const actorHas = (area: string, needed: AreaLevel) =>
    covers(actorLevels[area] ?? "none", needed);

  if (profile === "admin") {
    if (!GRANTABLE_AREAS.every(a => actorHas(a.key, "edit"))) {
      return {
        error:
          "Você só pode criar um Administrador se editar todas as áreas, inclusive Usuários.",
        ok: false,
      };
    }
    return {
      ok: true,
      value: { accessAll: null, permissions: [], profile },
    };
  }

  const wanted = (level: string): AreaLevel =>
    profile === "viewer" ? "view" : level === "edit" ? "edit" : "view";

  const seen = new Map<string, AreaLevel>();
  for (const p of input.permissions) {
    if (!isGrantableArea(p.area)) {
      return {
        error: `Área inválida ou ainda indisponível: ${p.area}.`,
        ok: false,
      };
    }
    if (p.level !== "view" && p.level !== "edit") {
      return { error: "Nível inválido.", ok: false };
    }
    const level = wanted(p.level);
    if (!actorHas(p.area, level)) {
      return {
        error: "Você não pode conceder um acesso maior do que o seu.",
        ok: false,
      };
    }
    seen.set(p.area, level);
  }

  let accessAll: AreaLevel | null = null;
  if (input.accessAll) {
    if (input.accessAll !== "view" && input.accessAll !== "edit") {
      return { error: "Nível inválido.", ok: false };
    }
    accessAll = wanted(input.accessAll);
    const missing = GRANTABLE_AREAS.filter(
      a =>
        a.key !== OUTSIDE_ALL_AREAS && !actorHas(a.key, accessAll as AreaLevel)
    );
    if (missing.length > 0) {
      return {
        error:
          "Você não pode liberar todas as áreas: há áreas em que o seu acesso é menor.",
        ok: false,
      };
    }
  }

  if (!accessAll && seen.size === 0) {
    return { error: "Escolha ao menos uma área.", ok: false };
  }

  return {
    ok: true,
    value: {
      accessAll,
      permissions: [...seen].map(([area, level]) => ({ area, level })),
      profile,
    },
  };
}
