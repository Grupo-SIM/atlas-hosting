import { getTemplate, SiteRenderer } from "@repo/site-builder";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requireBuilderUser } from "@/lib/site-builder/access";

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
  await requireBuilderUser();
  const { path = [], templateId } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();

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
          <Button asChild size="sm">
            <Link href={`/criador-de-sites/novo/${template.id}`}>
              Usar este template
            </Link>
          </Button>
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
