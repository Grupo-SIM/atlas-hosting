import "server-only";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  pgBuilderPublication,
  pgBuilderSite,
  type User,
} from "@/lib/db/schema";
import { getUserWordPressSites } from "@/lib/server/utils";
import type { ContaMaster } from "./auth";

export type SitePdc =
  | {
      categorias: string[];
      dominio: string | null;
      id: string;
      nome: string;
      publicado: boolean;
      temBlog: boolean;
      tipo: "builder";
    }
  | { dominio: string; id: string; nome: string; tipo: "wordpress" };

/** Sites do Criador de Sites da conta, com o endereço publicado (se houver). */
export async function sitesBuilder(conta: ContaMaster): Promise<SitePdc[]> {
  const linhas = await db
    .select({
      content: pgBuilderSite.content,
      dominio: pgBuilderPublication.domain,
      id: pgBuilderSite.id,
      nome: pgBuilderSite.name,
      status: pgBuilderPublication.status,
    })
    .from(pgBuilderSite)
    .leftJoin(
      pgBuilderPublication,
      eq(pgBuilderPublication.siteId, pgBuilderSite.id)
    )
    .where(eq(pgBuilderSite.userId, conta.id))
    .orderBy(desc(pgBuilderSite.updatedAt));
  return linhas.map(l => ({
    categorias: (l.content.categories ?? []).map(c => c.name),
    dominio: l.dominio ?? null,
    id: l.id,
    nome: l.nome,
    publicado: l.status === "published",
    temBlog: (l.content.postLayout ?? []).length > 0,
    tipo: "builder",
  }));
}

/** WordPress do Plesk ligados aos domínios da organização da conta. */
export async function sitesWordPress(conta: ContaMaster): Promise<SitePdc[]> {
  if (conta.dominios.length === 0) return [];
  // `getUserWordPressSites` só lê `organization.domains[].domain`.
  const usuario = {
    organization: { domains: conta.dominios.map(domain => ({ domain })) },
  } as unknown as User;
  const lista = await getUserWordPressSites(usuario);
  return lista.map(w => ({
    dominio: w.domain,
    id: String(w.id),
    nome: w.name || w.domain,
    tipo: "wordpress",
  }));
}
