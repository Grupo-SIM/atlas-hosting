import { getTemplate } from "@repo/site-builder";
import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgBuilderSite } from "@/lib/db/schema";
import { requireBuilderUser } from "@/lib/site-builder/access";
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

  const publication = await db.query.pgBuilderPublication.findFirst({
    where: eq(pgBuilderPublication.siteId, site.id),
  });
  const original = site.templateId ? getTemplate(site.templateId) : undefined;

  return (
    <SiteEditorClient
      domain={publication?.domain ?? null}
      initialSite={site.content}
      originalSite={original?.site}
      publishWithPassword={publication?.target === "user_vps"}
      siteId={site.id}
    />
  );
}
