import type { AffiliateCommission, Invoice, User } from "@/lib/db/schema";

export type AffiliateSale = AffiliateCommission & {
  buyerUser: Pick<User, "email" | "name">;
  invoice: Pick<Invoice, "description" | "reference">;
};
