import { SiteRenderer, thumbnailSite } from "@repo/site-builder";
import { format } from "date-fns";
import { desc, eq } from "drizzle-orm";
import { Crown, LayoutTemplate, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgBuilderSite } from "@/lib/db/schema";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { Frame } from "./components/Frame";
import { LiveThumb } from "./components/LiveThumb";
import SiteCard, { type SiteStatus } from "./components/SiteCard";

export const metadata: Metadata = {
  description: "Crie e edite seus sites a partir de templates prontos",
  title: "Criador de Sites - Atlas Hosting",
};

export default async function SiteBuilderPage() {
  const user = await requireBuilderUser();
  const mySites = await db
    .select({
      content: pgBuilderSite.content,
      blockedAt: pgBuilderSite.exclusivityBlockedAt,
      deadlineAt: pgBuilderSite.exclusivityDeadlineAt,
      domain: pgBuilderPublication.domain,
      id: pgBuilderSite.id,
      name: pgBuilderSite.name,
      publicationStatus: pgBuilderPublication.status,
    })
    .from(pgBuilderSite)
    .leftJoin(
      pgBuilderPublication,
      eq(pgBuilderPublication.siteId, pgBuilderSite.id)
    )
    .where(eq(pgBuilderSite.userId, user.id))
    .orderBy(desc(pgBuilderSite.updatedAt));

  if (mySites.length === 0) redirect("/criador-de-sites/novo");

  const live = mySites.filter(s => s.publicationStatus === "published").length;
  const waiting = mySites.length - live;

  return (
    <Frame
      crumbs={[{ label: "Sites" }]}
      icon={<LayoutTemplate className="size-[15px]" />}
    >
      <div className="flex-1 overflow-auto px-5 pt-9 pb-20 md:px-10">
        <div className="flex flex-col gap-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <h1 className="font-medium text-[28px] tracking-[-0.02em]">
                Meus sites
              </h1>
              <p className="text-[#6e6b65] text-sm">
                {mySites.length === 0
                  ? "Você ainda não criou nenhum site."
                  : `${live} no ar · ${waiting} sem publicar`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="flex items-center gap-1.5 rounded-full border border-[#e0ddd5] bg-white px-[18px] py-2.5 text-[#1d1c1a] text-sm"
                href="/criador-de-sites/exclusividades"
              >
                <Crown className="size-[15px]" />
                Exclusividades
              </Link>
              <Link
                className="flex items-center gap-1.5 rounded-full bg-[#d6f34a] px-[18px] py-2.5 font-medium text-[#1d1c1a] text-sm"
                href="/criador-de-sites/novo"
              >
                <Plus className="size-[15px]" />
                Criar site
              </Link>
            </div>
          </div>

          {mySites.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px]">
              {mySites.map(site => {
                const status: SiteStatus =
                  site.publicationStatus === "published"
                    ? "published"
                    : site.publicationStatus === "failed"
                      ? "failed"
                      : site.publicationStatus === "suspended"
                        ? "suspended"
                        : "draft";
                return (
                  <SiteCard
                    background={site.content.theme.bg ?? "#030712"}
                    domain={site.domain}
                    exclusivityNotice={
                      site.blockedAt
                        ? "Bloqueado: o template é exclusivo de outro usuário. Crie um site novo com outro template."
                        : site.deadlineAt
                          ? `O template ficou exclusivo de outro usuário: este site sai do ar em ${format(site.deadlineAt, "dd/MM/yyyy")}.`
                          : null
                    }
                    id={site.id}
                    key={site.id}
                    name={site.name}
                    status={status}
                    thumb={
                      <LiveThumb>
                        <SiteRenderer
                          path="/"
                          site={thumbnailSite(site.content)}
                          skipFxRuntime
                          thumbnail
                        />
                      </LiveThumb>
                    }
                  />
                );
              })}
            </div>
          ) : (
            <Link
              className="flex flex-col items-center gap-2 rounded-[14px] border border-[#d9d6ce] border-dashed p-12 text-center text-[#6e6b65] text-sm hover:border-[#c9c5bc]"
              href="/criador-de-sites/novo"
            >
              <Plus className="size-5" />
              Escolha um template e crie seu primeiro site
            </Link>
          )}
        </div>
      </div>
    </Frame>
  );
}
