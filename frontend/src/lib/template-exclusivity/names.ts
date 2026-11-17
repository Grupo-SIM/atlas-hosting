import { listTemplates, listWordpressTemplates } from "@repo/site-builder";

/** Nome amigável do template (ou o próprio id, se sumiu do registry). Inclui as cópias do WordPress. */
export function templateName(templateId: string): string {
  return (
    [...listTemplates(), ...listWordpressTemplates()].find(
      item => item.id === templateId
    )?.name ?? templateId
  );
}
