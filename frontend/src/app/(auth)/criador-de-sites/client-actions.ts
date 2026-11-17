"use server";

import { and, desc, eq, ilike, isNull, ne, or, sql } from "drizzle-orm";
import { getRealUser } from "@/lib/auth/index";
import { db } from "@/lib/db";
import {
  pgBuilderPublication,
  pgBuilderSite,
  pgUser,
  type User,
} from "@/lib/db/schema";
import { hasAreaAccess } from "@/lib/permissions/access";
import { isMasterAdmin } from "@/lib/permissions/master";
import type { ClientSiteStatus } from "@/lib/site-builder/delegation";
import {
  clientSiteStatus,
  type DelegatedAdmin,
  isUuid,
  listDelegatedAdmins,
  setAdminMode,
  VALIDATION_MODES,
  type ValidationMode,
} from "@/lib/site-builder/delegation";
import { templateName } from "@/lib/template-exclusivity/names";

export type { ClientSiteStatus };

export interface ClientRow {
  email: string;
  id: string;
  name: string;
  siteCount: number;
}

export interface ClientSiteRow {
  domain: string | null;
  id: string;
  name: string;
  status: ClientSiteStatus;
  template: string;
  updatedAt: string;
}

interface Failure {
  error: string;
  ok: false;
}

const FORBIDDEN = "Você não tem acesso aos sites dos clientes.";
const MAX_RESULTS = 20;

/** Quem vê os sites dos clientes: o admin master e quem ele liberou ("Editar templates"), usuário real. */
async function viewer(): Promise<User | null> {
  const user = await getRealUser();
  return (await hasAreaAccess(user, "admin_templates", "view")) ? user : null;
}

/** Trata `%`, `_` e `\` da busca como texto, não como curinga. */
const likeTerm = (value: string) =>
  `%${value.replace(/[\\%_]/g, m => `\\${m}`)}%`;

/** Busca clientes cadastrados por nome ou e-mail (sem busca: os que mexeram em sites há mais pouco). */
export async function searchClients(
  query: string
): Promise<{ ok: true; rows: ClientRow[] } | Failure> {
  const user = await viewer();
  if (!user) return { error: FORBIDDEN, ok: false };
  const term = String(query ?? "")
    .trim()
    .slice(0, 80);

  const sites = sql<number>`count(${pgBuilderSite.id})::int`;
  const base = and(
    isNull(pgUser.deletedAt),
    ne(pgUser.id, user.id),
    term
      ? or(
          ilike(pgUser.email, likeTerm(term)),
          ilike(pgUser.name, likeTerm(term))
        )
      : undefined
  );
  const rows = await db
    .select({
      email: pgUser.email,
      id: pgUser.id,
      name: pgUser.name,
      siteCount: sites,
    })
    .from(pgUser)
    .leftJoin(pgBuilderSite, eq(pgBuilderSite.userId, pgUser.id))
    .where(base)
    .groupBy(pgUser.id)
    .orderBy(
      term ? pgUser.name : desc(sql`max(${pgBuilderSite.updatedAt})`),
      pgUser.name
    )
    .limit(MAX_RESULTS);
  return { ok: true, rows };
}

/** Todos os sites de um cliente, com o estado de cada um. */
export async function listClientSites(
  userId: string
): Promise<{ ok: true; rows: ClientSiteRow[] } | Failure> {
  const user = await viewer();
  if (!user) return { error: FORBIDDEN, ok: false };
  if (!isUuid(userId)) return { error: "Cliente não encontrado.", ok: false };
  const rows = await db
    .select({
      domain: pgBuilderPublication.domain,
      id: pgBuilderSite.id,
      name: pgBuilderSite.name,
      publicationStatus: pgBuilderPublication.status,
      publishedAt: pgBuilderPublication.publishedAt,
      templateId: pgBuilderSite.templateId,
      updatedAt: pgBuilderSite.updatedAt,
    })
    .from(pgBuilderSite)
    .leftJoin(
      pgBuilderPublication,
      eq(pgBuilderPublication.siteId, pgBuilderSite.id)
    )
    .where(eq(pgBuilderSite.userId, userId))
    .orderBy(desc(pgBuilderSite.updatedAt));
  return {
    ok: true,
    rows: rows.map(r => ({
      domain: r.domain,
      id: r.id,
      name: r.name,
      status: clientSiteStatus(r),
      template: templateName(r.templateId),
      updatedAt: r.updatedAt.toISOString(),
    })),
  };
}

/** Os admins liberados pelo master e como cada um é validado. Só o admin master vê e muda. */
export async function getAdminValidation(): Promise<
  { admins: DelegatedAdmin[]; ok: true } | Failure
> {
  const user = await getRealUser();
  if (!isMasterAdmin(user)) {
    return { error: "Só o admin master vê esta configuração.", ok: false };
  }
  try {
    return { admins: await listDelegatedAdmins(), ok: true };
  } catch (error) {
    console.error("[delegação] não foi possível listar os admins:", error);
    return { error: "Não foi possível carregar os admins.", ok: false };
  }
}

/** Só o admin master escolhe como as alterações de cada admin são validadas. */
export async function setAdminValidation(
  adminId: string,
  mode: ValidationMode
): Promise<{ ok: true } | Failure> {
  const user = await getRealUser();
  if (!isMasterAdmin(user)) {
    return { error: "Só o admin master altera esta regra.", ok: false };
  }
  if (!(isUuid(adminId) && VALIDATION_MODES.includes(mode))) {
    return { error: "Dados inválidos.", ok: false };
  }
  // Só admins liberados pelo master (têm "Editar templates") entram nesta regra.
  const admins = await listDelegatedAdmins();
  if (!admins.some(a => a.id === adminId)) {
    return { error: "Admin não encontrado.", ok: false };
  }
  try {
    await setAdminMode(adminId, mode, user.id);
    return { ok: true };
  } catch (error) {
    console.error("[delegação] não foi possível salvar o modo:", error);
    return { error: "Não foi possível salvar.", ok: false };
  }
}
