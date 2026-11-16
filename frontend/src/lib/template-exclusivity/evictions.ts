import { format } from "date-fns";
import { and, eq, inArray, isNotNull, isNull, lte, ne, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  OWNED_EXCLUSIVITY_STATUSES,
  pgBuilderHostingSubscription,
  pgBuilderPublication,
  pgBuilderSite,
  pgTemplateExclusivity,
} from "@/lib/db/schema";
import { notifyUser } from "@/lib/notifications/inbox";
import { takeDown } from "@/lib/site-builder/takedown";
import { EVICTION_DAYS, evictionDeadline } from "./rules";
import { templateName } from "./names";
import { LOG_PREFIX } from "./shared";

/**
 * O template passou a ser de `ownerId`: os sites do dono ficam liberados e os
 * sites de todo mundo ganham o prazo de 7 dias para sair do ar, com aviso por
 * notificação e e-mail.
 */
export async function scheduleEvictions(
  templateId: string,
  ownerId: string,
  now = new Date()
): Promise<void> {
  // O novo dono pode ter tido sites bloqueados antes: voltam a funcionar.
  await db
    .update(pgBuilderSite)
    .set({ exclusivityBlockedAt: null, exclusivityDeadlineAt: null })
    .where(
      and(
        eq(pgBuilderSite.templateId, templateId),
        eq(pgBuilderSite.userId, ownerId),
        or(
          isNotNull(pgBuilderSite.exclusivityDeadlineAt),
          isNotNull(pgBuilderSite.exclusivityBlockedAt)
        )
      )
    );

  const deadline = evictionDeadline(now);
  const affected = await db
    .update(pgBuilderSite)
    .set({ exclusivityDeadlineAt: deadline })
    .where(
      and(
        eq(pgBuilderSite.templateId, templateId),
        ne(pgBuilderSite.userId, ownerId),
        isNull(pgBuilderSite.exclusivityDeadlineAt),
        isNull(pgBuilderSite.exclusivityBlockedAt)
      )
    )
    .returning({
      id: pgBuilderSite.id,
      name: pgBuilderSite.name,
      userId: pgBuilderSite.userId,
    });

  const byUser = new Map<string, { id: string; name: string }[]>();
  for (const site of affected) {
    byUser.set(site.userId, [...(byUser.get(site.userId) ?? []), site]);
  }

  const name = templateName(templateId);
  const when = format(deadline, "dd/MM/yyyy 'às' HH:mm");
  for (const [userId, sites] of byUser) {
    const list = sites.map(site => `• ${site.name}`).join("\n");
    await notifyUser(userId, {
      body: `O template "${name}" agora é exclusivo de outro usuário. Em ${EVICTION_DAYS} dias (${when}) estes sites saem do ar e ficam bloqueados para edição:\n${list}\nCrie um site novo com outro template e mude a publicação para ele. O conteúdo não é apagado.`,
      email: { actionText: "Ver meus sites", severity: "warning" },
      href: sites.length === 1 ? `/criador-de-sites/${sites[0]?.id}` : "/criador-de-sites",
      kind: "template_eviction_notice",
      title: `Seu site usa um template que ficou exclusivo`,
    }).catch(error =>
      console.error(`${LOG_PREFIX} Falha ao avisar ${userId}:`, error)
    );
  }
}

/**
 * Prazo vencido: tira os sites do ar (libera o endereço) e bloqueia a edição.
 * Cancela a hospedagem paga do site para não continuar cobrando. Se tirar do
 * ar falhar, o site fica bloqueado e a próxima rodada tenta de novo.
 */
export async function enforceEvictions(now = new Date()): Promise<number> {
  const due = await db
    .select()
    .from(pgBuilderSite)
    .where(
      and(
        isNotNull(pgBuilderSite.exclusivityDeadlineAt),
        lte(pgBuilderSite.exclusivityDeadlineAt, now),
        or(
          isNull(pgBuilderSite.exclusivityBlockedAt),
          sql`exists (select 1 from ${pgBuilderPublication} where ${pgBuilderPublication.siteId} = ${pgBuilderSite.id})`
        )
      )
    )
    .limit(50);

  let enforced = 0;
  for (const site of due) {
    // Confere se o template continua exclusivo de outra pessoa.
    const [owner] = await db
      .select({ ownerUserId: pgTemplateExclusivity.ownerUserId })
      .from(pgTemplateExclusivity)
      .where(
        and(
          eq(pgTemplateExclusivity.templateId, site.templateId),
          inArray(pgTemplateExclusivity.status, [...OWNED_EXCLUSIVITY_STATUSES])
        )
      )
      .limit(1);
    if (!owner || owner.ownerUserId === site.userId) {
      await db
        .update(pgBuilderSite)
        .set({ exclusivityBlockedAt: null, exclusivityDeadlineAt: null })
        .where(eq(pgBuilderSite.id, site.id));
      continue;
    }

    const firstTime = !site.exclusivityBlockedAt;
    if (firstTime) {
      await db
        .update(pgBuilderSite)
        .set({ exclusivityBlockedAt: now })
        .where(eq(pgBuilderSite.id, site.id));
      await db
        .update(pgBuilderHostingSubscription)
        .set({ cancelledAt: now, status: "cancelled", updatedAt: now })
        .where(
          and(
            eq(pgBuilderHostingSubscription.siteId, site.id),
            ne(pgBuilderHostingSubscription.status, "cancelled")
          )
        );
    }

    const publication = await db.query.pgBuilderPublication.findFirst({
      where: eq(pgBuilderPublication.siteId, site.id),
    });
    if (publication) {
      const result = await takeDown(site.userId, publication, undefined, {
        detachOnSshFailure: true,
      });
      if (!result.ok) {
        console.error(
          `${LOG_PREFIX} Não foi possível tirar o site ${site.id} do ar: ${result.error}`
        );
      }
    }

    if (firstTime) {
      enforced++;
      await notifyUser(site.userId, {
        body: `O prazo terminou: o site "${site.name}" saiu do ar e está bloqueado para edição, porque o template "${templateName(site.templateId)}" é exclusivo de outro usuário. O conteúdo continua guardado.`,
        email: { actionText: "Criar um site novo", severity: "danger" },
        href: "/criador-de-sites/novo",
        kind: "template_eviction_done",
        title: "Site bloqueado pela exclusividade do template",
      }).catch(() => {});
    }
  }
  return enforced;
}

/**
 * O template voltou a ser público: desbloqueia os sites (sem republicar) e
 * cancela os prazos em andamento.
 */
export async function releaseBlockedSites(templateId: string): Promise<void> {
  const released = await db
    .update(pgBuilderSite)
    .set({ exclusivityBlockedAt: null, exclusivityDeadlineAt: null })
    .where(
      and(
        eq(pgBuilderSite.templateId, templateId),
        or(
          isNotNull(pgBuilderSite.exclusivityDeadlineAt),
          isNotNull(pgBuilderSite.exclusivityBlockedAt)
        )
      )
    )
    .returning({ userId: pgBuilderSite.userId });

  const users = new Set(released.map(site => site.userId));
  for (const userId of users) {
    await notifyUser(userId, {
      body: `O template "${templateName(templateId)}" não é mais exclusivo. Seus sites com ele voltaram a poder ser editados e publicados.`,
      href: "/criador-de-sites",
      kind: "template_released",
      title: "Template liberado de novo",
    }).catch(() => {});
  }
}
