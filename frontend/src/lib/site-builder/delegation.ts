import { siteSchema } from "@repo/site-builder";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  type BuilderChangeComment,
  type BuilderChangeRequest,
  type BuilderSite,
  pgBuilderAdminValidation,
  pgBuilderChangeComment,
  pgBuilderChangeRequest,
  pgBuilderSite,
  pgUser,
  pgUserAreaPermission,
  type User,
} from "@/lib/db/schema";
import { hasAreaAccess } from "@/lib/permissions/access";
import { isMasterAdmin, MASTER_ADMIN_EMAIL } from "@/lib/permissions/master";
import { checkSiteContent } from "./site-content";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: string) => UUID_RE.test(value);

/** Como as alterações de um admin em sites de clientes são validadas. `auto` (padrão) vale na hora. */
export type ValidationMode = "auto" | "master" | "owner";
export const VALIDATION_MODES: ValidationMode[] = ["auto", "owner", "master"];

/**
 * Modo de validação do admin. Sem linha = **automática**. **Falha fechada**: se a tabela ainda não existe ou a leitura
 * falha, vale a validação do master — nunca "edita direto" por engano.
 */
export async function getAdminMode(userId: string): Promise<ValidationMode> {
  try {
    const [row] = await db
      .select({ mode: pgBuilderAdminValidation.mode })
      .from(pgBuilderAdminValidation)
      .where(eq(pgBuilderAdminValidation.userId, userId))
      .limit(1);
    return row?.mode ?? "auto";
  } catch (error) {
    console.error("[delegação] não foi possível ler o modo do admin:", error);
    return "master";
  }
}

export async function setAdminMode(
  userId: string,
  mode: ValidationMode,
  updatedBy: string
): Promise<void> {
  if (mode === "auto") {
    await db
      .delete(pgBuilderAdminValidation)
      .where(eq(pgBuilderAdminValidation.userId, userId));
    return;
  }
  await db
    .insert(pgBuilderAdminValidation)
    .values({ mode, updatedBy, userId })
    .onConflictDoUpdate({
      set: { mode, updatedAt: new Date(), updatedBy },
      target: pgBuilderAdminValidation.userId,
    });
}

export interface DelegatedAdmin {
  email: string;
  id: string;
  mode: ValidationMode;
  name: string;
}

/** Os admins que o master liberou (têm "Editar templates"), com o modo de validação de cada um. */
export async function listDelegatedAdmins(): Promise<DelegatedAdmin[]> {
  const admins = await db
    .selectDistinct({
      email: pgUser.email,
      id: pgUser.id,
      name: pgUser.name,
    })
    .from(pgUserAreaPermission)
    .innerJoin(pgUser, eq(pgUser.id, pgUserAreaPermission.userId))
    .where(eq(pgUserAreaPermission.area, "admin_templates"))
    .orderBy(asc(pgUser.name));
  if (admins.length === 0) return [];
  let modes: { mode: ValidationMode; userId: string }[] = [];
  try {
    modes = await db
      .select({
        mode: pgBuilderAdminValidation.mode,
        userId: pgBuilderAdminValidation.userId,
      })
      .from(pgBuilderAdminValidation)
      .where(
        inArray(
          pgBuilderAdminValidation.userId,
          admins.map(a => a.id)
        )
      );
  } catch (error) {
    console.error("[delegação] não foi possível ler os modos:", error);
  }
  const byUser = new Map(modes.map(m => [m.userId, m.mode]));
  return admins.map(a => ({ ...a, mode: byUser.get(a.id) ?? "auto" }));
}

export interface SiteActor {
  /** O usuário não é o dono: é um admin liberado pelo master editando o site de um cliente. */
  delegated: boolean;
  owner: { id: string; organizationId: string | null };
  site: BuilderSite;
}

/**
 * Quem pode agir sobre o site: o dono, ou um admin com a permissão "Editar templates" em nível de edição (liberado
 * pelo master). Qualquer outro → `null`. Excluir o site continua só do dono (essa ação nem passa por aqui).
 */
export async function resolveSiteActor(
  user: User,
  siteId: string
): Promise<SiteActor | null> {
  if (!isUuid(siteId)) return null;
  const [site] = await db
    .select()
    .from(pgBuilderSite)
    .where(eq(pgBuilderSite.id, siteId))
    .limit(1);
  if (!site) return null;
  const mine = site.userId === user.id;
  if (!(mine || (await hasAreaAccess(user, "admin_templates", "edit")))) {
    return null;
  }
  const [owner] = await db
    .select({ id: pgUser.id, organizationId: pgUser.organizationId })
    .from(pgUser)
    .where(eq(pgUser.id, site.userId))
    .limit(1);
  if (!owner) return null;
  return { delegated: !mine, owner, site };
}

/** Admin master (Lucas): destinatário das validações "com o Lucas". */
export async function masterUserId(): Promise<string | null> {
  const [row] = await db
    .select({ id: pgUser.id })
    .from(pgUser)
    .where(eq(pgUser.email, MASTER_ADMIN_EMAIL))
    .limit(1);
  return row?.id ?? null;
}

export type Result<T = object> =
  | ({ ok: true } & T)
  | { error: string; ok: false };

const OPEN = ["draft", "pending", "changes_requested"] as const;

/** A proposta aberta (rascunho, enviada ou com alterações pedidas) deste admin neste site. */
export async function openRequestFor(
  siteId: string,
  requestedBy: string
): Promise<BuilderChangeRequest | null> {
  try {
    const [row] = await db
      .select()
      .from(pgBuilderChangeRequest)
      .where(
        and(
          eq(pgBuilderChangeRequest.siteId, siteId),
          eq(pgBuilderChangeRequest.requestedBy, requestedBy),
          inArray(pgBuilderChangeRequest.status, [...OPEN])
        )
      )
      .limit(1);
    return row ?? null;
  } catch {
    return null;
  }
}

/**
 * O admin salva: atualiza a proposta aberta dele (mantém o estado: continuar editando uma proposta enviada atualiza o
 * que o revisor vê) ou abre uma nova como rascunho. O site real não muda.
 */
export async function saveProposal(
  siteId: string,
  requestedBy: string,
  content: unknown,
  reviewer: "master" | "owner"
): Promise<Result> {
  const parsed = checkSiteContent(content);
  if (!parsed.ok) return { error: parsed.error, ok: false };
  try {
    const open = await openRequestFor(siteId, requestedBy);
    if (open) {
      await db
        .update(pgBuilderChangeRequest)
        .set({ content: parsed.site, reviewer, updatedAt: new Date() })
        .where(eq(pgBuilderChangeRequest.id, open.id));
    } else {
      await db
        .insert(pgBuilderChangeRequest)
        .values({ content: parsed.site, requestedBy, reviewer, siteId });
    }
    return { ok: true };
  } catch (error) {
    console.error("[delegação] não foi possível guardar a proposta:", error);
    return {
      error: "Não foi possível guardar a alteração para validação.",
      ok: false,
    };
  }
}

/** Quem revisa esta proposta: o dono do site ou o master. */
export function canReview(
  user: Pick<User, "email" | "id" | "isAdmin">,
  request: Pick<BuilderChangeRequest, "reviewer">,
  siteOwnerId: string
): boolean {
  return request.reviewer === "master"
    ? isMasterAdmin(user)
    : user.id === siteOwnerId;
}

/** O admin envia a proposta para validação (vira "pendente") com uma mensagem opcional. */
export async function submitForReview(
  siteId: string,
  requestedBy: string,
  reviewer: "master" | "owner",
  message: string
): Promise<Result<{ request: BuilderChangeRequest }>> {
  const open = await openRequestFor(siteId, requestedBy);
  if (!open) {
    return { error: "Não há alterações para enviar.", ok: false };
  }
  try {
    const request = await db.transaction(async tx => {
      const [updated] = await tx
        .update(pgBuilderChangeRequest)
        .set({ reviewer, status: "pending", updatedAt: new Date() })
        .where(eq(pgBuilderChangeRequest.id, open.id))
        .returning();
      await tx.insert(pgBuilderChangeComment).values({
        authorId: requestedBy,
        body: message.trim().slice(0, 2000),
        kind: "submitted",
        requestId: open.id,
      });
      return updated as BuilderChangeRequest;
    });
    return { ok: true, request };
  } catch (error) {
    console.error("[delegação] não foi possível enviar:", error);
    return { error: "Não foi possível enviar para validação.", ok: false };
  }
}

export interface ReviewItem {
  id: string;
  requesterEmail: string;
  requesterName: string;
  siteId: string;
  siteName: string;
  status: BuilderChangeRequest["status"];
  updatedAt: Date;
}

const reviewColumns = {
  id: pgBuilderChangeRequest.id,
  requesterEmail: pgUser.email,
  requesterName: pgUser.name,
  siteId: pgBuilderSite.id,
  siteName: pgBuilderSite.name,
  status: pgBuilderChangeRequest.status,
  updatedAt: pgBuilderChangeRequest.updatedAt,
};

/** O que o usuário precisa revisar: propostas enviadas nos sites dele (validação do dono) e, se for o master, as dele. */
export async function pendingForReviewer(
  user: Pick<User, "email" | "id" | "isAdmin">
): Promise<ReviewItem[]> {
  try {
    const owned = await db
      .select(reviewColumns)
      .from(pgBuilderChangeRequest)
      .innerJoin(
        pgBuilderSite,
        eq(pgBuilderSite.id, pgBuilderChangeRequest.siteId)
      )
      .innerJoin(pgUser, eq(pgUser.id, pgBuilderChangeRequest.requestedBy))
      .where(
        and(
          eq(pgBuilderSite.userId, user.id),
          eq(pgBuilderChangeRequest.reviewer, "owner"),
          eq(pgBuilderChangeRequest.status, "pending")
        )
      )
      .orderBy(desc(pgBuilderChangeRequest.updatedAt));
    const master = isMasterAdmin(user)
      ? await db
          .select(reviewColumns)
          .from(pgBuilderChangeRequest)
          .innerJoin(
            pgBuilderSite,
            eq(pgBuilderSite.id, pgBuilderChangeRequest.siteId)
          )
          .innerJoin(pgUser, eq(pgUser.id, pgBuilderChangeRequest.requestedBy))
          .where(
            and(
              eq(pgBuilderChangeRequest.reviewer, "master"),
              eq(pgBuilderChangeRequest.status, "pending")
            )
          )
          .orderBy(desc(pgBuilderChangeRequest.updatedAt))
      : [];
    const seen = new Set<string>();
    return [...owned, ...master].filter(r => !seen.has(r.id) && seen.add(r.id));
  } catch (error) {
    // Tabelas ainda não criadas: ninguém tem o que revisar.
    console.error("[delegação] não foi possível listar as revisões:", error);
    return [];
  }
}

export interface ReviewDetail {
  comments: (BuilderChangeComment & { authorName: string | null })[];
  request: BuilderChangeRequest;
  requester: { email: string; id: string; name: string };
  role: "requester" | "reviewer";
  site: BuilderSite;
}

/** A revisão para quem pode vê-la: o revisor, ou o admin autor da proposta. Outro usuário → `null`. */
export async function getReview(
  requestId: string,
  user: Pick<User, "email" | "id" | "isAdmin">
): Promise<ReviewDetail | null> {
  if (!isUuid(requestId)) return null;
  const [row] = await db
    .select({
      request: pgBuilderChangeRequest,
      requester: { email: pgUser.email, id: pgUser.id, name: pgUser.name },
      site: pgBuilderSite,
    })
    .from(pgBuilderChangeRequest)
    .innerJoin(
      pgBuilderSite,
      eq(pgBuilderSite.id, pgBuilderChangeRequest.siteId)
    )
    .innerJoin(pgUser, eq(pgUser.id, pgBuilderChangeRequest.requestedBy))
    .where(eq(pgBuilderChangeRequest.id, requestId))
    .limit(1);
  if (!row) return null;
  const reviewer = canReview(user, row.request, row.site.userId);
  const requester = row.request.requestedBy === user.id;
  if (!(reviewer || requester)) return null;
  const comments = await db
    .select({ authorName: pgUser.name, comment: pgBuilderChangeComment })
    .from(pgBuilderChangeComment)
    .leftJoin(pgUser, eq(pgUser.id, pgBuilderChangeComment.authorId))
    .where(eq(pgBuilderChangeComment.requestId, requestId))
    .orderBy(asc(pgBuilderChangeComment.createdAt));
  return {
    comments: comments.map(c => ({ ...c.comment, authorName: c.authorName })),
    request: row.request,
    requester: row.requester,
    role: reviewer ? "reviewer" : "requester",
    site: row.site,
  };
}

export type ReviewAction = "approve" | "comment" | "request_changes";

/**
 * Decisão do revisor: aprovar (o site real passa a ser o proposto; as outras propostas abertas do mesmo site,
 * que partiram do conteúdo antigo, voltam para o admin ajustar), pedir alterações (comentário obrigatório) ou só
 * comentar. Só o revisor da proposta; o admin autor só comenta.
 */
export async function reviewChange(
  requestId: string,
  user: Pick<User, "email" | "id" | "isAdmin">,
  action: ReviewAction,
  body: string
): Promise<Result<{ request: BuilderChangeRequest }>> {
  const review = await getReview(requestId, user);
  if (!review) return { error: "Proposta não encontrada.", ok: false };
  const text = body.trim().slice(0, 4000);
  if (review.role !== "reviewer" && action !== "comment") {
    return { error: "Só quem valida pode decidir.", ok: false };
  }
  if (action === "request_changes" && !text) {
    return { error: "Escreva o que precisa mudar.", ok: false };
  }
  if (action === "comment" && !text) {
    return { error: "Escreva o comentário.", ok: false };
  }
  const { request } = review;
  if (action !== "comment" && request.status !== "pending") {
    return { error: "Esta proposta não está aguardando validação.", ok: false };
  }
  const parsed = siteSchema.safeParse(request.content);
  if (action === "approve" && !parsed.success) {
    return { error: "A proposta tem um conteúdo inválido.", ok: false };
  }
  try {
    const updated = await db.transaction(async tx => {
      const now = new Date();
      if (action === "approve" && parsed.success) {
        await tx
          .update(pgBuilderSite)
          .set({
            content: parsed.data,
            name: parsed.data.name,
            updatedAt: now,
          })
          .where(eq(pgBuilderSite.id, review.site.id));
        await tx
          .update(pgBuilderChangeRequest)
          .set({ status: "changes_requested", updatedAt: now })
          .where(
            and(
              eq(pgBuilderChangeRequest.siteId, review.site.id),
              inArray(pgBuilderChangeRequest.status, ["pending", "draft"])
            )
          );
      }
      let result = request;
      if (action !== "comment") {
        const [row] = await tx
          .update(pgBuilderChangeRequest)
          .set({
            decidedAt: now,
            status: action === "approve" ? "approved" : "changes_requested",
            updatedAt: now,
          })
          .where(eq(pgBuilderChangeRequest.id, request.id))
          .returning();
        result = row as BuilderChangeRequest;
      }
      await tx.insert(pgBuilderChangeComment).values({
        authorId: user.id,
        body: text,
        kind:
          action === "approve"
            ? "approved"
            : action === "request_changes"
              ? "changes_requested"
              : "comment",
        requestId: request.id,
      });
      return result;
    });
    return { ok: true, request: updated };
  } catch (error) {
    console.error("[delegação] não foi possível registrar a revisão:", error);
    return { error: "Não foi possível concluir.", ok: false };
  }
}

/** Estado de um site de cliente para quem o consulta: `editing` = no ar, mas com alterações ainda não publicadas. */
export type ClientSiteStatus = "draft" | "editing" | "failed" | "live";

export function clientSiteStatus(site: {
  publicationStatus: string | null;
  publishedAt: Date | null;
  updatedAt: Date;
}): ClientSiteStatus {
  if (site.publicationStatus === "published") {
    return site.publishedAt && site.updatedAt > site.publishedAt
      ? "editing"
      : "live";
  }
  return site.publicationStatus === "failed" ? "failed" : "draft";
}
