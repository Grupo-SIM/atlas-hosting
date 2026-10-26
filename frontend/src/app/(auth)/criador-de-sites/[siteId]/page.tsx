import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { pgBuilderSite } from "@/lib/db/schema";
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

  return <SiteEditorClient initialSite={site.content} siteId={site.id} />;
}
