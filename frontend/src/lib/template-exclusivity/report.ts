import { db } from "@/lib/db";
import { type Invoice, pgLog } from "@/lib/db/schema";
import { notifyUser } from "@/lib/notifications/inbox";
import { formatBrl } from "./rules";
import { LOG_PREFIX } from "./shared";

/** Pagamento confirmado que não pôde ser entregue: fica registrado para o suporte. */
export async function reportPaidWithoutDelivery(
  invoice: Invoice,
  message: string
): Promise<void> {
  console.error(`${LOG_PREFIX} Fatura ${invoice.id}: ${message}`);
  await db
    .insert(pgLog)
    .values({
      description: `Fatura ${invoice.id} (${formatBrl(invoice.amount)}): ${message}`,
      severity: "danger",
      title: "Exclusividade de template paga sem entrega",
      type: "account",
      userId: invoice.userId,
    })
    .catch(() => {});
  await notifyUser(invoice.userId, {
    body: "Recebemos seu pagamento, mas não foi possível concluir a exclusividade do template. Nossa equipe vai entrar em contato para resolver ou estornar.",
    email: { severity: "warning" },
    href: "/billing",
    kind: "template_exclusivity_problem",
    title: "Problema com sua compra de exclusividade",
  }).catch(() => {});
}
