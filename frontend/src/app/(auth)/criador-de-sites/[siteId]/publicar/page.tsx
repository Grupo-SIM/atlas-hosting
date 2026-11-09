import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/db";
import {
  pgBuilderHostingSubscription,
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
import PublishForm from "./components/PublishForm";

export const metadata: Metadata = {
  title: "Publicar site - Atlas Hosting",
};

export default async function PublishSitePage({
  params,
}: {
  params: Promise<{ siteId: string }>;
}) {
  const user = await requireBuilderUser();
  const { siteId } = await params;

  const [site] = await db
    .select({ id: pgBuilderSite.id, name: pgBuilderSite.name })
    .from(pgBuilderSite)
    .where(and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, user.id)))
    .limit(1);
  if (!site) notFound();

  const config = getAtlasHostingConfig();
  const [publication, domains, targets, hosting] = await Promise.all([
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
    db.query.pgBuilderHostingSubscription.findFirst({
      where: eq(pgBuilderHostingSubscription.siteId, site.id),
    }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="font-bold text-2xl tracking-tight">Publicar site</h1>
          <p className="text-muted-foreground">{site.name}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/criador-de-sites">Voltar para meus sites</Link>
        </Button>
      </div>

      <PublishForm
        atlasVmMonthlyBrl={
          targets.atlasVm.enabled ? targets.atlasVm.monthlyBrl : null
        }
        baseDomain={config.subdomainEnabled ? config.baseDomain : null}
        complimentaryAtlasHosting={hasComplimentaryAtlasHosting(user)}
        domains={domains.map(d => d.domain)}
        hosting={
          hosting
            ? { amountBrl: hosting.amountBrl, status: hosting.status }
            : null
        }
        publication={
          publication
            ? {
                domain: publication.domain,
                kind: publication.kind,
                lastError: publication.lastError,
                status: publication.status,
                target: publication.target,
              }
            : null
        }
        servers={targets.vpsNodes}
        siteId={site.id}
      />
    </div>
  );
}
