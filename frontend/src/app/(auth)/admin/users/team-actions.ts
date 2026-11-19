"use server";

import { and, eq, ilike, inArray, isNull, ne, or, sql } from "drizzle-orm";
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
import {
  type AreaLevel,
  covers,
  isMasterOnlyArea,
  type Level,
} from "@/lib/permissions/catalog";
import { type GrantInput, normalizeGrant } from "@/lib/permissions/grant";
import { isMasterAdmin } from "@/lib/permissions/master";
import {
  getAdminMode,
  setAdminMode,
  VALIDATION_MODES,
  type ValidationMode,
} from "@/lib/site-builder/delegation";

type Result = { error: string; ok: false } | { ok: true };

export interface TeamUserInput extends GrantInput {
  email: string;
  name: string;
  /** Criar: obrigatória. Editar: vazia mantém a senha; preenchida troca e derruba as sessões. */
  password: string;
  /**
   * Como as alterações desta pessoa em sites de clientes são validadas (só vale com "Editar templates", e só o master
   * muda). Ausente = não mexe no que já está.
   */
  validation?: ValidationMode;
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
  /** Admin master: único que libera áreas como "Editar templates". */
  master: boolean;
} | null> {
  const actor = await getRealUser();
  const levels = await levelsFor(actor);
  if (!covers(levels.admin_users ?? "none", "edit")) return null;
  return {
    actor,
    full: actor.isAdmin === true,
    levels,
    master: isMasterAdmin(actor),
  };
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

const EXISTING_FORBIDDEN = {
  error: "Você não tem permissão para dar acesso a usuários já cadastrados.",
  ok: false as const,
};

/**
 * Quem pode mexer em contas que já existiam: o master e os admins a quem o master liberou "Usuários já
 * cadastrados" (ele também precisa editar Usuários, que é o que abre esta tela).
 */
async function existingContext() {
  const ctx = await actorContext();
  if (!ctx) return null;
  const allowed =
    ctx.master || covers(ctx.levels.admin_users_existing ?? "none", "edit");
  return allowed ? ctx : null;
}

const TEAM_ORG = / \(equipe\)$/;

/**
 * A conta foi criada pela equipe (a organização dela se chama "Nome (equipe)")? Qualquer outra, e na dúvida, é uma
 * conta que já existia: nome e senha dela não se mexem, e retirar o acesso não suspende a conta.
 */
async function createdByTeam(userId: string): Promise<boolean> {
  try {
    const [u] = await db
      .select({ orgId: pgUser.organizationId })
      .from(pgUser)
      .where(eq(pgUser.id, userId))
      .limit(1);
    if (!u?.orgId) return false;
    const [o] = await db
      .select({ name: pgOrganization.name })
      .from(pgOrganization)
      .where(eq(pgOrganization.id, u.orgId))
      .limit(1);
    return TEAM_ORG.test(o?.name ?? "");
  } catch {
    return false;
  }
}

/**
 * Grava o modo de validação da pessoa. Só o master, só quem tem "Editar templates" (sem essa permissão o modo não
 * vale e volta ao padrão, automática). Devolve uma mensagem de erro, ou `null` se deu certo ou não havia o que fazer.
 */
async function saveValidation(
  ctx: { actor: User; master: boolean },
  userId: string,
  hasTemplates: boolean,
  validation: ValidationMode | undefined
): Promise<string | null> {
  if (!ctx.master || validation === undefined) return null;
  if (!VALIDATION_MODES.includes(validation)) return "Validação inválida.";
  try {
    await setAdminMode(
      userId,
      hasTemplates ? validation : "auto",
      ctx.actor.id
    );
    return null;
  } catch (error) {
    console.error("[equipe] falha ao salvar a validação:", error);
    return "Os acessos foram salvos, mas não foi possível salvar como validar as alterações dele nos sites de clientes.";
  }
}

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
  const grant = normalizeGrant(input, ctx.levels, { master: ctx.master });
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
  let createdId = "";
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
      createdId = user.id;
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
  const failed = await saveValidation(
    ctx,
    createdId,
    grant.value.permissions.some(p => p.area === "admin_templates"),
    input.validation
  );
  revalidatePath(PATH);
  return failed ? { error: failed, ok: false } : { ok: true };
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
  // Conta que já existia: só quem tem "Usuários já cadastrados" mexe nos acessos dela, e nome e senha ficam como estão.
  const own = await createdByTeam(userId);
  if (!own && !(await existingContext())) return EXISTING_FORBIDDEN;
  const basics = checkBasics(
    own ? input : { ...input, name: "Conta existente", password: "" },
    false
  );
  if (basics) return { error: basics, ok: false };
  const grant = normalizeGrant(input, ctx.levels, { master: ctx.master });
  if (!grant.ok) return grant;

  const password = own && input.password ? await hash(input.password) : null;
  try {
    await db.transaction(async tx => {
      if (own) {
        await tx
          .update(pgUser)
          .set({
            name: input.name.trim(),
            updatedAt: new Date(),
            ...(password ? { password } : {}),
          })
          .where(eq(pgUser.id, userId));
      }
      await tx
        .update(pgUserAccess)
        .set({
          accessAll: grant.value.accessAll,
          profile: grant.value.profile,
          updatedAt: new Date(),
        })
        .where(eq(pgUserAccess.userId, userId));
      // Quem edita e não é o master não mexe no que só o master libera (editar templates): essas linhas ficam como estão.
      const kept = ctx.master
        ? []
        : (
            await tx
              .select({
                area: pgUserAreaPermission.area,
                level: pgUserAreaPermission.level,
              })
              .from(pgUserAreaPermission)
              .where(eq(pgUserAreaPermission.userId, userId))
          ).filter(r => isMasterOnlyArea(r.area));
      await tx
        .delete(pgUserAreaPermission)
        .where(eq(pgUserAreaPermission.userId, userId));
      const rows = [
        ...grant.value.permissions.filter(
          p => ctx.master || !isMasterOnlyArea(p.area)
        ),
        ...kept,
      ];
      if (rows.length > 0) {
        await tx
          .insert(pgUserAreaPermission)
          .values(rows.map(p => ({ area: p.area, level: p.level, userId })));
      }
    });
    if (password) await invalidateAllSessions(userId);
  } catch (error) {
    console.error("[equipe] falha ao atualizar usuário:", error);
    return { error: "Não foi possível salvar as alterações.", ok: false };
  }
  // Só o master muda a validação (e só ele concede "Editar templates"): para os demais isto não faz nada.
  const hasTemplates = grant.value.permissions.some(
    p => p.area === "admin_templates"
  );
  const failed = await saveValidation(
    ctx,
    userId,
    hasTemplates,
    input.validation
  );
  revalidatePath(PATH);
  return failed ? { error: failed, ok: false } : { ok: true };
}

export interface ExistingUserHit {
  email: string;
  id: string;
  name: string;
}

/** Procura contas que já existem (por nome ou e-mail) e ainda não têm acesso de equipe. */
export async function searchExistingUsersAction(
  query: string
): Promise<
  { ok: true; users: ExistingUserHit[] } | { error: string; ok: false }
> {
  const ctx = await existingContext();
  if (!ctx) return { error: EXISTING_FORBIDDEN.error, ok: false };
  const q = typeof query === "string" ? query.trim() : "";
  if (q.length < 2 || q.length > 100) {
    return {
      error: "Digite ao menos 2 letras do nome ou do e-mail.",
      ok: false,
    };
  }
  const like = `%${q.replace(/[\\%_]/g, m => `\\${m}`)}%`;
  try {
    const users = await db
      .select({ email: pgUser.email, id: pgUser.id, name: pgUser.name })
      .from(pgUser)
      .where(
        and(
          isNull(pgUser.deletedAt),
          isNull(pgUser.suspendedAt),
          eq(pgUser.isAdmin, false),
          ne(pgUser.id, ctx.actor.id),
          or(ilike(pgUser.name, like), ilike(pgUser.email, like)),
          sql`not exists (select 1 from user_access ua where ua.user_id = ${pgUser.id})`
        )
      )
      .orderBy(pgUser.name)
      .limit(15);
    return { ok: true, users };
  } catch (error) {
    console.error("[equipe] falha ao procurar usuários:", error);
    return { error: "Não foi possível procurar agora.", ok: false };
  }
}

export interface ExistingGrantInput extends GrantInput {
  validation?: ValidationMode;
}

/**
 * Dá acesso de equipe a uma conta que já existe (cliente ou outra pessoa), sem criar conta nem mexer em nome e
 * senha. As mesmas regras valem: ninguém concede mais do que tem, e o que só o master libera continua só dele.
 */
export async function grantExistingUserAction(
  userId: string,
  input: ExistingGrantInput
): Promise<Result> {
  const ctx = await existingContext();
  if (!ctx) return EXISTING_FORBIDDEN;
  const grant = normalizeGrant(input, ctx.levels, { master: ctx.master });
  if (!grant.ok) return grant;
  if (typeof userId !== "string" || userId === ctx.actor.id) {
    return { error: "Escolha outra pessoa.", ok: false };
  }
  try {
    const [target] = await db
      .select({
        deletedAt: pgUser.deletedAt,
        id: pgUser.id,
        isAdmin: pgUser.isAdmin,
        suspendedAt: pgUser.suspendedAt,
      })
      .from(pgUser)
      .where(eq(pgUser.id, userId))
      .limit(1);
    if (!target || target.deletedAt || target.suspendedAt) {
      return { error: "Usuário não encontrado.", ok: false };
    }
    if (target.isAdmin) {
      return {
        error: "Esta conta já é de administrador completo.",
        ok: false,
      };
    }
    const [already] = await db
      .select({ id: pgUserAccess.userId })
      .from(pgUserAccess)
      .where(eq(pgUserAccess.userId, userId))
      .limit(1);
    if (already) {
      return {
        error: "Esta pessoa já tem acesso de equipe: edite na lista.",
        ok: false,
      };
    }
    await db.transaction(async tx => {
      await tx.insert(pgUserAccess).values({
        accessAll: grant.value.accessAll,
        parentUserId: ctx.actor.id,
        profile: grant.value.profile,
        userId,
      });
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
  } catch (error) {
    console.error("[equipe] falha ao dar acesso a conta existente:", error);
    return { error: "Não foi possível dar o acesso.", ok: false };
  }
  const failed = await saveValidation(
    ctx,
    userId,
    grant.value.permissions.some(p => p.area === "admin_templates"),
    input.validation
  );
  revalidatePath(PATH);
  return failed ? { error: failed, ok: false } : { ok: true };
}

/** Remove o acesso: derruba as sessões, tira a senha e as permissões, e suspende a conta (o histórico fica). */
export async function removeTeamUserAction(userId: string): Promise<Result> {
  const ctx = await actorContext();
  if (!ctx) return FORBIDDEN;
  if (!(await inScope(ctx, userId))) {
    return { error: "Usuário não encontrado na sua equipe.", ok: false };
  }
  // Conta que já existia: retirar o acesso só tira as permissões de equipe. A conta continua a mesma (sem suspender,
  // sem apagar a senha nem derrubar as sessões), porque a pessoa segue sendo cliente.
  if (!(await createdByTeam(userId))) {
    if (!(await existingContext())) return EXISTING_FORBIDDEN;
    try {
      await db.transaction(async tx => {
        await tx
          .delete(pgUserAreaPermission)
          .where(eq(pgUserAreaPermission.userId, userId));
        await tx.delete(pgUserAccess).where(eq(pgUserAccess.userId, userId));
      });
    } catch (error) {
      console.error("[equipe] falha ao retirar o acesso:", error);
      return { error: "Não foi possível retirar o acesso.", ok: false };
    }
    revalidatePath(PATH);
    return { ok: true };
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
  /** Conta que já existia antes de entrar na equipe (nome e senha não se mexem; retirar o acesso não a suspende). */
  existing: boolean;
  id: string;
  name: string;
  parentName: string | null;
  permissions: { area: string; level: AreaLevel }[];
  profile: "admin" | "editor" | "viewer";
  suspended: boolean;
  /** Como as alterações dele em sites de clientes são validadas (só quem tem "Editar templates"). */
  validation: ValidationMode;
}

/** Equipe visível para quem chama: admin completo vê toda; usuário de equipe vê só quem criou (e a árvore dele). */
export async function listTeamUsers(): Promise<{
  /** Quem está vendo pode dar acesso a contas que já existem. */
  canExisting: boolean;
  levels: Record<string, Level>;
  /** Quem está vendo é o admin master (único que escolhe como validar as alterações dos admins). */
  master: boolean;
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
    const teamOrgs = new Set<string>();
    if (visible.length > 0) {
      const orgs = await db
        .select({ id: pgUser.id, name: pgOrganization.name })
        .from(pgUser)
        .innerJoin(pgOrganization, eq(pgOrganization.id, pgUser.organizationId))
        .where(
          inArray(
            pgUser.id,
            visible.map(r => r.id)
          )
        );
      for (const o of orgs) if (TEAM_ORG.test(o.name)) teamOrgs.add(o.id);
    }
    const modes = await Promise.all(
      visible.map(async r =>
        perms.some(p => p.userId === r.id && p.area === "admin_templates")
          ? await getAdminMode(r.id)
          : ("auto" as const)
      )
    );
    return {
      canExisting:
        ctx.master || covers(ctx.levels.admin_users_existing ?? "none", "edit"),
      levels: ctx.levels,
      master: ctx.master,
      rows: visible.map((r, i) => ({
        accessAll: r.accessAll,
        email: r.email,
        existing: !teamOrgs.has(r.id),
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
        validation: modes[i] ?? "auto",
      })),
    };
  } catch (error) {
    // Tabelas ainda não criadas: a tela mostra a lista vazia em vez de cair.
    console.error("[equipe] não foi possível listar a equipe:", error);
    return {
      canExisting: false,
      levels: ctx.levels,
      master: ctx.master,
      rows: [],
    };
  }
}
