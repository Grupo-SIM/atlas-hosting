import {
  describeSiteIssue,
  repairSite,
  type Site,
  siteSchema,
} from "@repo/site-builder";

export type SiteContentCheck =
  | { aviso?: string; ok: true; site: Site }
  | { error: string; ok: false };

/**
 * Prepara o conteúdo que o editor mandou para gravar: conserta o que seria recusado (um estilo com `;`, um número
 * inválido, uma página sem título…) e só então valida. Antes, um único valor ruim fazia o servidor recusar o site
 * inteiro e tudo o que a pessoa fizesse depois se perdia.
 *
 * Se mesmo assim não passar, a mensagem diz onde está o problema.
 */
export function checkSiteContent(content: unknown): SiteContentCheck {
  const { content: fixed, fixes } = repairSite(content);
  const parsed = siteSchema.safeParse(fixed);
  if (!parsed.success) {
    const issues = parsed.error.issues;
    console.error("[criador] conteúdo recusado:", issues.slice(0, 5));
    const where = issues[0] ? describeSiteIssue(issues[0].path) : "conteúdo";
    return {
      error: `Não deu para salvar: há um valor inválido em ${where}. Desfaça a última alteração (Ctrl+Z) e tente de novo.`,
      ok: false,
    };
  }
  if (fixes.length) console.warn("[criador] conteúdo consertado:", fixes);
  return {
    aviso: fixes.length
      ? `Salvo. Ignoramos o que não era válido: ${fixes.join(", ")}.`
      : undefined,
    ok: true,
    site: parsed.data,
  };
}
