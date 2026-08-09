import namecheapApi from "@/lib/server/apis/namecheap";

function parseDomainForNamecheap(domain: string) {
  const parts = domain.toLowerCase().split(".");
  if (parts.length < 2) throw new Error("Formato de domínio inválido.");
  const multiPartTlds = new Set([
    "co.uk",
    "com.au",
    "com.br",
    "com.uk",
    "me.uk",
    "net.au",
    "net.br",
    "net.uk",
    "org.au",
    "org.br",
    "org.uk",
  ]);
  const possibleTld = parts.slice(-2).join(".");
  const tld = multiPartTlds.has(possibleTld) ? possibleTld : parts.at(-1) || "";
  const sld = parts
    .slice(0, multiPartTlds.has(possibleTld) ? -2 : -1)
    .join(".");
  if (!sld || !tld) throw new Error("Não foi possível separar SLD e TLD.");
  return { sld, tld };
}

export interface RegistrarAdapter {
  setNameservers(domain: string, nameservers: string[]): Promise<void>;
}

const namecheapAdapter: RegistrarAdapter = {
  async setNameservers(domain, nameservers) {
    const { sld, tld } = parseDomainForNamecheap(domain);
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
