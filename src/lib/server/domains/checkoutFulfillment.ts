import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { type Invoice, pgInvoice } from "@/lib/db/schema";
import type { NamecheapContactDetails } from "@/lib/server/apis/namecheap/types";
import { registerDomainsFromPaidInvoice } from "./registerFromPaidInvoice";

/** Subconjunto do formulário de checkout usado para montar o contato do registrante. */
export interface CheckoutContactValues {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  address: {
    street: string;
    number: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export function buildNamecheapContact(
  values: CheckoutContactValues,
  email: string
): NamecheapContactDetails {
  return {
    Address1: `${values.address?.street ?? ""}, ${values.address?.number ?? ""}`,
    City: values.address?.city ?? "",
    Country: "BR",
    EmailAddress: email,
    FirstName: values.firstName?.trim() ?? "",
    LastName: values.lastName?.trim() ?? "",
    Phone: `+55.${(values.phoneNumber ?? "").replace(/\D/g, "")}`,
    PostalCode: (values.address?.zipCode ?? "").replace(/\D/g, ""),
    StateProvince: values.address?.state ?? "",
  } as NamecheapContactDetails;
}

const REQUIRED_CONTACT_FIELDS: {
  key: keyof NamecheapContactDetails;
  label: string;
  minLength?: number;
}[] = [
  { key: "FirstName", label: "nome" },
  { key: "LastName", label: "sobrenome" },
  { key: "Address1", label: "endereço (rua e número)", minLength: 3 },
  { key: "City", label: "cidade" },
  { key: "StateProvince", label: "estado" },
  { key: "PostalCode", label: "CEP", minLength: 8 },
  { key: "Phone", label: "telefone", minLength: 14 },
  { key: "EmailAddress", label: "email" },
];

/**
 * A Namecheap recusa o registro quando falta qualquer campo do registrante
 * (ex.: "Err 2010177: Parameter RegistrantCity is Missing"). Descobrir isso
 * depois de cobrar o cartão deixa o cliente pago e sem domínio, então o
 * checkout valida antes.
 */
export function missingContactFields(
  contact: NamecheapContactDetails
): string[] {
  return REQUIRED_CONTACT_FIELDS.filter(field => {
    const raw = String(contact[field.key] ?? "")
      .replace(/^[\s,]+|[\s,]+$/g, "")
      .trim();
    if (!raw) return true;
    return raw.length < (field.minLength ?? 1);
  }).map(field => field.label);
}

export function incompleteContactMessage(missing: string[]): string {
  return `Complete seus dados de cobrança antes de registrar o domínio. Faltando: ${missing.join(", ")}.`;
}

export interface DomainFulfillmentResult {
  ok: boolean;
  /** Mensagem pronta para o cliente quando `ok` é falso. */
  message?: string;
}

/**
 * Registra o domínio ANTES de marcar a fatura como paga — mesma ordem do webhook
 * de PIX. Se o registrador recusar, a fatura volta para "pending" e nenhuma
 * comissão de afiliado é gerada: não existe venda entregue.
 */
export async function fulfillDomainInvoice({
  invoice,
  contact,
  logPrefix = "[NAMECHEAP]",
  onFulfilled,
}: {
  invoice: Pick<Invoice, "id" | "reference" | "metadata" | "orgId">;
  contact: NamecheapContactDetails;
  logPrefix?: string;
  /** Roda só quando o domínio foi mesmo registrado (comissão, emails, etc.). */
  onFulfilled?: () => Promise<void>;
}): Promise<DomainFulfillmentResult> {
  console.log(`\n${logPrefix} ── REGISTRANDO DOMÍNIO(S) ──`);

  const { registered, failed, errors } = await registerDomainsFromPaidInvoice(
    invoice,
    contact
  );

  if (registered.length === 0) {
    const detail = Object.values(errors)[0] ?? failed.join(", ") ?? "sem causa";
    console.error(
      `${logPrefix} ✗ Nenhum domínio registrado para a fatura ${invoice.id}: ${detail}`
    );

    // Cobrança pode ter sido capturada; deixar como paga esconderia o problema.
    // "pending" mantém a fatura em aberto e permite reprocessar ou estornar.
    await db
      .update(pgInvoice)
      .set({ status: "pending" })
      .where(eq(pgInvoice.id, invoice.id));

    return {
      message:
        "Não foi possível registrar o domínio junto ao registrador e a compra não foi concluída. Se algum valor tiver sido debitado, ele será estornado — fale com o suporte informando o número da fatura.",
      ok: false,
    };
  }

  console.log(`${logPrefix} ✓ Registrados: ${registered.join(", ")}`);
  if (failed.length) {
    console.error(`${logPrefix} Falha parcial:`, failed, errors);
  }

  await db
    .update(pgInvoice)
    .set({ status: "paid" })
    .where(eq(pgInvoice.id, invoice.id));

  await onFulfilled?.();

  return { ok: true };
}
