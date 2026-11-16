import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getRealUser, getUser } from "@/lib/auth/index";
import { db } from "@/lib/db";
import { pgUserAccess, pgUserAreaPermission, type User } from "@/lib/db/schema";
import {
  type AccessProfile,
  ADMIN_AREA_KEYS,
  type AreaLevel,
  covers,
  GRANTABLE_AREAS,
  isMasterOnlyArea,
  type Level,
  resolveLevels,
} from "./catalog";
import { isMasterAdmin } from "./master";

export interface TeamAccess {
  accessAll: AreaLevel | null;
  levels: Record<string, Level>;
  parentUserId: string | null;
  profile: AccessProfile;
}

/**
 * Acesso de um usuário de equipe, ou `null` se ele não é de equipe (cliente comum ou admin completo) — e
 * também se as tabelas ainda não existem ou a consulta falha: nesse caso ele não ganha acesso nenhum
 * (fecha, nunca abre). Cache por requisição.
 */
export const loadTeamAccess = cache(
  async (userId: string): Promise<TeamAccess | null> => {
    try {
      const [access] = await db
        .select()
        .from(pgUserAccess)
        .where(eq(pgUserAccess.userId, userId))
        .limit(1);
      if (!access) return null;
      const permissions = await db
        .select({
          area: pgUserAreaPermission.area,
          level: pgUserAreaPermission.level,
        })
        .from(pgUserAreaPermission)
        .where(eq(pgUserAreaPermission.userId, userId));
      return {
        accessAll: access.accessAll,
        levels: resolveLevels({
          accessAll: access.accessAll,
          permissions,
          profile: access.profile,
        }),
        parentUserId: access.parentUserId,
        profile: access.profile,
      };
    } catch (error) {
      // Tabelas ainda não criadas (migration pendente): sem acesso de equipe, em silêncio — esta consulta roda
      // em toda página de cliente e um log por requisição só faria barulho.
      const code =
        (error as { code?: string }).code ??
        (error as { cause?: { code?: string } }).cause?.code;
      if (code !== "42P01") {
        console.error("[permissions] não foi possível ler o acesso:", error);
      }
      return null;
    }
  }
);

/** Admin completo (`isAdmin`) tem tudo; usuário de equipe tem o que foi liberado; o resto não tem nada. */
export async function levelFor(
  user: Pick<User, "email" | "id" | "isAdmin">,
  area: string
): Promise<Level> {
  if (user.isAdmin === true) {
    // O que só o master concede (editar templates) nem outro admin completo tem.
    return isMasterOnlyArea(area) && !isMasterAdmin(user) ? "none" : "edit";
  }
  const team = await loadTeamAccess(user.id);
  return team?.levels[area] ?? "none";
}

/** Nível em todas as áreas concedíveis (admin completo = edita tudo). */
export async function levelsFor(
  user: Pick<User, "email" | "id" | "isAdmin">
): Promise<Record<string, Level>> {
  if (user.isAdmin === true) {
    const master = isMasterAdmin(user);
    return Object.fromEntries(
      GRANTABLE_AREAS.map(a => [
        a.key,
        (isMasterOnlyArea(a.key) && !master ? "none" : "edit") as Level,
      ])
    );
  }
  const team = await loadTeamAccess(user.id);
  return team?.levels ?? {};
}

export async function hasAreaAccess(
  user: Pick<User, "email" | "id" | "isAdmin"> | null | undefined,
  area: string,
  min: AreaLevel = "view"
): Promise<boolean> {
  if (!user) return false;
  return covers(await levelFor(user, area), min);
}

/** Tem acesso a ao menos uma área de administração (mostra o painel /admin e o botão na sidebar). */
export async function hasAnyAdminArea(
  user: Pick<User, "id" | "isAdmin"> | null | undefined
): Promise<boolean> {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  const team = await loadTeamAccess(user.id);
  return ADMIN_AREA_KEYS.some(k => (team?.levels[k] ?? "none") !== "none");
}

/** Áreas de administração que o usuário enxerga (para filtrar o painel /admin): "all" para admin completo. */
export async function viewableAdminAreas(
  user: Pick<User, "id" | "isAdmin">
): Promise<"all" | string[]> {
  if (user.isAdmin === true) return "all";
  const team = await loadTeamAccess(user.id);
  return ADMIN_AREA_KEYS.filter(k => (team?.levels[k] ?? "none") !== "none");
}

/** Páginas de administração: sem acesso à área, vai para /home. */
export async function requireAreaPage(
  area: string,
  min: AreaLevel = "view"
): Promise<User> {
  const user = await getUser();
  if (!(await hasAreaAccess(user, area, min))) redirect("/home");
  return user;
}

/**
 * Server actions de administração. Server Actions são POSTs públicos: a checagem tem que estar na própria
 * ação. Usa o usuário real (ignora impersonação), como as demais ações de admin.
 */
export async function requireAreaAction(
  area: string,
  min: AreaLevel = "edit"
): Promise<User | null> {
  const user = await getRealUser();
  return (await hasAreaAccess(user, area, min)) ? user : null;
}
