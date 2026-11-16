import { getTemplate } from "@repo/site-builder";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireTemplateEditor } from "@/lib/site-builder/access";
import { getTemplateOverrides } from "@/lib/site-builder/templates";
import TemplateEditorClient from "./components/TemplateEditorClient";

export const metadata: Metadata = {
  title: "Editar template - Atlas Hosting",
};

/** Editor do template em si (só o admin master). O que for salvo vale para os sites criados daqui para frente. */
export default async function TemplateEditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  await requireTemplateEditor();
  const { templateId } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();
  const override = (await getTemplateOverrides())[templateId];

  return (
    <TemplateEditorClient
      initialSite={override ?? template.site}
      originalSite={template.site}
      templateId={template.id}
      templateName={template.name}
    />
  );
}
