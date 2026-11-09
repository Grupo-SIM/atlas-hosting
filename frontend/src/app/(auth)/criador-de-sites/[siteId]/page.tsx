import { getTemplate } from "@repo/site-builder";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import {
  pgBuilderPublication,
  pgBuilderSite,
  pgOrganizationDomains,
} from "@/lib/db/schema";
import {
  hasComplimentaryAtlasHosting,
  requireBuilderUser,
} from "@/lib/site-builder/access";
import { getAtlasHostingConfig } from "@/lib/site-builder/config";
import { listPublishTargets } from "@/lib/site-builder/eligibility";
import SiteEditorClient from "./components/SiteEditorClient";

export const metadata: Metadata = {
  title: "Editor de site - Atlas Hosting",
};

export default async function SiteEditorPage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const user = await requireBuilderUser();
  const { siteId } = await params;

  const [site] = await db
    .select()
    .from(pgBuilderSite)
    .where(and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, user.id)))
    .limit(1);
  if (!site) notFound();

  const config = getAtlasHostingConfig();
  const [publication, domains, targets] = await Promise.all([
    db.query.pgBuilderPublication.findFirst({
      where: eq(pgBuilderPublication.siteId, site.id),
    }),
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
    // Só VPS contratadas no Atlas e com assinatura em dia podem receber o site.
    listPublishTargets(user.id),
  ]);
  const original = site.templateId ? getTemplate(site.templateId) : undefined;

  return (
    <SiteEditorClient
      domain={publication?.domain ?? null}
      initialSite={site.content}
      originalSite={original?.site}
      publishSetup={{
        atlasVmMonthlyBrl: targets.atlasVm.enabled
          ? targets.atlasVm.monthlyBrl
          : null,
        baseDomain: config.subdomainEnabled ? config.baseDomain : null,
        complimentaryAtlasHosting: hasComplimentaryAtlasHosting(),
        domains: domains.map(d => d.domain),
        servers: targets.vpsNodes,
      }}
      publishWithPassword={publication?.target === "user_vps"}
      siteId={site.id}
    />
  );
}
