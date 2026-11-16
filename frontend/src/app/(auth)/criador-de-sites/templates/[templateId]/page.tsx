import { getTemplate } from "@repo/site-builder";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireTemplateEditor } from "@/lib/site-builder/access";
import {
  getTemplateDrafts,
  getTemplateOverrides,
} from "@/lib/site-builder/templates";
import TemplateEditorClient from "./components/TemplateEditorClient";

export const metadata: Metadata = {
  title: "Editar template - Atlas Hosting",
};

/**
 * Editor do template em si (modo Dev; só quem pode editar templates). Abre no rascunho, se houver; senão na versão
 * publicada; senão no template do código. Só "Publicar no template" muda o que os clientes recebem.
 */
export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  await requireTemplateEditor();
  const { templateId } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();
  const [overrides, drafts] = await Promise.all([
    getTemplateOverrides(),
    getTemplateDrafts(),
  ]);
  const published = overrides[templateId];
  const draft = drafts[templateId];

  return (
    <TemplateEditorClient
      hasDraft={Boolean(draft)}
      hasPublished={Boolean(published)}
      initialSite={draft ?? published ?? template.site}
      originalSite={template.site}
      templateId={template.id}
      templateName={template.name}
    />
  );
}
