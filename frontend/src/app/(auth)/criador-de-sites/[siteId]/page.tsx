import { format } from "date-fns";
import { and, eq } from "drizzle-orm";
import { Lock, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgOrganizationDomains } from "@/lib/db/schema";
import {
  hasComplimentaryAtlasHosting,
  requireBuilderUser,
} from "@/lib/site-builder/access";
import { getAtlasHostingConfig } from "@/lib/site-builder/config";
import {
  getAdminMode,
  openRequestFor,
  resolveSiteActor,
} from "@/lib/site-builder/delegation";
import { listPublishTargets } from "@/lib/site-builder/eligibility";
import { getEffectiveTemplate } from "@/lib/site-builder/templates";
import { templateName } from "@/lib/template-exclusivity/names";
import { Frame } from "../components/Frame";
import ReviewBanner from "./components/ReviewBanner";
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
  // O id é uuid no banco: outro valor (ex.: "[siteId]" literal) derrubaria a página com erro do Postgres.
  if (
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      siteId
    )
  )
    notFound();

  // O dono, ou um admin liberado pelo master (edita como o dono; com aprovação exigida, o que ele faz vira proposta).
  // Antes de ler o site: post que chegar depois disto é "novo" para o editor (ver saveSite).
  const carregadoEm = new Date().toISOString();
  const actor = await resolveSiteActor(user, siteId);
  if (!actor) notFound();
  const site = actor.site;
  // Admin de um cliente: validação automática (padrão) edita direto; as outras guardam uma proposta que o dono ou o
  // Lucas valida (ver `saveSite`). O editor reabre a proposta dele, não o site de verdade.
  const mode = actor.delegated ? await getAdminMode(user.id) : "auto";
  const review =
    mode === "auto" ? null : await openRequestFor(site.id, user.id);

  // Template ficou exclusivo de outra pessoa e o prazo acabou: sem editor.
  if (site.exclusivityBlockedAt) {
    return (
      <Frame
        closeHref="/criador-de-sites"
        crumbs={[
          { href: "/criador-de-sites", label: "Sites" },
          { label: site.name },
        ]}
        icon={<Lock className="size-[15px]" />}
      >
        <div className="flex flex-1 items-center justify-center px-5 py-16">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <Lock className="size-8 text-[color:var(--sbx-warn-fg)]" />
            <h1 className="font-medium text-2xl">Site bloqueado</h1>
            <p className="text-[color:var(--sbx-mute)] text-sm">
              O template "{templateName(site.templateId)}" agora é exclusivo de
              outro usuário. Este site saiu do ar e não pode mais ser editado
              nem publicado. O conteúdo continua guardado e volta a funcionar se
              o template deixar de ser exclusivo.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                className="rounded-full bg-[#d6f34a] px-4 py-2 font-medium text-[#1d1c1a] text-[13px]"
                href="/criador-de-sites/novo"
              >
                Criar um site novo
              </Link>
              <Link
                className="rounded-full border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] px-4 py-2 text-[13px]"
                href={`/criador-de-sites/preview/${site.templateId}`}
              >
                Fazer proposta pelo template
              </Link>
            </div>
          </div>
        </div>
      </Frame>
    );
  }

  const config = getAtlasHostingConfig();
  const [publication, domains, targets] = await Promise.all([
    db.query.pgBuilderPublication.findFirst({
      where: eq(pgBuilderPublication.siteId, site.id),
    }),
    actor.owner.organizationId
      ? db
          .select({ domain: pgOrganizationDomains.domain })
          .from(pgOrganizationDomains)
          .where(
            and(
              eq(
                pgOrganizationDomains.organizationId,
                actor.owner.organizationId
              ),
              eq(pgOrganizationDomains.active, true),
              eq(pgOrganizationDomains.dnsMode, "cloudflare")
            )
          )
      : Promise.resolve([]),
    // Só VPS contratadas no Atlas e com assinatura em dia podem receber o site.
    listPublishTargets(actor.owner.id),
  ]);
  const original = site.templateId
    ? await getEffectiveTemplate(site.templateId)
    : undefined;

  return (
    <>
      {site.exclusivityDeadlineAt && (
        <div className="fixed bottom-4 left-4 z-50 flex max-w-sm items-start gap-2 rounded-xl border border-[color:var(--sbx-warn-line)] bg-[color:var(--sbx-warn-bg)] px-4 py-3 text-[13px] text-[color:var(--sbx-warn-fg)] shadow-lg">
          <TriangleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            O template deste site ficou exclusivo de outro usuário. Ele sai do
            ar em {format(site.exclusivityDeadlineAt, "dd/MM/yyyy 'às' HH:mm")}.{" "}
            <Link className="underline" href="/criador-de-sites/novo">
              Criar um site novo
            </Link>
          </span>
        </div>
      )}
      <SiteEditorClient
        banner={
          mode !== "auto" ? (
            <ReviewBanner
              mode={mode}
              requestId={review?.id ?? null}
              siteId={site.id}
              state={
                review?.status === "draft" ||
                review?.status === "pending" ||
                review?.status === "changes_requested"
                  ? review.status
                  : "none"
              }
            />
          ) : actor.delegated ? (
            <>
              <strong>Site de cliente.</strong> Você está editando como o dono
              (menos excluir). As alterações valem na hora.
            </>
          ) : undefined
        }
        carregadoEm={carregadoEm}
        domain={publication?.domain ?? null}
        initialSite={review?.content ?? site.content}
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
    </>
  );
}
