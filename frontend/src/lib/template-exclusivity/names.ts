import { listTemplates } from "@repo/site-builder";

/** Nome amigável do template (ou o próprio id, se sumiu do registry). */
export function templateName(templateId: string): string {
  return (
    listTemplates().find(item => item.id === templateId)?.name ?? templateId
  );
}
