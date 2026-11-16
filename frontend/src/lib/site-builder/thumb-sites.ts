import type { Site } from "@repo/site-builder";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgBuilderSite } from "@/lib/db/schema";

/**
 * Conteúdo dos sites do usuário só para desenhar as miniaturas, numa consulta só e **fora** do caminho da página:
 * a página sai primeiro (cartões, nomes, status, botões) e cada miniatura entra quando isto resolve (Suspense).
 * Nunca rejeita: se falhar, os cartões ficam sem miniatura em vez de derrubar a tela.
 */
export function loadThumbSites(
  userId: string,
  ids: string[]
): Promise<Map<string, Site>> {
  if (ids.length === 0) return Promise.resolve(new Map());
  return db
    .select({ content: pgBuilderSite.content, id: pgBuilderSite.id })
    .from(pgBuilderSite)
    .where(
      and(eq(pgBuilderSite.userId, userId), inArray(pgBuilderSite.id, ids))
    )
    .then(rows => new Map(rows.map(r => [r.id, r.content])))
    .catch(error => {
      console.error(
        "[criador-de-sites] falha ao carregar as miniaturas:",
        error
      );
      return new Map<string, Site>();
    });
}
