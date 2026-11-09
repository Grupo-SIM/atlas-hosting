const DOMAIN_RE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;

/**
 * O domínio vira nome de pasta, bloco do Caddyfile e argumento de comandos remotos,
 * então só entra o que for um hostname válido — nada de espaços, aspas, `;` ou `..`.
 */
export function assertValidDomain(domain: string): string {
  const normalized = domain.trim().toLowerCase();
  if (normalized.length > 253 || !DOMAIN_RE.test(normalized)) {
    throw new Error(`Domínio inválido: ${domain}`);
  }
  return normalized;
}

/** Cada site ocupa `/srv/www/<dominio>`. O container do Caddy precisa enxergar `/srv/www` neste mesmo caminho. */
export const WEB_ROOT = "/srv/www";

const ROOT_RE = /^\/[A-Za-z0-9._/-]+$/;

/** Pasta do site: no servidor (`webRoot`) ou como o Caddy a enxerga (`caddyRoot`, quando o container monta outro caminho). */
export function assertValidRoot(root: string): string {
  const clean = root.trim().replace(/\/+$/, "");
  if (!ROOT_RE.test(clean) || clean.split("/").includes("..")) {
    throw new Error(`Pasta inválida: ${root}`);
  }
  return clean;
}

/** Caddyfile base lido pelo caddy-docker-proxy; os blocos dos sites são acrescentados a ele. */
export const CADDYFILE_BASE = "/opt/caddy/Caddyfile.base";

export const siteDir = (domain: string, root: string = WEB_ROOT) =>
  `${assertValidRoot(root)}/${domain}`;

const beginMarker = (domain: string) => `# BEGIN atlas-site ${domain}`;
const endMarker = (domain: string) => `# END atlas-site ${domain}`;

/**
 * Bloco acrescentado ao Caddyfile.base. Os marcadores permitem que o redeploy substitua o bloco
 * do próprio site sem duplicar nem tocar no resto do arquivo. `www.` só entra no domínio próprio.
 */
export function buildSiteBlock(
  domain: string,
  includeWww: boolean,
  caddyRoot: string = WEB_ROOT
): string {
  const hosts = includeWww ? `${domain}, www.${domain}` : domain;
  return `${beginMarker(domain)}
${hosts} {
	root * ${siteDir(domain, caddyRoot)}
	encode gzip
	file_server

	handle_errors {
		rewrite * /404.html
		file_server
	}
}
${endMarker(domain)}
`;
}

/** Procura o domínio como endereço de site em qualquer trecho do Caddyfile que não seja nosso. */
function conflictPattern(domain: string): string {
  const escaped = domain.replaceAll(".", "\\.");
  return `(^|[[:space:],])(www\\.)?${escaped}([[:space:],{:]|$)`;
}

/**
 * Script remoto:
 *  1. (sob `flock`) confere que o domínio não está configurado por fora do Atlas;
 *  2. extrai o site numa pasta temporária e troca `/srv/www/<dominio>`;
 *  3. substitui/acrescenta o bloco do site no Caddyfile.base, com backup.
 * O Caddyfile é regravado no mesmo arquivo (mesmo inode), então funciona mesmo se estiver montado no container.
 */
export function buildDeployScript(args: {
  archive: string;
  /** Como o container do Caddy enxerga `webRoot` (padrão: o mesmo caminho). */
  caddyRoot?: string;
  domain: string;
  includeWww: boolean;
  releaseId: string;
  /** Onde os sites ficam no servidor (padrão `/srv/www`). */
  webRoot?: string;
}): string {
  const webRoot = assertValidRoot(args.webRoot ?? WEB_ROOT);
  const caddyRoot = assertValidRoot(args.caddyRoot ?? webRoot);
  const domain = assertValidDomain(args.domain);
  if (!/^[0-9]+$/.test(args.releaseId)) throw new Error("Release inválida");
  if (!/^\/tmp\/atlas-site-[0-9]+\.tgz$/.test(args.archive)) {
    throw new Error("Arquivo temporário inválido");
  }

  const dir = siteDir(domain, webRoot);
  const next = `${dir}.new-${args.releaseId}`;
  const prev = `${dir}.old-${args.releaseId}`;
  const lock = `${CADDYFILE_BASE}.atlas.lock`;

  return `set -euo pipefail
[ -f "${CADDYFILE_BASE}" ] || { echo "${CADDYFILE_BASE} não encontrado neste servidor" >&2; exit 1; }
mkdir -p "${webRoot}"
exec 9>"${lock}"
flock 9
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
awk -v b="${beginMarker(domain)}" -v e="${endMarker(domain)}" '$0==b{skip=1} {if(!skip)print} $0==e{skip=0}' "${CADDYFILE_BASE}" > "$TMP"
if grep -Eq '${conflictPattern(domain)}' "$TMP"; then
  echo "${domain} já está configurado no ${CADDYFILE_BASE} fora do Atlas" >&2
  exit 1
fi
rm -rf "${next}"
mkdir -p "${next}"
tar -xzf "${args.archive}" -C "${next}"
rm -f "${args.archive}"
chmod -R a+rX "${next}"
[ ! -d "${dir}" ] || mv "${dir}" "${prev}"
mv "${next}" "${dir}"
rm -rf "${prev}"
[ -z "$(tail -c1 "$TMP")" ] || echo >> "$TMP"
cat >> "$TMP" <<'ATLAS_SITE_BLOCK'
${buildSiteBlock(domain, args.includeWww, caddyRoot)}ATLAS_SITE_BLOCK
cp -p "${CADDYFILE_BASE}" "${CADDYFILE_BASE}.atlas-bak"
cat "$TMP" > "${CADDYFILE_BASE}"
`;
}

/** Pasta com a página de suspensão, uma por servidor (fora das pastas de site). */
export const SUSPENDED_DIR_NAME = "__atlas_suspenso__";

export const suspendedDir = (root: string = WEB_ROOT) =>
  `${assertValidRoot(root)}/${SUSPENDED_DIR_NAME}`;

/**
 * Página servida enquanto a hospedagem está suspensa. Fica num heredoc com
 * delimitador citado, então nada aqui é expandido pelo shell — mas, por
 * garantia, o conteúdo é fixo e não recebe dado de usuário.
 */
export const SUSPENDED_PAGE = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Site temporariamente indisponível</title>
<style>
:root{color-scheme:light dark}
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#f6f6f6;color:#131313;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px}
main{max-width:30rem;text-align:center}
h1{font-size:1.5rem;margin:0 0 .75rem}
p{margin:0;line-height:1.6;color:#555}
@media (prefers-color-scheme:dark){body{background:#131313;color:#f6f6f6}p{color:#bbb}}
</style>
</head>
<body>
<main>
<h1>Site temporariamente indisponível</h1>
<p>A hospedagem deste endereço está suspensa. Se você é o responsável pelo site, regularize a fatura em aberto no painel do Atlas para colocá-lo no ar novamente.</p>
</main>
</body>
</html>
`;

/**
 * Bloco que substitui o do site enquanto a hospedagem está suspensa: mesmos
 * hosts, mas servindo a página de suspensão. Os arquivos do site continuam em
 * `/srv/www/<dominio>` e o DNS não é tocado, então republicar volta tudo.
 */
export function buildSuspendedBlock(
  domain: string,
  includeWww: boolean,
  caddyRoot: string = WEB_ROOT
): string {
  const hosts = includeWww ? `${domain}, www.${domain}` : domain;
  return `${beginMarker(domain)}
${hosts} {
	root * ${suspendedDir(caddyRoot)}
	encode gzip

	handle {
		rewrite * /index.html
		file_server
	}
}
${endMarker(domain)}
`;
}

/**
 * Script remoto que suspende o site: cria a página de suspensão (uma vez por
 * servidor) e troca **apenas** o bloco deste domínio no Caddyfile.base. Não
 * apaga nada do site. Seguro de repetir.
 */
export function buildSuspendScript(args: {
  caddyRoot?: string;
  domain: string;
  includeWww: boolean;
  webRoot?: string;
}): string {
  const webRoot = assertValidRoot(args.webRoot ?? WEB_ROOT);
  const caddyRoot = assertValidRoot(args.caddyRoot ?? webRoot);
  const domain = assertValidDomain(args.domain);
  const dir = suspendedDir(webRoot);
  const lock = `${CADDYFILE_BASE}.atlas.lock`;

  return `set -euo pipefail
[ -f "${CADDYFILE_BASE}" ] || { echo "${CADDYFILE_BASE} não encontrado neste servidor" >&2; exit 1; }
mkdir -p "${dir}"
cat > "${dir}/index.html" <<'ATLAS_SUSPENDED_PAGE'
${SUSPENDED_PAGE}ATLAS_SUSPENDED_PAGE
chmod -R a+rX "${dir}"
exec 9>"${lock}"
flock 9
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT
awk -v b="${beginMarker(domain)}" -v e="${endMarker(domain)}" '$0==b{skip=1} {if(!skip)print} $0==e{skip=0}' "${CADDYFILE_BASE}" > "$TMP"
if grep -Eq '${conflictPattern(domain)}' "$TMP"; then
  echo "${domain} já está configurado no ${CADDYFILE_BASE} fora do Atlas" >&2
  exit 1
fi
[ -z "$(tail -c1 "$TMP")" ] || echo >> "$TMP"
cat >> "$TMP" <<'ATLAS_SITE_BLOCK'
${buildSuspendedBlock(domain, args.includeWww, caddyRoot)}ATLAS_SITE_BLOCK
cp -p "${CADDYFILE_BASE}" "${CADDYFILE_BASE}.atlas-bak"
cat "$TMP" > "${CADDYFILE_BASE}"
`;
}

/**
 * Script remoto que tira o site do ar: tira o bloco do Caddyfile.base (com backup) e apaga a pasta do site.
 * É idempotente — rodar de novo num site já removido não dá erro.
 */
export function buildRemoveScript(args: {
  domain: string;
  webRoot?: string;
}): string {
  const domain = assertValidDomain(args.domain);
  const webRoot = assertValidRoot(args.webRoot ?? WEB_ROOT);
  const dir = siteDir(domain, webRoot);
  const lock = `${CADDYFILE_BASE}.atlas.lock`;

  return `set -euo pipefail
if [ -f "${CADDYFILE_BASE}" ]; then
  exec 9>"${lock}"
  flock 9
  TMP="$(mktemp)"
  trap 'rm -f "$TMP"' EXIT
  awk -v b="${beginMarker(domain)}" -v e="${endMarker(domain)}" '$0==b{skip=1} {if(!skip)print} $0==e{skip=0}' "${CADDYFILE_BASE}" > "$TMP"
  cp -p "${CADDYFILE_BASE}" "${CADDYFILE_BASE}.atlas-bak"
  cat "$TMP" > "${CADDYFILE_BASE}"
fi
rm -rf "${dir}" "${dir}".new-* "${dir}".old-*
`;
}
