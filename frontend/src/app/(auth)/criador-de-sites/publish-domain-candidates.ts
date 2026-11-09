/** TLDs sugeridos na busca dentro do fluxo de publicar. */
const SUGGESTED_TLDS = [".com", ".net", ".org", ".io", ".dev", ".app", ".site"];

/** Domínios que a integração de registro do fluxo de publicação consegue cotar. */
export function publishDomainCandidates(clean: string): string[] {
  const name = (clean.includes(".") ? clean.split(".")[0] : clean).replace(
    /[^a-z0-9-]/g,
    ""
  );
  const wanted = clean.includes(".") ? [clean] : [];
  return [
    ...new Set([...wanted, ...SUGGESTED_TLDS.map(tld => `${name}${tld}`)]),
  ];
}
