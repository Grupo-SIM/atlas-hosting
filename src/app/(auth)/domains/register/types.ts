import type { DomainRegisterInvoiceOptions } from "@/lib/db/schema/tables/invoice";
import type { Metadata } from "next";

// Types remain the same
export type DomainPriceInfo = {
  tld: string;
  price?: number;
  renew?: number;
  transfer?: number;
  minRegisterYears?: number;
  maxRegisterYears?: number;
  description?: string;
};

export const metadata: Metadata = {
  title: "Registrar Domínio | Sua Plataforma",
  description: "Pesquise, registre e gerencie nomes de domínio.",
};

export type DomainPriceInfoFromDb = {
  tld: string;
  priceUSD?: number | null; // Registration price in USD from DB
  renewUSD?: number | null; // Renewal price in USD from DB
  transferUSD?: number | null; // Transfer price in USD from DB
  minRegisterYears?: number | null;
  maxRegisterYears?: number | null;
  // description might come from a separate getTldList call if needed
};

export type DomainWithAvailability = {
  domain: string;
  available: boolean;
  priceBRL: number; // Final BRL price (premium or standard)
  renewBRL: number; // Final BRL price
  transferBRL: number; // Final BRL price
  isPremium: boolean;
};

export type DomainData = {
  available: boolean;
  domain: DomainWithAvailability;
  extraDomains: DomainWithAvailability[];
} | null;

export interface DomainPageParams {
  whoisguard?: string;
  years?: string;
  domain?: string;
  confirm?: string;
  action?: "search"
}
