import { parseDomainForSldTld } from "@/app/(auth)/dns/utils";
import namecheapApi from "@/lib/server/apis/namecheap";

export interface RegistrarAdapter {
  setNameservers(domain: string, nameservers: string[]): Promise<void>;
}

const namecheapAdapter: RegistrarAdapter = {
  async setNameservers(domain, nameservers) {
    const { sld, tld } = parseDomainForSldTld(domain);
    const response = await namecheapApi.setCustomNameservers({
      Nameservers: nameservers,
      SLD: sld,
      TLD: tld,
    });
    if (!response.Updated)
      throw new Error("A Namecheap não confirmou a alteração dos nameservers.");
  },
};

export const REGISTRAR_ADAPTERS = new Map<string, RegistrarAdapter>([
  ["namecheap", namecheapAdapter],
]);
