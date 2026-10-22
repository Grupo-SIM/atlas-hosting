import type { NamecheapContactDetails } from "@/lib/server/apis/namecheap/types";

/**
 * Contato registral único do Atlas. A Namecheap reutiliza uma confirmação já
 * aprovada para o mesmo contato; por isso a solicitação não chega ao cliente.
 */
export function atlasRegistrantContact(): NamecheapContactDetails {
  return {
    Address1: process.env.ATLAS_REGISTRANT_ADDRESS1 || "Beco Neuteu Maia",
    City: process.env.ATLAS_REGISTRANT_CITY || "Rio Branco",
    Country: process.env.ATLAS_REGISTRANT_COUNTRY || "BR",
    EmailAddress: process.env.DOMAIN_EMAIL || "atlashostdigital@gmail.com",
    FirstName: process.env.ATLAS_REGISTRANT_FIRST_NAME || "SIM",
    LastName: process.env.ATLAS_REGISTRANT_LAST_NAME || "Intermediacoes",
    Phone:
      process.env.ATLAS_REGISTRANT_PHONE ||
      process.env.ADMIN_PHONENUMBER ||
      "",
    PostalCode: process.env.ATLAS_REGISTRANT_POSTAL_CODE || "69900430",
    StateProvince: process.env.ATLAS_REGISTRANT_STATE_PROVINCE || "AC",
  };
}
