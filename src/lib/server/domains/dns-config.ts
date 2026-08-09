export function getAtlasNameservers(): string[] {
  return (
    process.env.ATLAS_DNS_NAMESERVERS ||
    "ns1.meuservidor.inf.br,ns2.meuservidor.inf.br"
  )
    .split(",")
    .map(value => value.trim().toLowerCase().replace(/\.$/, ""))
    .filter(Boolean);
}
