import { getTemplate, SiteRenderer } from "@repo/site-builder";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pgOrganizationDomains, pgVpsServers } from "@/lib/db/schema";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { getAtlasHostingConfig } from "@/lib/site-builder/config";
import { AutoScroll } from "../../components/AutoScroll";
import { FitSite } from "../../components/FitSite";
import ConfigureForm from "./components/ConfigureForm";

export const metadata: Metadata = {
  title: "Configurar site - Atlas Hosting",
};

export default async function ConfigureSitePage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const user = await requireBuilderUser();
  const { templateId } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();

  const config = getAtlasHostingConfig();
  const [domains, servers] = await Promise.all([
    user.organization
      ? db
          .select({ domain: pgOrganizationDomains.domain })
          .from(pgOrganizationDomains)
          .where(
            and(
              eq(pgOrganizationDomains.organizationId, user.organization.id),
              eq(pgOrganizationDomains.active, true),
              eq(pgOrganizationDomains.dnsMode, "cloudflare")
            )
          )
      : Promise.resolve([]),
    db
      .select({
        id: pgVpsServers.id,
        ip: pgVpsServers.ip,
        name: pgVpsServers.name,
      })
      .from(pgVpsServers)
      .where(eq(pgVpsServers.userId, user.id)),
  ]);

  return (
    <ConfigureForm
      atlasVmEnabled={config.atlasVmEnabled}
      baseDomain={config.subdomainEnabled ? config.baseDomain : null}
      defaultName={template.site.name}
      domains={domains.map(d => d.domain)}
      preview={
        <AutoScroll speed={120}>
          <FitSite>
            <SiteRenderer path="/" site={template.site} />
          </FitSite>
        </AutoScroll>
      }
      previewBackground={template.site.theme.bg ?? "#030712"}
      servers={servers}
      templateId={template.id}
      templateName={template.name}
    />
  );
}
