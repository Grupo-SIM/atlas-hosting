import { SiteRenderer } from "@repo/site-builder";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { getReview } from "@/lib/site-builder/delegation";

export const metadata: Metadata = {
  title: "Pré-visualização da alteração - Atlas Hosting",
};

/**
 * Pré-visualização da revisão: o site como o admin o deixou (padrão) ou o site de hoje (`?v=atual`), para comparar.
 * Só o revisor e o admin autor da proposta veem.
 */
export default async function ChangePreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ path?: string[]; requestId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireBuilderUser();
  const { path = [], requestId } = await params;
  const review = await getReview(requestId, user);
  if (!review) notFound();
  const raw = await searchParams;
  const current = raw.v === "atual";
  const query = Object.fromEntries(
    Object.entries(raw).flatMap(([k, v]) =>
      k !== "v" && typeof v === "string" ? [[k, v]] : []
    )
  );
  const base = `/criador-de-sites/aprovacoes/${requestId}`;

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 border-b bg-background px-4 py-2">
        <div className="text-sm">
          <span className="text-muted-foreground">
            {current ? "Site de hoje: " : "Como ficaria com a alteração: "}
          </span>
          <strong>{review.site.name}</strong>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="rounded-md border px-3 py-1 text-sm"
            href={`${base}/previa${path.length ? `/${path.join("/")}` : ""}${current ? "" : "?v=atual"}`}
          >
            {current ? "Ver com a alteração" : "Ver o site de hoje"}
          </Link>
          <Link className="rounded-md border px-3 py-1 text-sm" href={base}>
            Voltar à revisão
          </Link>
        </div>
      </div>
      <SiteRenderer
        basePath={`${base}/previa`}
        path={`/${path.join("/")}`}
        query={query}
        site={current ? review.site.content : review.request.content}
      />
    </div>
  );
}
