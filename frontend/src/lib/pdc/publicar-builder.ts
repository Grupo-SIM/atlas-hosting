import "server-only";
import { inserirPostExterno, siteSchema } from "@repo/site-builder";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgBuilderSite } from "@/lib/db/schema";
import { getAtlasHostingConfig } from "@/lib/site-builder/config";
import { runPublish } from "@/lib/site-builder/runPublish";
import { getStorjUrl, uploadSiteBuilderImage } from "@/lib/storj";
import type { ContaMaster } from "./auth";

const MAX_CAPA_BYTES = 8 * 1024 * 1024;

/** Corpo de `POST /api/pdc/posts`. */
export const postPdcSchema = z.object({
  capa: z
    .object({
      alt: z.string().max(300).optional(),
      base64: z.string().min(1).max(12_000_000),
      tipo: z.string().regex(/^image\/[a-z0-9.+-]+$/i),
    })
    .nullish(),
  categoria: z.string().max(80).nullish(),
  corpoMd: z.string().min(1).max(200_000),
  destino: z.object({
    id: z.string().min(1).max(64),
    tipo: z.enum(["builder", "wordpress"]),
  }),
  pdcId: z.string().regex(/^[\w-]{1,80}$/),
  resumo: z.string().max(1000).nullish(),
  slug: z.string().max(200).nullish(),
  titulo: z.string().trim().min(1).max(300),
});

export type PostPdc = z.infer<typeof postPdcSchema>;

export type ResultadoPdc =
  | {
      atualizado: boolean;
      aviso?: string;
      ok: true;
      postId: string;
      url: string | null;
    }
  | { error: string; ok: false };

/** Sobe a capa (base64) para o Storj, como o upload do editor. */
export async function subirCapa(
  capa: NonNullable<PostPdc["capa"]>
): Promise<string> {
  const buffer = Buffer.from(capa.base64, "base64");
  if (buffer.length === 0) throw new Error("Capa vazia.");
  if (buffer.length > MAX_CAPA_BYTES)
    throw new Error("A capa deve ter no máximo 8 MB.");
  const url = getStorjUrl(await uploadSiteBuilderImage(buffer));
  if (!url) throw new Error("Não foi possível guardar a capa.");
  return url;
}

// Dois posts no mesmo site ao mesmo tempo: o segundo espera o primeiro republicar.
const filaPorSite = new Map<string, Promise<unknown>>();
function naFila<T>(siteId: string, tarefa: () => Promise<T>): Promise<T> {
  const anterior = filaPorSite.get(siteId) ?? Promise.resolve();
  const atual = anterior.catch(() => undefined).then(tarefa);
  filaPorSite.set(siteId, atual);
  atual
    .finally(() => {
      if (filaPorSite.get(siteId) === atual) filaPorSite.delete(siteId);
    })
    .catch(() => undefined);
  return atual;
}

const urlDoPost = (dominio: string, slug: string) =>
  `https://${dominio}/${slug}/`;

/**
 * Grava o post no JSON do site (cria ou atualiza pelo `pdcId`) e republica o site,
 * se ele já estiver no ar. Site suspenso ou com falha não é republicado.
 */
export function publicarNoBuilder(
  conta: ContaMaster,
  siteId: string,
  post: PostPdc,
  capaUrl: string | null
): Promise<ResultadoPdc> {
  return naFila(siteId, async () => {
    const gravado = await db.transaction(async tx => {
      const [linha] = await tx
        .select({
          blockedAt: pgBuilderSite.exclusivityBlockedAt,
          content: pgBuilderSite.content,
        })
        .from(pgBuilderSite)
        .where(
          and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, conta.id))
        )
        .for("update")
        .limit(1);
      if (!linha)
        return {
          error: "Site não encontrado nesta conta.",
          ok: false as const,
        };
      if (linha.blockedAt)
        return {
          error: "Site bloqueado pela exclusividade do template.",
          ok: false as const,
        };

      const r = inserirPostExterno(linha.content, {
        capa: capaUrl,
        categoria: post.categoria ?? null,
        corpoMd: post.corpoMd,
        origemId: post.pdcId,
        resumo: post.resumo ?? "",
        slug: post.slug ?? undefined,
        titulo: post.titulo,
      });
      const valido = siteSchema.safeParse(r.site);
      if (!valido.success)
        return {
          error: "O post deixaria o site inválido e não foi salvo.",
          ok: false as const,
        };
      await tx
        .update(pgBuilderSite)
        .set({ content: valido.data, updatedAt: new Date() })
        .where(eq(pgBuilderSite.id, siteId));
      return { ok: true as const, ...r };
    });
    if (!gravado.ok) return gravado;

    const base = {
      atualizado: gravado.atualizado,
      ok: true as const,
      postId: gravado.post.id,
    };
    const publicacao = await db.query.pgBuilderPublication.findFirst({
      where: eq(pgBuilderPublication.siteId, siteId),
    });
    if (!publicacao)
      return {
        ...base,
        aviso:
          "O site ainda não foi publicado: o post sobe junto na primeira publicação.",
        url: null,
      };
    if (publicacao.status !== "published")
      return {
        ...base,
        aviso: `O site está ${publicacao.status === "suspended" ? "suspenso" : "com falha na publicação"}: o post foi salvo, mas não foi ao ar.`,
        url: null,
      };

    // Mesmo caminho da reativação da hospedagem (renewal.ts): republica no endereço atual.
    const { baseDomain } = getAtlasHostingConfig();
    const label =
      publicacao.kind === "subdomain" && baseDomain
        ? publicacao.domain.replace(`.${baseDomain}`, "")
        : undefined;
    const pub = await runPublish(
      { id: conta.id, organizationId: conta.organizationId },
      {
        domain: publicacao.domain,
        kind: publicacao.kind,
        label,
        siteId,
        target: publicacao.target,
        vpsNodeId: publicacao.vpsNodeId ?? undefined,
      },
      { skipHostingCheck: true }
    );
    if (!pub.ok)
      return {
        ...base,
        aviso: `Post salvo, mas a republicação do site falhou: ${pub.error}`,
        url: null,
      };
    return { ...base, url: urlDoPost(pub.domain, gravado.post.slug) };
  });
}
