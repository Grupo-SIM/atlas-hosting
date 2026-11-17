import { isWordpressTemplate, SiteRenderer } from "@repo/site-builder";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { hasAreaAccess } from "@/lib/permissions/access";
import {
  canUseWordpressTemplates,
  requireBuilderUser,
} from "@/lib/site-builder/access";
import {
  getEffectiveTemplate,
  getTemplateDrafts,
} from "@/lib/site-builder/templates";
import { blocksOthers } from "@/lib/template-exclusivity/rules";
import {
  getResaleConfig,
  getTemplateState,
} from "@/lib/template-exclusivity/status";
import { ExclusivityAction } from "../../../exclusividades/components/ExclusivityControls";
import UseTemplateButton from "../../../novo/components/UseTemplateButton";

export const metadata: Metadata = {
  title: "Prévia do template - Atlas Hosting",
};

export default async function TemplatePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[]; templateId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireBuilderUser();
  const { path = [], templateId } = await params;
  const template = await getEffectiveTemplate(templateId);
  if (!template) notFound();
  if (
    isWordpressTemplate(template.id) &&
    !(await canUseWordpressTemplates(user))
  )
    notFound();
  const [state, resale] = await Promise.all([
    getTemplateState(template.id, user.id),
    getResaleConfig(),
  ]);
  const locked = blocksOthers(state);

  const raw = await searchParams;
  // Modo Dev: quem edita templates vê o RASCUNHO na prévia (os clientes só veem a versão publicada). `?v=publicada`
  // mostra a versão que os clientes recebem, para comparar.
  const canEdit = await hasAreaAccess(user, "admin_templates", "edit");
  const draft = canEdit ? (await getTemplateDrafts())[template.id] : undefined;
  const showDraft = Boolean(draft) && raw.v !== "publicada";
  const query = Object.fromEntries(
    Object.entries(raw).flatMap(([k, v]) =>
      typeof v === "string" ? [[k, v]] : []
    )
  );

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Prévia: </span>
          <strong>{template.name}</strong>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/criador-de-sites/novo">Voltar</Link>
          </Button>
          <ExclusivityAction
            className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm disabled:opacity-60"
            state={{ ...state, feePercent: resale.feePercent }}
            templateId={template.id}
            templateName={template.name}
          />
          {!(locked || showDraft) && (
            <UseTemplateButton
              className="h-8 rounded-md bg-primary px-3 text-primary-foreground text-sm disabled:opacity-60"
              templateId={template.id}
              templateName={template.name}
            >
              Usar este template
            </UseTemplateButton>
          )}
        </div>
      </div>
      {draft ? (
        <div
          className="border-[color:var(--sbx-warn-line)] border-b bg-[color:var(--sbx-warn-bg)] px-4 py-2 text-[color:var(--sbx-warn-fg)] text-sm"
          role="status"
        >
          {showDraft ? (
            <>
              <strong>{"</>"} Rascunho do modo Dev.</strong> Só quem edita
              templates vê isto: os clientes ainda recebem a versão publicada.
              Para torná-lo fixo, abra o editor e clique em{" "}
              <em>Publicar no template</em>.{" "}
              <Link
                className="underline"
                href={`/criador-de-sites/preview/${template.id}?v=publicada`}
              >
                Ver a versão que os clientes veem
              </Link>
            </>
          ) : (
            <>
              Mostrando a versão <strong>publicada</strong> (a que os clientes
              recebem).{" "}
              <Link
                className="underline"
                href={`/criador-de-sites/preview/${template.id}`}
              >
                Ver o rascunho do modo Dev
              </Link>
            </>
          )}
        </div>
      ) : null}
      <SiteRenderer
        basePath={`/criador-de-sites/preview/${template.id}`}
        path={`/${path.join("/")}`}
        query={query}
        site={showDraft && draft ? draft : template.site}
      />
    </div>
  );
}
