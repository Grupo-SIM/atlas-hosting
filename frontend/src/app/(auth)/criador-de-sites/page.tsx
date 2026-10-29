import { SiteRenderer } from "@repo/site-builder";
import { desc, eq } from "drizzle-orm";
import { LayoutTemplate, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgBuilderSite } from "@/lib/db/schema";
import { requireBuilderUser } from "@/lib/site-builder/access";
import { FitSite } from "./components/FitSite";
import { Frame } from "./components/Frame";
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
            <Link
              className="flex items-center gap-1.5 rounded-full bg-[#d6f34a] px-[18px] py-2.5 font-medium text-[#1d1c1a] text-sm"
              href="/criador-de-sites/novo"
            >
              <Plus className="size-[15px]" />
              Criar site
            </Link>
          </div>

          {mySites.length > 0 ? (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-[18px]">
              {mySites.map(site => {
                const status: SiteStatus =
                  site.publicationStatus === "published"
                    ? "published"
                    : site.publicationStatus === "failed"
                      ? "failed"
                      : "draft";
                return (
                  <SiteCard
                    background={site.content.theme.bg ?? "#030712"}
                    domain={site.domain}
                    id={site.id}
                    key={site.id}
                    name={site.name}
                    status={status}
                    thumb={
                      <FitSite>
                        <SiteRenderer path="/" site={site.content} />
                      </FitSite>
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
