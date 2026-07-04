import type { DomainPageParams } from "@/app/(auth)/domain/types";
import { relations } from "drizzle-orm";
import {
  doublePrecision,
  json,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { pgOrganization } from "./organization";
import { pgUser } from "./user";

export const defaultDomainRegisterOptions: DomainRegisterInvoiceOptions = {
  years: "1",
  whoisguard: "true",
};

export const pgInvoice = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .notNull()
    .references(() => pgOrganization.id),
  userId: uuid("user_id")
    .notNull()
    .references(() => pgUser.id),
  amount: doublePrecision("amount").notNull(),
  reference: text("reference").notNull(),
  type: text("type", { enum: ["subscription", "domain", "vps"] }).notNull(),
  status: text("status", {
    enum: ["pending", "paid", "failed", "processing", "expired"],
  }).notNull(),
  metadata: json("metadata")
    .$type<DomainRegisterInvoiceOptions | VpsInvoiceOptions>()
    .default(defaultDomainRegisterOptions)
    .notNull(),
  dueDate: timestamp("due_date", { mode: "date" }).notNull(),
  currency: text("currency").default("BRL").notNull(), // Added currency, defaulting to BRL
  description: text("description"), // Added description, optional
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const invoiceRelations = relations(pgInvoice, ({ one }) => ({
  organization: one(pgOrganization, {
    fields: [pgInvoice.orgId],
    references: [pgOrganization.id],
  }),
  user: one(pgUser, {
    fields: [pgInvoice.userId],
    references: [pgUser.id],
  }),
}));

export type Invoice = typeof pgInvoice.$inferSelect;
export type InvoiceInsert = typeof pgInvoice.$inferInsert;
export type InvoiceSelect = typeof pgInvoice.$inferSelect;

export type PixCheckoutSnapshot = {
  firstName: string;
  lastName: string;
  document: string;
  phoneNumber: string;
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
};

export type DomainRegisterInvoiceOptions = Pick<
  DomainPageParams,
  "whoisguard" | "years"
> & {
  simpayPaymentId?: string;
  pixTransactionId?: string;
  pixCheckout?: PixCheckoutSnapshot;
  /** Cobrança real só para testar PIX/cartão; não chama Namecheap nem vincula domínio */
  testPaymentOnly?: boolean;
  /** Pacote "Amplie sua marca": uma fatura, vários `createDomain` após pagamento */
  bundleDomains?: string[];
  /** Senha temporária para contas criadas via guest checkout */
  guestPassword?: string;
  guestCheckout?: boolean;
  isRenewal?: boolean;
  /** Base cost in BRL paid to Namecheap before markup and fixed fee */
  namecheapCostBrl?: number;
  /** Resultado da última tentativa de registro na Namecheap (persistido para auditoria/reprocesso) */
  domainRegistration?: DomainRegistrationOutcome;
};

export type DomainRegistrationOutcome = {
  status: "success" | "partial" | "failed";
  /** Domínios que a organização passou a possuir (registrados agora ou já existentes) */
  registered: string[];
  /** Domínios que falharam nesta tentativa */
  failed: string[];
  /** Domínios que já estavam registrados/vinculados (sem nova cobrança) */
  skipped: string[];
  /** Mensagem de erro por domínio que falhou */
  errors: Record<string, string>;
  /** ISO timestamp da tentativa */
  at: string;
};

export type DomainRenewInvoiceOptions = {
  type: "renew";
  domain: string;
  simpayPaymentId?: string;
  pixTransactionId?: string;
  pixCheckout?: PixCheckoutSnapshot;
  guestCheckout?: boolean;
  guestPassword?: string;
  isRenewal?: boolean;
};

export type VpsInvoiceOptions = {
  vpsId: string;
  config: any;
  simpayPaymentId?: string;
  pixTransactionId?: string;
  pixCheckout?: PixCheckoutSnapshot;
  isRenewal?: boolean;
  guestCheckout?: boolean;
  guestPassword?: string;
  priceBreakdown?: Record<string, number>;
};
