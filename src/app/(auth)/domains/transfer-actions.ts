"use server";

import { and, eq, inArray, lt, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  pgDomainTransfer,
  pgInvoice,
  pgOrganizationDomains,
  pgUser,
  pgUserEmailAccountConfigs,
  pgUserPermission,
  pgZohoDomainOrganizations,
} from "@/lib/db/schema";
import { sendDomainTransferStatusEmail } from "@/lib/email/service";
import {
  domainTransferStatusMessage,
  getDomainTransferStatus,
  invoiceReferencesDomain,
  isOpenDomainTransferStatus,
  OPEN_DOMAIN_TRANSFER_STATUSES,
  type DomainTransferStatus,
} from "@/lib/server/domains/domain-transfer";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";

const OPEN_STATUSES = [...OPEN_DOMAIN_TRANSFER_STATUSES];

export interface DomainTransferActionResult {
  message: string;
  success: boolean;
}

export interface DomainTransferView {
  domain: string;
  expiresAt: Date;
  id: string;
  sourceAcceptedAt: Date | null;
  sourceEmail: string;
  sourceName: string;
  sourceUserId: string;
  status: DomainTransferStatus;
  targetAcceptedAt: Date | null;
  targetEmail: string;
  targetName: string;
  targetUserId: string;
}

function actionResult(message: string, success = false): DomainTransferActionResult {
  return { message, success };
}

function normalizedEmail(email: string) {
  return email.trim().toLowerCase();
}

function assertTransferSource(user: Awaited<ReturnType<typeof getUser>>) {
  if (user.impersonatedBy) {
    throw new Error("Transferências não podem ser iniciadas durante impersonação.");
  }
  if (user.organization.ownerId !== user.id) {
    throw new Error("Somente o dono da organização pode transferir domínios.");
  }
}

async function getTransferView(
  transferId: string
): Promise<DomainTransferView | null> {
  const transfer = await db.query.pgDomainTransfer.findFirst({
    where: eq(pgDomainTransfer.id, transferId),
  });
  if (!transfer) return null;

  const [domain, sourceUser, targetUser] = await Promise.all([
    transfer.domainId ? db.query.pgOrganizationDomains.findFirst({
      where: eq(pgOrganizationDomains.id, transfer.domainId),
    }) : Promise.resolve(undefined),
    db.query.pgUser.findFirst({ where: eq(pgUser.id, transfer.sourceUserId) }),
    db.query.pgUser.findFirst({ where: eq(pgUser.id, transfer.targetUserId) }),
  ]);
  if ((!domain && !transfer.domainName) || !sourceUser || !targetUser) return null;

  return {
    domain: domain?.domain || transfer.domainName!,
    expiresAt: transfer.expiresAt,
    id: transfer.id,
    sourceAcceptedAt: transfer.sourceAcceptedAt,
    sourceEmail: sourceUser.email,
    sourceName: sourceUser.name,
    sourceUserId: sourceUser.id,
    status: transfer.status as DomainTransferStatus,
    targetAcceptedAt: transfer.targetAcceptedAt,
    targetEmail: targetUser.email,
    targetName: targetUser.name,
    targetUserId: targetUser.id,
  };
}

function transferUrl(transferId: string) {
  return `${getServerPublicBaseUrl()}/domains/transfers/${transferId}`;
}

async function notifyDomainTransfer(transferId: string) {
  const transfer = await getTransferView(transferId);
  if (!transfer) return;

  await Promise.all([
    sendDomainTransferStatusEmail({
      actionUrl: transferUrl(transfer.id),
      domain: transfer.domain,
      email: transfer.sourceEmail,
      firstName: transfer.sourceName.split(" ")[0] || transfer.sourceEmail,
      recipientCanReject: false,
      state: domainTransferStatusMessage(
        transfer.status,
        transfer.sourceUserId,
        transfer.sourceUserId,
        transfer.targetUserId
      ),
    }),
    sendDomainTransferStatusEmail({
      actionUrl: transferUrl(transfer.id),
      domain: transfer.domain,
      email: transfer.targetEmail,
      firstName: transfer.targetName.split(" ")[0] || transfer.targetEmail,
      recipientCanReject: true,
      state: domainTransferStatusMessage(
        transfer.status,
        transfer.targetUserId,
        transfer.sourceUserId,
        transfer.targetUserId
      ),
    }),
  ]);
}

export async function expireDomainTransfers(): Promise<void> {
  const expired = await db
    .update(pgDomainTransfer)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(
        inArray(pgDomainTransfer.status, OPEN_STATUSES),
        lt(pgDomainTransfer.expiresAt, new Date())
      )
    )
    .returning({ id: pgDomainTransfer.id });

  await Promise.all(expired.map(transfer => notifyDomainTransfer(transfer.id)));
}

async function hasPendingDomainInvoice(organizationId: string, domain: string) {
  const invoices = await db.query.pgInvoice.findMany({
    where: and(
      eq(pgInvoice.orgId, organizationId),
      eq(pgInvoice.type, "domain"),
      inArray(pgInvoice.status, ["pending", "processing"])
    ),
  });
  return invoices.some(invoice => invoiceReferencesDomain(invoice, domain));
}

export async function verifyDomainTransferRecipient(
  domainId: string,
  email: string
): Promise<DomainTransferActionResult> {
  await expireDomainTransfers();
  try {
    const user = await getUser();
    assertTransferSource(user);
    const domain = await db.query.pgOrganizationDomains.findFirst({
      where: and(
        eq(pgOrganizationDomains.id, domainId),
        eq(pgOrganizationDomains.organizationId, user.organization.id),
        eq(pgOrganizationDomains.active, true)
      ),
    });
    if (!domain) return actionResult("Domínio ativo não encontrado na sua organização.");

    const target = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, normalizedEmail(email)),
    });
    if (!target?.emailVerified || !target.organizationId) {
      return actionResult("Não encontramos uma conta Atlas com e-mail verificado.");
    }
    if (target.id === user.id || target.organizationId === user.organization.id) {
      return actionResult("Informe o e-mail de uma conta Atlas de outra organização.");
    }
    return actionResult("Conta Atlas verificada. Você já pode solicitar a transferência.", true);
  } catch (error) {
    return actionResult(
      error instanceof Error ? error.message : "Não foi possível verificar a conta Atlas."
    );
  }
}

export async function createDomainTransfer(
  domainId: string,
  email: string
): Promise<DomainTransferActionResult> {
  await expireDomainTransfers();
  try {
    const user = await getUser();
    assertTransferSource(user);
    const domain = await db.query.pgOrganizationDomains.findFirst({
      where: and(
        eq(pgOrganizationDomains.id, domainId),
        eq(pgOrganizationDomains.organizationId, user.organization.id),
        eq(pgOrganizationDomains.active, true)
      ),
    });
    if (!domain) return actionResult("Domínio ativo não encontrado na sua organização.");
    if (await hasPendingDomainInvoice(user.organization.id, domain.domain)) {
      return actionResult("Resolva primeiro as faturas pendentes deste domínio.");
    }

    const target = await db.query.pgUser.findFirst({
      where: eq(pgUser.email, normalizedEmail(email)),
    });
    if (!target?.emailVerified || !target.organizationId) {
      return actionResult("Não encontramos uma conta Atlas com e-mail verificado.");
    }
    if (target.id === user.id || target.organizationId === user.organization.id) {
      return actionResult("Informe o e-mail de uma conta Atlas de outra organização.");
    }

    const openTransfer = await db.query.pgDomainTransfer.findFirst({
      where: and(
        eq(pgDomainTransfer.domainId, domain.id),
        inArray(pgDomainTransfer.status, OPEN_STATUSES)
      ),
    });
    if (openTransfer) {
      return actionResult("Já existe uma transferência pendente para este domínio.");
    }

    const [transfer] = await db
      .insert(pgDomainTransfer)
      .values({
        domainId: domain.id,
        domainName: domain.domain,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        sourceOrganizationId: user.organization.id,
        sourceUserId: user.id,
        status: "pending_both",
        targetOrganizationId: target.organizationId,
        targetUserId: target.id,
      })
      .returning({ id: pgDomainTransfer.id });
    if (!transfer) return actionResult("Não foi possível criar a transferência.");

    await notifyDomainTransfer(transfer.id);
    revalidateDomainTransferPaths(transfer.id);
    return actionResult("Solicitação enviada. Ambos precisam confirmar por e-mail ou painel.", true);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível criar a transferência.";
    if (message.includes("domain_transfers_active_domain_unique")) {
      return actionResult("Já existe uma transferência pendente para este domínio.");
    }
    return actionResult(message);
  }
}

async function completeDomainTransfer(transferId: string, actorId: string) {
  await db.transaction(async tx => {
    const transfer = await tx.query.pgDomainTransfer.findFirst({
      where: eq(pgDomainTransfer.id, transferId),
    });
    if (!transfer || !isOpenDomainTransferStatus(transfer.status as DomainTransferStatus)) {
      throw new Error("Transferência pendente não encontrada.");
    }
    if (transfer.sourceUserId !== actorId && transfer.targetUserId !== actorId) {
      throw new Error("Você não participa desta transferência.");
    }

    if (!transfer.domainId) throw new Error("O domínio foi removido do Atlas.");
    const domain = await tx.query.pgOrganizationDomains.findFirst({
      where: and(
        eq(pgOrganizationDomains.id, transfer.domainId),
        eq(pgOrganizationDomains.organizationId, transfer.sourceOrganizationId),
        eq(pgOrganizationDomains.active, true)
      ),
    });
    if (!domain) throw new Error("O domínio não pertence mais à conta de origem.");

    const invoices = await tx.query.pgInvoice.findMany({
      where: and(
        eq(pgInvoice.orgId, transfer.sourceOrganizationId),
        eq(pgInvoice.type, "domain"),
        inArray(pgInvoice.status, ["pending", "processing"])
      ),
    });
    if (invoices.some(invoice => invoiceReferencesDomain(invoice, domain.domain))) {
      throw new Error("Resolva primeiro as faturas pendentes deste domínio.");
    }

    const now = new Date();
    const sourceAcceptedAt =
      transfer.sourceUserId === actorId ? now : transfer.sourceAcceptedAt;
    const targetAcceptedAt =
      transfer.targetUserId === actorId ? now : transfer.targetAcceptedAt;

    if (!sourceAcceptedAt || !targetAcceptedAt) {
      await tx
        .update(pgDomainTransfer)
        .set({
          sourceAcceptedAt,
          status: getDomainTransferStatus({ sourceAcceptedAt, targetAcceptedAt }),
          targetAcceptedAt,
          updatedAt: now,
        })
        .where(eq(pgDomainTransfer.id, transfer.id));
      return;
    }

    const sourceMembers = await tx.query.pgUser.findMany({
      columns: { id: true },
      where: eq(pgUser.organizationId, transfer.sourceOrganizationId),
    });
    const sourceEmailConfigs = await tx.query.pgUserEmailAccountConfigs.findMany({
      where: and(
        inArray(
          pgUserEmailAccountConfigs.userId,
          sourceMembers.map(member => member.id)
        ),
        sql`lower(${pgUserEmailAccountConfigs.emailAddress}) like ${`%@${domain.domain.toLowerCase()}`}`
      ),
    });
    for (const config of sourceEmailConfigs) {
      const existingTargetConfig = await tx.query.pgUserEmailAccountConfigs.findFirst({
        where: and(
          eq(pgUserEmailAccountConfigs.userId, transfer.targetUserId),
          eq(pgUserEmailAccountConfigs.emailAddress, config.emailAddress)
        ),
      });
      if (existingTargetConfig) {
        await tx
          .delete(pgUserEmailAccountConfigs)
          .where(eq(pgUserEmailAccountConfigs.id, config.id));
      } else {
        await tx
          .update(pgUserEmailAccountConfigs)
          .set({ userId: transfer.targetUserId, updatedAt: now })
          .where(eq(pgUserEmailAccountConfigs.id, config.id));
      }
    }

    await tx
      .update(pgZohoDomainOrganizations)
      .set({ userId: transfer.targetUserId, updatedAt: now })
      .where(
        sql`lower(${pgZohoDomainOrganizations.domainName}) = ${domain.domain.toLowerCase()}`
      );
    await tx
      .delete(pgUserPermission)
      .where(eq(pgUserPermission.domainId, domain.id));
    await tx
      .update(pgUser)
      .set({ selectedDomain: null, updatedAt: now })
      .where(
        and(
          eq(pgUser.organizationId, transfer.sourceOrganizationId),
          eq(pgUser.selectedDomain, domain.domain)
        )
      );
    await tx
      .update(pgOrganizationDomains)
      .set({ organizationId: transfer.targetOrganizationId })
      .where(eq(pgOrganizationDomains.id, domain.id));
    await tx
      .update(pgDomainTransfer)
      .set({
        completedAt: now,
        sourceAcceptedAt,
        status: "completed",
        targetAcceptedAt,
        updatedAt: now,
      })
      .where(eq(pgDomainTransfer.id, transfer.id));
  });
}

export async function respondToDomainTransfer(
  transferId: string,
  response: "accept" | "reject"
): Promise<DomainTransferActionResult> {
  await expireDomainTransfers();
  try {
    const user = await getUser();
    const transfer = await db.query.pgDomainTransfer.findFirst({
      where: eq(pgDomainTransfer.id, transferId),
    });
    if (!transfer || !isOpenDomainTransferStatus(transfer.status as DomainTransferStatus)) {
      return actionResult("Transferência pendente não encontrada.");
    }
    if (transfer.sourceUserId !== user.id && transfer.targetUserId !== user.id) {
      return actionResult("Você não participa desta transferência.");
    }
    if (response === "reject") {
      if (transfer.targetUserId !== user.id) {
        return actionResult("Somente o destinatário pode recusar a transferência.");
      }
      await db
        .update(pgDomainTransfer)
        .set({ rejectedAt: new Date(), status: "rejected", updatedAt: new Date() })
        .where(eq(pgDomainTransfer.id, transfer.id));
    } else {
      await completeDomainTransfer(transfer.id, user.id);
    }

    await notifyDomainTransfer(transfer.id);
    revalidateDomainTransferPaths(transfer.id);
    return actionResult(
      response === "reject" ? "Transferência recusada." : "Sua confirmação foi registrada.",
      true
    );
  } catch (error) {
    return actionResult(
      error instanceof Error ? error.message : "Não foi possível atualizar a transferência."
    );
  }
}

export async function cancelDomainTransfer(
  transferId: string
): Promise<DomainTransferActionResult> {
  await expireDomainTransfers();
  try {
    const user = await getUser();
    const transfer = await db.query.pgDomainTransfer.findFirst({
      where: eq(pgDomainTransfer.id, transferId),
    });
    if (!transfer || !isOpenDomainTransferStatus(transfer.status as DomainTransferStatus)) {
      return actionResult("Transferência pendente não encontrada.");
    }
    if (transfer.sourceUserId !== user.id) {
      return actionResult("Somente o solicitante pode cancelar a transferência.");
    }
    await db
      .update(pgDomainTransfer)
      .set({ cancelledAt: new Date(), status: "cancelled", updatedAt: new Date() })
      .where(eq(pgDomainTransfer.id, transfer.id));
    await notifyDomainTransfer(transfer.id);
    revalidateDomainTransferPaths(transfer.id);
    return actionResult("Transferência cancelada.", true);
  } catch (error) {
    return actionResult(
      error instanceof Error ? error.message : "Não foi possível cancelar a transferência."
    );
  }
}

export async function getDomainTransfersForUser(
  userId: string
): Promise<DomainTransferView[]> {
  const viewer = await getUser();
  if (viewer.id !== userId) return [];
  await expireDomainTransfers();
  const transfers = await db.query.pgDomainTransfer.findMany({
    where: or(
      eq(pgDomainTransfer.sourceUserId, userId),
      eq(pgDomainTransfer.targetUserId, userId)
    ),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });
  const views = await Promise.all(transfers.map(transfer => getTransferView(transfer.id)));
  return views.filter((transfer): transfer is DomainTransferView => Boolean(transfer));
}

export async function getDomainTransferForUser(
  transferId: string,
  userId: string
): Promise<DomainTransferView | null> {
  const viewer = await getUser();
  if (viewer.id !== userId) return null;
  await expireDomainTransfers();
  const transfer = await getTransferView(transferId);
  if (!transfer) return null;
  return transfer.sourceUserId === userId || transfer.targetUserId === userId
    ? transfer
    : null;
}

function revalidateDomainTransferPaths(transferId: string) {
  revalidatePath("/domains");
  revalidatePath(`/domains/transfers/${transferId}`);
  revalidatePath("/email");
}
