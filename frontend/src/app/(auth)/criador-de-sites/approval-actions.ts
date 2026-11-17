"use server";

import { revalidatePath } from "next/cache";
import { notifyUser } from "@/lib/notifications/inbox";
import { FORBIDDEN_MESSAGE, getBuilderUser } from "@/lib/site-builder/access";
import {
  getAdminMode,
  getReview,
  masterUserId,
  type ReviewAction,
  resolveSiteActor,
  reviewChange,
  submitForReview,
} from "@/lib/site-builder/delegation";

type Result = { ok: true } | { error: string; ok: false };

const reviewHref = (requestId: string) =>
  `/criador-de-sites/aprovacoes/${requestId}`;

/** O admin envia a alteração para validação; o revisor (dono do site ou o Lucas) recebe o aviso no sino e por e-mail. */
export async function submitChangeForReview(
  siteId: string,
  message: string
): Promise<Result> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const actor = await resolveSiteActor(user, siteId);
  if (!actor?.delegated) return { error: "Site não encontrado.", ok: false };
  const mode = await getAdminMode(user.id);
  if (mode === "auto") {
    return {
      error: "As suas alterações valem na hora: não há o que enviar.",
      ok: false,
    };
  }
  const result = await submitForReview(siteId, user.id, mode, String(message));
  if (!result.ok) return result;

  const reviewerId = mode === "owner" ? actor.owner.id : await masterUserId();
  if (reviewerId) {
    await notifyUser(reviewerId, {
      body: `${user.name ?? user.email} enviou alterações no site "${actor.site.name}" para a sua validação. Veja o que mudou, confira a pré-visualização e aprove ou peça ajustes.`,
      email: { actionText: "Validar alterações", severity: "info" },
      href: reviewHref(result.request.id),
      kind: "site_change_submitted",
      title: "Alterações aguardando a sua validação",
    }).catch(() => {});
  }
  revalidatePath("/criador-de-sites");
  return { ok: true };
}

/** Aprovar, pedir alterações ou comentar (como num PR). Avisa a outra parte. */
export async function reviewSiteChange(
  requestId: string,
  action: ReviewAction,
  body: string
): Promise<Result> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  if (!["approve", "comment", "request_changes"].includes(action)) {
    return { error: "Ação inválida.", ok: false };
  }
  const review = await getReview(requestId, user);
  const result = await reviewChange(requestId, user, action, String(body));
  if (!result.ok) return result;

  if (review) {
    const siteName = review.site.name;
    const text = String(body).trim();
    // Quem decide avisa o admin; o admin que comenta avisa o revisor.
    const targetId =
      review.role === "reviewer"
        ? review.request.requestedBy
        : review.request.reviewer === "owner"
          ? review.site.userId
          : await masterUserId();
    if (targetId && targetId !== user.id) {
      const copy =
        action === "approve"
          ? {
              body: `As alterações no site "${siteName}" foram aprovadas e já valem.${text ? ` Comentário: ${text}` : ""}`,
              kind: "site_change_approved",
              title: "Suas alterações foram aprovadas",
            }
          : action === "request_changes"
            ? {
                body: `Sobre o site "${siteName}": ${text}`,
                kind: "site_change_requested",
                title: "Pediram ajustes nas suas alterações",
              }
            : {
                body: `Site "${siteName}": ${text}`,
                kind: "site_change_comment",
                title: "Novo comentário numa alteração",
              };
      await notifyUser(targetId, {
        ...copy,
        email: { actionText: "Abrir", severity: "info" },
        href: reviewHref(requestId),
      }).catch(() => {});
    }
  }
  revalidatePath("/criador-de-sites");
  revalidatePath(reviewHref(requestId));
  return { ok: true };
}
