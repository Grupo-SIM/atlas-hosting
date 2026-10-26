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

/** Caddyfile base lido pelo caddy-docker-proxy; os blocos dos sites são acrescentados a ele. */
export const CADDYFILE_BASE = "/opt/caddy/Caddyfile.base";

export const siteDir = (domain: string) => `${WEB_ROOT}/${domain}`;

const beginMarker = (domain: string) => `# BEGIN atlas-site ${domain}`;
const endMarker = (domain: string) => `# END atlas-site ${domain}`;

/**
 * Bloco acrescentado ao Caddyfile.base. Os marcadores permitem que o redeploy substitua o bloco
 * do próprio site sem duplicar nem tocar no resto do arquivo. `www.` só entra no domínio próprio.
 */
export function buildSiteBlock(domain: string, includeWww: boolean): string {
  const hosts = includeWww ? `${domain}, www.${domain}` : domain;
  return `${beginMarker(domain)}
${hosts} {
	root * ${siteDir(domain)}
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
  domain: string;
  includeWww: boolean;
  releaseId: string;
}): string {
  const domain = assertValidDomain(args.domain);
  if (!/^[0-9]+$/.test(args.releaseId)) throw new Error("Release inválida");
  if (!/^\/tmp\/atlas-site-[0-9]+\.tgz$/.test(args.archive)) {
    throw new Error("Arquivo temporário inválido");
  }

  const dir = siteDir(domain);
  const next = `${dir}.new-${args.releaseId}`;
  const prev = `${dir}.old-${args.releaseId}`;
  const lock = `${CADDYFILE_BASE}.atlas.lock`;

  return `set -euo pipefail
[ -f "${CADDYFILE_BASE}" ] || { echo "${CADDYFILE_BASE} não encontrado neste servidor" >&2; exit 1; }
mkdir -p "${WEB_ROOT}"
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
${buildSiteBlock(domain, args.includeWww)}ATLAS_SITE_BLOCK
cp -p "${CADDYFILE_BASE}" "${CADDYFILE_BASE}.atlas-bak"
cat "$TMP" > "${CADDYFILE_BASE}"
`;
}
