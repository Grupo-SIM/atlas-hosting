import { diffSites, type SiteChange } from "@repo/site-builder";
import { Eye } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { getReview } from "@/lib/site-builder/delegation";
import { Frame } from "../../components/Frame";
import ReviewPanel from "../../components/ReviewPanel";

export const metadata: Metadata = {
  title: "Validar alterações - Atlas Hosting",
};

const ICON: Record<SiteChange["type"], string> = {
  added: "+",
  changed: "~",
  removed: "−",
};

const STATUS: Record<string, string> = {
  approved: "Aprovada",
  changes_requested: "Ajustes pedidos",
  draft: "Rascunho do admin (ainda não enviado)",
  pending: "Aguardando validação",
  rejected: "Substituída",
};

/** Revisão de uma alteração de admin em site de cliente: o que mudou, a prévia e a conversa, como num PR. */
export default async function ReviewPage({
  params,
}: {
  params: Promise<{ requestId: string }>;
}) {
  const user = await requireBuilderUser();
  const { requestId } = await params;
  const review = await getReview(requestId, user);
  if (!review) notFound();

  const changes = diffSites(review.site.content, review.request.content);
  const byArea = new Map<string, SiteChange[]>();
  for (const change of changes) {
    byArea.set(change.area, [...(byArea.get(change.area) ?? []), change]);
  }
  const waiting = review.request.status === "pending";

  return (
    <Frame
      closeHref="/criador-de-sites"
      crumbs={[
        { href: "/criador-de-sites", label: "Sites" },
        { label: `Validar: ${review.site.name}` },
      ]}
    >
      <div className="mx-auto flex w-full max-w-[880px] flex-1 flex-col gap-6 px-5 pt-9 pb-20">
        <div className="flex flex-col gap-1.5">
          <h1 className="font-medium text-[26px] tracking-[-0.02em]">
            {review.site.name}
          </h1>
          <p className="text-[color:var(--sbx-mute)] text-sm">
            Alterações de {review.requester.name} ({review.requester.email}) ·{" "}
            <strong>
              {STATUS[review.request.status] ?? review.request.status}
            </strong>{" "}
            · validação com{" "}
            {review.request.reviewer === "owner" ? "o dono do site" : "o Lucas"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            className="flex items-center gap-1.5 rounded-full bg-[#d6f34a] px-[18px] py-2.5 font-medium text-[#1d1c1a] text-sm"
            href={`/criador-de-sites/aprovacoes/${requestId}/previa`}
            target="_blank"
          >
            <Eye className="size-[15px]" />
            Ver como ficou (pré-visualização)
          </Link>
          <Link
            className="flex items-center gap-1.5 rounded-full border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] px-[18px] py-2.5 text-sm"
            href={`/criador-de-sites/aprovacoes/${requestId}/previa?v=atual`}
            target="_blank"
          >
            Ver o site de hoje
          </Link>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="font-medium text-base">
            O que mudou{" "}
            <span className="font-normal text-[color:var(--sbx-mute)] text-sm">
              ({changes.length})
            </span>
          </h2>
          {changes.length === 0 ? (
            <p className="rounded-[14px] border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] p-5 text-[color:var(--sbx-mute)] text-sm">
              A proposta é igual ao site de hoje: não há diferença para validar.
            </p>
          ) : (
            [...byArea.entries()].map(([area, list]) => (
              <div
                className="flex flex-col gap-1.5 rounded-[14px] border border-[color:var(--sbx-line)] bg-[color:var(--sbx-card)] p-4"
                key={area}
              >
                <div className="font-medium text-sm">{area}</div>
                {list.map(change => (
                  <div
                    className="flex gap-2 text-[13px]"
                    key={`${change.type}-${change.text}`}
                  >
                    <span
                      className={`w-4 shrink-0 text-center font-mono ${
                        change.type === "added"
                          ? "text-[color:var(--sbx-ok-fg)]"
                          : change.type === "removed"
                            ? "text-[color:var(--sbx-err-fg)]"
                            : "text-[color:var(--sbx-warn-fg)]"
                      }`}
                    >
                      {ICON[change.type]}
                    </span>
                    <span>{change.text}</span>
                  </div>
                ))}
              </div>
            ))
          )}
        </section>

        <ReviewPanel
          canDecide={review.role === "reviewer" && waiting}
          comments={review.comments.map(c => ({
            authorName: c.authorName ?? "Usuário removido",
            body: c.body,
            createdAt: c.createdAt.toISOString(),
            id: c.id,
            kind: c.kind,
          }))}
          requestId={requestId}
          role={review.role}
        />
      </div>
    </Frame>
  );
}
