"use server";

import { and, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getRealUser } from "@/lib/auth/index";
import { hash } from "@/lib/auth/scrypt";
import { generateAffiliateCode, invalidateAllSessions } from "@/lib/auth/utils";
import { db } from "@/lib/db";
import {
  pgOrganization,
  pgUser,
  pgUserAccess,
  pgUserAreaPermission,
  pgWallet,
  type User,
  userSettings,
} from "@/lib/db/schema";
import { levelsFor } from "@/lib/permissions/access";
import { type AreaLevel, covers, type Level } from "@/lib/permissions/catalog";
import { type GrantInput, normalizeGrant } from "@/lib/permissions/grant";

type Result = { error: string; ok: false } | { ok: true };

export interface TeamUserInput extends GrantInput {
  email: string;
  name: string;
  /** Criar: obrigatória. Editar: vazia mantém a senha; preenchida troca e derruba as sessões. */
  password: string;
}

const PATH = "/admin/users";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Quem gerencia a equipe: admin completo ou usuário de equipe que **edita** Usuários. Server Actions são POSTs
 * públicos, então toda ação refaz esta checagem; o teto de cada concessão vem dos níveis de quem chama.
 */
async function actorContext(): Promise<{
  actor: User;
  full: boolean;
  levels: Record<string, Level>;
} | null> {
  const actor = await getRealUser();
  const levels = await levelsFor(actor);
  if (!covers(levels.admin_users ?? "none", "edit")) return null;
  return { actor, full: actor.isAdmin === true, levels };
}

/** O alvo é de equipe e está na árvore de quem chama (admin completo alcança qualquer um da equipe). */
async function inScope(
  ctx: { actor: User; full: boolean },
  targetId: string
): Promise<boolean> {
  if (targetId === ctx.actor.id) return false;
  let cursor: string | null = targetId;
  for (let hops = 0; hops < 12 && cursor; hops++) {
    const [row] = await db
      .select({ parent: pgUserAccess.parentUserId })
      .from(pgUserAccess)
      .where(eq(pgUserAccess.userId, cursor))
      .limit(1);
    if (!row) return false;
    if (ctx.full || row.parent === ctx.actor.id) return true;
    cursor = row.parent;
  }
  return false;
}

const FORBIDDEN: Result = {
  error: "Você não tem permissão para gerenciar usuários.",
  ok: false,
};

function checkBasics(input: TeamUserInput, creating: boolean): string | null {
  const name = input.name.trim();
  if (name.length < 2 || name.length > 120)
    return "Informe o nome (2 a 120 letras).";
  if (!EMAIL.test(input.email.trim()) || input.email.length > 200)
    return "Informe um e-mail válido.";
  if (creating || input.password) {
    if (input.password.length < 8 || input.password.length > 128)
      return "A senha precisa ter de 8 a 128 caracteres.";
  }
  return null;
}

export async function createTeamUserAction(
  input: TeamUserInput
): Promise<Result> {
  const ctx = await actorContext();
  if (!ctx) return FORBIDDEN;
  const basics = checkBasics(input, true);
  if (basics) return { error: basics, ok: false };
  const grant = normalizeGrant(input, ctx.levels);
  if (!grant.ok) return grant;

  const email = input.email.trim().toLowerCase();
  const [existing] = await db
    .select({ id: pgUser.id })
    .from(pgUser)
    .where(sql`lower(${pgUser.email}) = ${email}`)
    .limit(1);
  if (existing) return { error: "Este e-mail já está cadastrado.", ok: false };

  const name = input.name.trim();
  const password = await hash(input.password);
  try {
    await db.transaction(async tx => {
      const [wallet] = await tx
        .insert(pgWallet)
        .values({ balance: 0, createdAt: new Date(), updatedAt: new Date() })
        .returning();
      const [org] = await tx
        .insert(pgOrganization)
        .values({ name: `${name} (equipe)`, walletId: wallet.id })
        .returning();
      const [user] = await tx
        .insert(pgUser)
        .values({
          affiliateCode: generateAffiliateCode(),
          createdAt: new Date(),
          // Quem cria vouch pela pessoa: sem e-mail de verificação, ela já entra com a senha definida.
          email,
          emailVerified: new Date(),
          name,
          organizationId: org.id,
          organizationRole: "admin",
          password,
          updatedAt: new Date(),
        })
        .returning({ id: pgUser.id });
      await tx.insert(userSettings).values({
        createdAt: new Date(),
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        updatedAt: new Date(),
        userId: user.id,
      });
      await tx
        .update(pgOrganization)
        .set({ ownerId: user.id })
        .where(eq(pgOrganization.id, org.id));
      await tx.insert(pgUserAccess).values({
        accessAll: grant.value.accessAll,
        parentUserId: ctx.actor.id,
        profile: grant.value.profile,
        userId: user.id,
      });
      if (grant.value.permissions.length > 0) {
        await tx.insert(pgUserAreaPermission).values(
          grant.value.permissions.map(p => ({
            area: p.area,
            level: p.level,
            userId: user.id,
          }))
        );
      }
    });
  } catch (error) {
    console.error("[equipe] falha ao criar usuário:", error);
    return { error: "Não foi possível criar o usuário.", ok: false };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export async function updateTeamUserAction(
  userId: string,
  input: TeamUserInput
): Promise<Result> {
  const ctx = await actorContext();
  if (!ctx) return FORBIDDEN;
  if (!(await inScope(ctx, userId))) {
    return { error: "Usuário não encontrado na sua equipe.", ok: false };
  }
  const basics = checkBasics(input, false);
  if (basics) return { error: basics, ok: false };
  const grant = normalizeGrant(input, ctx.levels);
  if (!grant.ok) return grant;

  const password = input.password ? await hash(input.password) : null;
  try {
    await db.transaction(async tx => {
      await tx
        .update(pgUser)
        .set({
          name: input.name.trim(),
          updatedAt: new Date(),
          ...(password ? { password } : {}),
        })
        .where(eq(pgUser.id, userId));
      await tx
        .update(pgUserAccess)
        .set({
          accessAll: grant.value.accessAll,
          profile: grant.value.profile,
          updatedAt: new Date(),
        })
        .where(eq(pgUserAccess.userId, userId));
      await tx
        .delete(pgUserAreaPermission)
        .where(eq(pgUserAreaPermission.userId, userId));
      if (grant.value.permissions.length > 0) {
        await tx.insert(pgUserAreaPermission).values(
          grant.value.permissions.map(p => ({
            area: p.area,
            level: p.level,
            userId,
          }))
        );
      }
    });
    if (password) await invalidateAllSessions(userId);
  } catch (error) {
    console.error("[equipe] falha ao atualizar usuário:", error);
    return { error: "Não foi possível salvar as alterações.", ok: false };
  }
  revalidatePath(PATH);
  return { ok: true };
}

/** Remove o acesso: derruba as sessões, tira a senha e as permissões, e suspende a conta (o histórico fica). */
export async function removeTeamUserAction(userId: string): Promise<Result> {
  const ctx = await actorContext();
  if (!ctx) return FORBIDDEN;
  if (!(await inScope(ctx, userId))) {
    return { error: "Usuário não encontrado na sua equipe.", ok: false };
  }
  try {
    // Quem foi criado por esta pessoa fica sem responsável, mas continua com o próprio acesso.
    await db.transaction(async tx => {
      await tx
        .delete(pgUserAreaPermission)
        .where(eq(pgUserAreaPermission.userId, userId));
      await tx.delete(pgUserAccess).where(eq(pgUserAccess.userId, userId));
      await tx
        .update(pgUser)
        .set({
          deletedAt: new Date(),
          password: null,
          suspendedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(eq(pgUser.id, userId), eq(pgUser.isAdmin, false)));
    });
    await invalidateAllSessions(userId);
  } catch (error) {
    console.error("[equipe] falha ao remover usuário:", error);
    return { error: "Não foi possível remover o usuário.", ok: false };
  }
  revalidatePath(PATH);
  return { ok: true };
}

export interface TeamUserRow {
  accessAll: AreaLevel | null;
  email: string;
  id: string;
  name: string;
  parentName: string | null;
  permissions: { area: string; level: AreaLevel }[];
  profile: "admin" | "editor" | "viewer";
  suspended: boolean;
}

/** Equipe visível para quem chama: admin completo vê toda; usuário de equipe vê só quem criou (e a árvore dele). */
export async function listTeamUsers(): Promise<{
  levels: Record<string, Level>;
  rows: TeamUserRow[];
} | null> {
  const ctx = await actorContext();
  if (!ctx) return null;
  try {
    const all = await db
      .select({
        accessAll: pgUserAccess.accessAll,
        email: pgUser.email,
        id: pgUser.id,
        name: pgUser.name,
        parentUserId: pgUserAccess.parentUserId,
        profile: pgUserAccess.profile,
        suspendedAt: pgUser.suspendedAt,
      })
      .from(pgUserAccess)
      .innerJoin(pgUser, eq(pgUser.id, pgUserAccess.userId));
    const byId = new Map(all.map(r => [r.id, r]));
    const inTree = (id: string): boolean => {
      let cursor: string | null = id;
      for (let hops = 0; hops < 12 && cursor; hops++) {
        const row = byId.get(cursor);
        if (!row) return false;
        if (ctx.full || row.parentUserId === ctx.actor.id) return true;
        cursor = row.parentUserId;
      }
      return false;
    };
    const visible = all.filter(r => r.id !== ctx.actor.id && inTree(r.id));
    const perms = visible.length
      ? await db
          .select()
          .from(pgUserAreaPermission)
          .where(
            inArray(
              pgUserAreaPermission.userId,
              visible.map(r => r.id)
            )
          )
      : [];
    return {
      levels: ctx.levels,
      rows: visible.map(r => ({
        accessAll: r.accessAll,
        email: r.email,
        id: r.id,
        name: r.name,
        parentName: r.parentUserId
          ? (byId.get(r.parentUserId)?.name ?? null)
          : null,
        permissions: perms
          .filter(p => p.userId === r.id)
          .map(p => ({ area: p.area, level: p.level })),
        profile: r.profile,
        suspended: Boolean(r.suspendedAt),
      })),
    };
  } catch (error) {
    // Tabelas ainda não criadas: a tela mostra a lista vazia em vez de cair.
    console.error("[equipe] não foi possível listar a equipe:", error);
    return { levels: ctx.levels, rows: [] };
  }
}
