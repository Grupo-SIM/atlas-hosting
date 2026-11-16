import { getTemplate, SiteRenderer } from "@repo/site-builder";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireBuilderUser } from "@/lib/site-builder/access";
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
  const template = getTemplate(templateId);
  if (!template) notFound();
  const [state, resale] = await Promise.all([
    getTemplateState(template.id, user.id),
    getResaleConfig(),
  ]);
  const locked = blocksOthers(state);

  const raw = await searchParams;
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
          {!locked && (
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
      <SiteRenderer
        basePath={`/criador-de-sites/preview/${template.id}`}
        path={`/${path.join("/")}`}
        query={query}
        site={template.site}
      />
    </div>
  );
}
