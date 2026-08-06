export type PleskDnsRecordType =
  | "A"
  | "AAAA"
  | "CAA"
  | "CNAME"
  | "MX"
  | "NS"
  | "SRV"
  | "TLSA"
  | "TXT";

export const dnsRecordTypes: Array<{
  description: string;
  placeholder: string;
  value: PleskDnsRecordType;
  needsPriority?: boolean;
}> = [
  { description: "Aponta para um endereço IPv4", placeholder: "198.51.100.10", value: "A" },
  { description: "Aponta para um endereço IPv6", placeholder: "2001:db8::10", value: "AAAA" },
  { description: "Aponta para outro domínio", placeholder: "destino.exemplo.com.", value: "CNAME" },
  { description: "Define o servidor de e-mail", needsPriority: true, placeholder: "mail.exemplo.com.", value: "MX" },
  { description: "Armazena texto, como SPF, DKIM e verificações", placeholder: "v=spf1 include:exemplo.com ~all", value: "TXT" },
  { description: "Autoriza uma autoridade certificadora", placeholder: "0 issue \"letsencrypt.org\"", value: "CAA" },
  { description: "Define um servidor de nomes", placeholder: "ns1.exemplo.com.", value: "NS" },
  { description: "Define um serviço: prioridade peso porta destino", placeholder: "10 5 5060 sip.exemplo.com.", value: "SRV" },
  { description: "Define política DANE/TLS", placeholder: "3 1 1 <hash-do-certificado>", value: "TLSA" },
];
