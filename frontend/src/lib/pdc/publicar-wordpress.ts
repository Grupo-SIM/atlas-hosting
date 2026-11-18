import "server-only";
import { markdownParaHtml } from "@repo/site-builder";
import pleskApi from "@/lib/server/apis/plesk";
import type { ContaMaster } from "./auth";
import type { PostPdc, ResultadoPdc } from "./publicar-builder";
import { sitesWordPress } from "./sites";

/**
 * Roda um comando WP-CLI e devolve o stdout; erro se o comando falhou.
 * Os argumentos vão em lista direto para a CLI do Plesk (sem o `parseCommand` do
 * wp-toolkit): o HTML do post tem aspas e quebras de linha que quebrariam a string.
 */
async function wp(instancia: number, args: string[]): Promise<string> {
  const resposta = await pleskApi.cliApi.cliIdCallPost("extension", {
    params: [
      "--call",
      "wp-toolkit",
      "--wp-cli",
      "-instance-id",
      String(instancia),
      "--",
      ...args,
    ],
  });
  const r = resposta.data as {
    code?: number;
    stderr?: string;
    stdout?: string;
  };
  const saida = String(r.stdout ?? "").trim();
  if (r.code !== undefined && r.code !== 0) {
    const erro = String(r.stderr || saida || `código ${r.code}`).trim();
    throw new Error(`WP-CLI: ${erro.slice(0, 300)}`);
  }
  return saida;
}

/** Categoria pelo nome: usa a que existe ou cria. */
async function categoriaWp(instancia: number, nome: string): Promise<string> {
  const achada = await wp(instancia, [
    "term",
    "list",
    "category",
    `--name=${nome}`,
    "--field=term_id",
  ]);
  if (achada) return achada.split(/\s+/)[0] ?? "";
  return wp(instancia, ["term", "create", "category", nome, "--porcelain"]);
}

/**
 * Cria ou atualiza o post no WordPress (meta `pdc_id` evita duplicar) e põe a capa,
 * que já foi enviada ao Storj pelo chamador (`capaUrl`).
 */
export async function publicarNoWordPress(
  conta: ContaMaster,
  siteId: string,
  post: PostPdc,
  capaUrl: string | null
): Promise<ResultadoPdc> {
  const site = (await sitesWordPress(conta)).find(s => s.id === siteId);
  if (!site)
    return { error: "WordPress não encontrado nesta conta.", ok: false };
  const instancia = Number(site.id);

  const campos = [
    `--post_title=${post.titulo}`,
    `--post_content=${markdownParaHtml(post.corpoMd)}`,
    `--post_excerpt=${post.resumo ?? ""}`,
  ];
  if (post.categoria?.trim()) {
    const cat = await categoriaWp(instancia, post.categoria.trim());
    if (cat) campos.push(`--post_category=${cat}`);
  }

  const existente = (
    await wp(instancia, [
      "post",
      "list",
      "--post_type=post",
      "--post_status=any",
      "--meta_key=pdc_id",
      `--meta_value=${post.pdcId}`,
      "--format=ids",
    ])
  ).split(/\s+/)[0];

  let id: string;
  if (existente) {
    await wp(instancia, ["post", "update", existente, ...campos]);
    id = existente;
  } else {
    id = await wp(instancia, [
      "post",
      "create",
      "--post_type=post",
      "--post_status=publish",
      ...(post.slug ? [`--post_name=${post.slug}`] : []),
      `--meta_input=${JSON.stringify({ pdc_id: post.pdcId })}`,
      ...campos,
      "--porcelain",
    ]);
    if (!/^\d+$/.test(id))
      return { error: "O WordPress não devolveu o post criado.", ok: false };
  }

  let aviso: string | undefined;
  if (capaUrl) {
    try {
      await wp(instancia, [
        "media",
        "import",
        capaUrl,
        `--post_id=${id}`,
        "--featured_image",
        `--alt=${post.capa?.alt ?? post.titulo}`,
        `--title=${post.titulo}`,
        "--porcelain",
      ]);
    } catch (e) {
      aviso = `Post publicado sem capa: ${e instanceof Error ? e.message : "falha"}`;
    }
  }

  const url = await wp(instancia, [
    "post",
    "list",
    `--post__in=${id}`,
    "--post_type=post",
    "--field=url",
  ]).catch(() => "");
  return {
    atualizado: !!existente,
    aviso,
    ok: true,
    postId: id,
    url: url || null,
  };
}
