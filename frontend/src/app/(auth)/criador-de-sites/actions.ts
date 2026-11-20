"use server";

import {
  type Category,
  imageFormatError,
  isWordpressTemplate,
  mediaKindOf,
  type Post,
  UPLOAD_LIMIT_MB,
  uploadLimitBytes,
} from "@repo/site-builder";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { pgBuilderPublication, pgBuilderSite } from "@/lib/db/schema";
import {
  canUseWordpressTemplates,
  FORBIDDEN_MESSAGE,
  getBuilderUser,
} from "@/lib/site-builder/access";
import {
  getAdminMode,
  resolveSiteActor,
  saveProposal,
} from "@/lib/site-builder/delegation";
import { checkSiteContent } from "@/lib/site-builder/site-content";
import { takeDown } from "@/lib/site-builder/takedown";
import { getEffectiveTemplate } from "@/lib/site-builder/templates";
import { resolveYoutubeChannel as lookupYoutubeChannel } from "@/lib/site-builder/youtube";
import {
  getStorjUrl,
  uploadSiteBuilderFont,
  uploadSiteBuilderImage,
  uploadSiteBuilderVideo,
} from "@/lib/storj";
import {
  BLOCKED_SITE_MESSAGE,
  templateUseError,
} from "@/lib/template-exclusivity/status";

const MAX_IMAGE_BYTES = uploadLimitBytes("image");
const MAX_FONT_BYTES = uploadLimitBytes("font");
const MAX_VIDEO_BYTES = uploadLimitBytes("video");

type ActionResult = { ok: true } | { error: string; ok: false };

export type SaveSiteResult =
  | {
      aviso?: string;
      mesclar?: { categories: Category[]; posts: Post[] };
      ok: true;
      /** Novo "aberto em" do editor: o que chegou até aqui ele já conhece. */
      sincronizadoEm?: string;
    }
  | { error: string; ok: false };

/**
 * Posts da Produção de Conteúdo (`origem`) que entraram no banco depois de `abertoEm`
 * e o editor ainda não conhece: o autosave dele não pode apagá-los nem voltar a versão antiga.
 */
function postsQueChegaram(
  noBanco: { categories: Category[]; posts: Post[] },
  enviado: { categories: Category[]; posts: Post[] },
  abertoEm: string
): { categories: Category[]; posts: Post[] } {
  const enviados = new Map(enviado.posts.map(p => [p.id, p]));
  const posts = noBanco.posts.filter(p => {
    if (!p.origem || p.origem.em <= abertoEm) return false;
    const doEditor = enviados.get(p.id);
    return !doEditor || (doEditor.origem?.em ?? "") < p.origem.em;
  });
  const catsEnviadas = new Set(enviado.categories.map(c => c.id));
  const usadas = new Set(posts.map(p => p.categoryId));
  const categories = noBanco.categories.filter(
    c => usadas.has(c.id) && !catsEnviadas.has(c.id)
  );
  return { categories, posts };
}

/** Cria o site do usuário a partir de um template. A tela de configuração publica e abre o editor depois. */
export async function createSite(input: {
  name: string;
  templateId: string;
}): Promise<{ ok: true; siteId: string } | { error: string; ok: false }> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };

  const template = await getEffectiveTemplate(input.templateId);
  if (!template) return { error: "Template não encontrado.", ok: false };
  // Cópias para sites importados do WordPress: só o admin master e quem ele liberou.
  if (
    isWordpressTemplate(template.id) &&
    !(await canUseWordpressTemplates(user))
  ) {
    return { error: "Template não encontrado.", ok: false };
  }

  // Template exclusivo de outra pessoa: ninguém mais cria site com ele.
  const blocked = await templateUseError(template.id, user.id);
  if (blocked) return { error: blocked, ok: false };

  const name = input.name.trim();
  if (name.length === 0 || name.length > 120) {
    return { error: "Informe um nome de até 120 caracteres.", ok: false };
  }

  const [site] = await db
    .insert(pgBuilderSite)
    .values({
      content: { ...template.site, name },
      name,
      templateId: template.id,
      userId: user.id,
    })
    .returning({ id: pgBuilderSite.id });

  revalidatePath("/criador-de-sites");
  return { ok: true, siteId: site.id };
}

export async function deleteSite(formData: FormData): Promise<ActionResult> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const siteId = String(formData.get("siteId") ?? "");

  // Excluir o site não pode deixá-lo no ar sem dono: tira do servidor e do DNS antes.
  const [owned] = await db
    .select({ id: pgBuilderSite.id })
    .from(pgBuilderSite)
    .where(and(eq(pgBuilderSite.id, siteId), eq(pgBuilderSite.userId, user.id)))
    .limit(1);
  const publication = owned
    ? await db.query.pgBuilderPublication.findFirst({
        where: eq(pgBuilderPublication.siteId, owned.id),
      })
    : undefined;
  if (publication) {
    const result = await takeDown(user.id, publication, undefined, {
      detachOnSshFailure: true,
    });
    if (!result.ok) return result;
  }

  await db
    .delete(pgBuilderSite)
    .where(
      and(
        eq(pgBuilderSite.id, String(formData.get("siteId") ?? "")),
        eq(pgBuilderSite.userId, user.id)
      )
    );
  revalidatePath("/criador-de-sites");
  return { ok: true };
}

/** Grava o site editado. O editor roda no navegador, então o conteúdo é revalidado aqui. */
export async function saveSite(
  siteId: string,
  content: unknown,
  /** Quando o editor carregou (ou sincronizou) o site, em ISO; protege posts que chegaram depois. */
  abertoEm?: string
): Promise<SaveSiteResult> {
  const user = await getBuilderUser();
  if (!user) return { error: FORBIDDEN_MESSAGE, ok: false };
  const agora = new Date();

  // O dono, ou um admin liberado pelo master (que edita como o dono, menos excluir).
  const actor = await resolveSiteActor(user, siteId);
  if (!actor) return { error: "Site não encontrado.", ok: false };
  if (actor.site.exclusivityBlockedAt) {
    return { error: BLOCKED_SITE_MESSAGE, ok: false };
  }

  // Conserta o que seria recusado (um estilo inválido, uma página sem título) em vez de perder o site inteiro.
  const parsed = checkSiteContent(content);
  if (!parsed.ok) return { error: parsed.error, ok: false };

  // Admin editando site de cliente: validação automática (padrão) salva direto; as outras guardam uma proposta que o
  // dono ou o Lucas valida, e o site real só muda se for aprovada.
  if (actor.delegated) {
    const mode = await getAdminMode(user.id);
    if (mode !== "auto") {
      const saved = await saveProposal(siteId, user.id, parsed.site, mode);
      return saved.ok ? { aviso: parsed.aviso, ok: true } : saved;
    }
  }

  const mesclar =
    abertoEm && !Number.isNaN(Date.parse(abertoEm))
      ? postsQueChegaram(actor.site.content, parsed.site, abertoEm)
      : { categories: [], posts: [] };
  const novos = new Set(mesclar.posts.map(p => p.id));
  const merged = {
    ...parsed.site,
    categories: [...parsed.site.categories, ...mesclar.categories],
    posts: [
      ...mesclar.posts,
      ...parsed.site.posts.filter(p => !novos.has(p.id)),
    ],
  };

  const updated = await db
    .update(pgBuilderSite)
    .set({
      content: merged,
      name: parsed.site.name,
      updatedAt: agora,
    })
    .where(
      and(
        eq(pgBuilderSite.id, siteId),
        eq(pgBuilderSite.userId, actor.owner.id)
      )
    )
    .returning({ id: pgBuilderSite.id });

  if (updated.length === 0) {
    return { error: "Site não encontrado.", ok: false };
  }
  return {
    aviso: parsed.aviso,
    mesclar: mesclar.posts.length > 0 ? mesclar : undefined,
    ok: true,
    sincronizadoEm: agora.toISOString(),
  };
}

/** Envia uma imagem do editor e devolve a URL pública. */
export async function uploadSiteImage(
  formData: FormData
): Promise<{ ok: true; url: string } | { error: string; ok: false }> {
  if (!(await getBuilderUser())) {
    return { error: FORBIDDEN_MESSAGE, ok: false };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || mediaKindOf(file) !== "image") {
    return { error: "Envie um arquivo de imagem.", ok: false };
  }
  const badFormat = imageFormatError(file);
  if (badFormat) return { error: badFormat, ok: false };
  if (file.size > MAX_IMAGE_BYTES) {
    return {
      error: `A imagem deve ter no máximo ${UPLOAD_LIMIT_MB.image} MB.`,
      ok: false,
    };
  }

  try {
    const key = await uploadSiteBuilderImage(await file.arrayBuffer());
    const url = getStorjUrl(key);
    if (!url) return { error: "Não foi possível enviar a imagem.", ok: false };
    return { ok: true, url };
  } catch (error) {
    console.error("Erro no upload de imagem do Criador de Sites:", error);
    const detail = error instanceof Error ? error.message : "";
    if (detail.includes("Storj incompletas")) {
      return {
        error: "Armazenamento de imagens não configurado no servidor.",
        ok: false,
      };
    }
    if (/unsupported image format|Input (buffer|file)/i.test(detail)) {
      return {
        error: "Formato de imagem não suportado. Use PNG, JPG, WebP ou SVG.",
        ok: false,
      };
    }
    return {
      error: "Não foi possível enviar a imagem (falha no armazenamento).",
      ok: false,
    };
  }
}

/** Tipo da fonte pelos primeiros bytes (não confia na extensão nem no MIME do navegador). */
function fontExtension(
  bytes: Uint8Array
): "otf" | "ttf" | "woff" | "woff2" | null {
  const tag = String.fromCharCode(...bytes.slice(0, 4));
  if (tag === "wOF2") return "woff2";
  if (tag === "wOFF") return "woff";
  if (tag === "OTTO") return "otf";
  if (tag === "true" || tag === "   ") return "ttf";
  return null;
}

/** Fonte própria (.woff2, .woff, .ttf, .otf) para o editor do Criador de Sites. */
export async function uploadSiteFont(
  formData: FormData
): Promise<
  { name: string; ok: true; url: string } | { error: string; ok: false }
> {
  if (!(await getBuilderUser())) {
    return { error: FORBIDDEN_MESSAGE, ok: false };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Envie um arquivo de fonte.", ok: false };
  }
  if (file.size > MAX_FONT_BYTES) {
    return {
      error: `A fonte deve ter no máximo ${UPLOAD_LIMIT_MB.font} MB.`,
      ok: false,
    };
  }

  const buffer = await file.arrayBuffer();
  const ext = fontExtension(new Uint8Array(buffer));
  if (!ext) {
    return { error: "Use um arquivo .woff2, .woff, .ttf ou .otf.", ok: false };
  }

  try {
    const url = getStorjUrl(await uploadSiteBuilderFont(buffer, ext));
    if (!url) return { error: "Não foi possível enviar a fonte.", ok: false };
    const name = file.name
      .replace(/\.[^.]+$/, "")
      .replace(/[^A-Za-z0-9 _-]+/g, " ")
      .trim()
      .slice(0, 40);
    return { name: name || "Minha fonte", ok: true, url };
  } catch (error) {
    console.error("Erro no upload de fonte do Criador de Sites:", error);
    return { error: "Não foi possível enviar a fonte.", ok: false };
  }
}

/** Tipo do vídeo pelos primeiros bytes: MP4 (`ftyp` no byte 4) ou WebM (EBML). */
function videoExtension(bytes: Uint8Array): "mp4" | "webm" | null {
  const tag = String.fromCharCode(...bytes.slice(4, 8));
  if (tag === "ftyp") return "mp4";
  if (
    bytes[0] === 0x1a &&
    bytes[1] === 0x45 &&
    bytes[2] === 0xdf &&
    bytes[3] === 0xa3
  ) {
    return "webm";
  }
  return null;
}

/** Vídeo (MP4 ou WebM, limite em `UPLOAD_LIMIT_MB.video`) para os anúncios do editor. */
export async function uploadSiteVideo(
  formData: FormData
): Promise<{ ok: true; url: string } | { error: string; ok: false }> {
  if (!(await getBuilderUser())) {
    return { error: FORBIDDEN_MESSAGE, ok: false };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { error: "Envie um arquivo de vídeo.", ok: false };
  }
  if (file.size > MAX_VIDEO_BYTES) {
    return {
      error: `O vídeo deve ter no máximo ${UPLOAD_LIMIT_MB.video} MB.`,
      ok: false,
    };
  }

  const buffer = await file.arrayBuffer();
  const ext = videoExtension(new Uint8Array(buffer));
  if (!ext) {
    return { error: "Use um vídeo MP4 ou WebM.", ok: false };
  }

  try {
    const url = getStorjUrl(await uploadSiteBuilderVideo(buffer, ext));
    if (!url) return { error: "Não foi possível enviar o vídeo.", ok: false };
    return { ok: true, url };
  } catch (error) {
    console.error("Erro no upload de vídeo do Criador de Sites:", error);
    const detail = error instanceof Error ? error.message : "";
    return {
      error: detail.includes("Storj incompletas")
        ? "Armazenamento não configurado no servidor."
        : "Não foi possível enviar o vídeo.",
      ok: false,
    };
  }
}

/** Confere um canal do YouTube (link, @usuario ou ID) para o campo "Canal" do editor. */
export async function resolveYoutubeChannel(
  input: string
): Promise<
  { id: string; name: string; ok: true } | { error: string; ok: false }
> {
  if (!(await getBuilderUser())) {
    return { error: FORBIDDEN_MESSAGE, ok: false };
  }
  if (typeof input !== "string" || input.length > 300) {
    return {
      error: "Cole o link do canal, o @usuario ou o ID (UC…).",
      ok: false,
    };
  }
  try {
    return { ...(await lookupYoutubeChannel(input)), ok: true };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Não achei esse canal.",
      ok: false,
    };
  }
}
