import "./load-env.mjs";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgInvoice, pgOrganizationDomains } from "@/lib/db/schema";
import { domainNamesFromInvoice } from "@/lib/server/domains/registerFromPaidInvoice";
import type { ReprocessResult } from "@/lib/server/domains/reprocessDomainInvoice";

interface CliOptions {
  apply: boolean;
  invoiceId: string;
  paymentConfirmed: boolean;
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function usage(): string {
  return [
    "Uso:",
    "  bun run domain:reprocess -- --invoice-id <uuid>",
    "  bun run domain:reprocess -- --invoice-id <uuid> --apply",
    "  bun run domain:reprocess -- --invoice-id <uuid> --apply --payment-confirmed",
    "",
    "Sem --apply, apenas inspeciona a fatura e mostra o que seria processado.",
    "Use --payment-confirmed somente após confirmar a liquidação no gateway",
    "quando a plataforma ainda não tiver marcado a fatura como paga.",
  ].join("\n");
}

function optionValue(args: string[], name: string): string | undefined {
  const inline = args.find(argument => argument.startsWith(`${name}=`));
  if (inline) return inline.slice(name.length + 1);

  const index = args.indexOf(name);
  if (index < 0) return undefined;
  return args[index + 1];
}

export function parseOptions(args: string[]): CliOptions {
  if (args.includes("--help") || args.includes("-h")) {
    console.log(usage());
    process.exit(0);
  }

  const invoiceId = optionValue(args, "--invoice-id")?.trim();
  if (!invoiceId) throw new Error(`--invoice-id é obrigatório.\n\n${usage()}`);
  if (!UUID_PATTERN.test(invoiceId)) {
    throw new Error("--invoice-id deve ser um UUID válido.");
  }

  return {
    apply: args.includes("--apply"),
    invoiceId,
    paymentConfirmed: args.includes("--payment-confirmed"),
  };
}

function printResult(result: ReprocessResult): void {
  console.log(
    JSON.stringify(
      {
        errors: result.errors ?? {},
        failed: result.failed ?? [],
        invoiceId: result.invoiceId,
        ok: result.ok,
        reason: result.reason,
        registered: result.registered ?? [],
        skipped: result.skipped ?? [],
      },
      null,
      2
    )
  );
}

async function main(): Promise<void> {
  const options = parseOptions(process.argv.slice(2));
  const invoice = await db.query.pgInvoice.findFirst({
    where: eq(pgInvoice.id, options.invoiceId),
  });

  if (!invoice) throw new Error(`Fatura não encontrada: ${options.invoiceId}`);
  if (invoice.type !== "domain") {
    throw new Error(
      `A fatura ${invoice.id} é do tipo ${invoice.type}, não de domínio.`
    );
  }

  const metadata = invoice.metadata as Record<string, unknown>;
  if (metadata.type === "renew" || metadata.isRenewal === true) {
    throw new Error("Este script não processa renovação de domínio.");
  }
  if (metadata.testPaymentOnly === true) {
    throw new Error("Esta é uma fatura de teste de pagamento.");
  }

  const domains = domainNamesFromInvoice(invoice);
  const linked =
    domains.length === 0
      ? []
      : await db
          .select({ domain: pgOrganizationDomains.domain })
          .from(pgOrganizationDomains)
          .where(
            and(
              eq(pgOrganizationDomains.organizationId, invoice.orgId),
              inArray(pgOrganizationDomains.domain, domains)
            )
          );

  console.log(
    JSON.stringify(
      {
        action: options.apply ? "apply" : "preview",
        alreadyLinked: linked.map(item => item.domain),
        amount: invoice.amount,
        currency: invoice.currency,
        domains,
        hasBillingSnapshot: Boolean(metadata.pixCheckout),
        invoiceId: invoice.id,
        lastRegistrationOutcome: metadata.domainRegistration ?? null,
        paymentConfirmedByOperator: options.paymentConfirmed,
        status: invoice.status,
      },
      null,
      2
    )
  );

  if (domains.length === 0) {
    throw new Error("A fatura não contém nenhum domínio para processar.");
  }
  if (!options.apply) {
    console.log(
      "Prévia concluída. Execute novamente com --apply para processar."
    );
    return;
  }
  if (invoice.status !== "paid" && !options.paymentConfirmed) {
    throw new Error(
      `A fatura está com status ${invoice.status}. Confirme a liquidação no gateway e repita com --payment-confirmed.`
    );
  }

  console.log(`[REPROCESS] Iniciando fatura ${invoice.id}...`);
  const { reprocessDomainInvoice } = await import(
    "@/lib/server/domains/reprocessDomainInvoice"
  );
  const result = await reprocessDomainInvoice(invoice.id);
  printResult(result);
  if (!result.ok) process.exitCode = 1;
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
