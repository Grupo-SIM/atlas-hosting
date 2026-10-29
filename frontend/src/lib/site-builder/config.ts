/**
 * Configuração do Atlas para hospedar sites do Criador de Sites (variáveis de ambiente).
 * Fica fora do arquivo de server actions para que `keyPath` e `vmIp` nunca sejam chamáveis do navegador.
 *
 * - SITE_BUILDER_BASE_DOMAIN: domínio dos subdomínios grátis (ex.: `sites.atlashosting.com.br`)
 * - SITE_BUILDER_CLOUDFLARE_ZONE: zona Cloudflare que contém esse domínio (ex.: `atlashosting.com.br`)
 * - SITE_BUILDER_ATLAS_VM_HOST: IP **ou hostname** (ex.: `vps.simintermediacoes.com`) da VM do Atlas que hospeda
 *   sites; sem isso a opção fica desligada. `SITE_BUILDER_ATLAS_VM_IP` continua valendo como nome antigo.
 * - SITE_BUILDER_SSH_KEY_PATH: chave privada do Atlas para acessar as VMs
 * - SITE_BUILDER_DEPLOY_MODE=local: o Atlas roda na própria VM dos sites; grava direto nas pastas montadas no container
 *   (WEB_ROOT e `/opt/caddy/Caddyfile.base` com o mesmo caminho do servidor), sem SSH nem chave.
 * - SITE_BUILDER_WEB_ROOT: pasta dos sites na VM (padrão `/srv/www`)
 * - SITE_BUILDER_CADDY_ROOT: a mesma pasta como o container do Caddy a enxerga (padrão = WEB_ROOT).
 *   Ex.: WEB_ROOT=/opt/caddy/sites e CADDY_ROOT=/config/caddy/sites quando o Caddy monta /opt/caddy em /config/caddy.
 */
export function getAtlasHostingConfig() {
  const baseDomain = process.env.SITE_BUILDER_BASE_DOMAIN?.trim().toLowerCase();
  const zoneDomain =
    process.env.SITE_BUILDER_CLOUDFLARE_ZONE?.trim().toLowerCase();
  const vmIp = (
    process.env.SITE_BUILDER_ATLAS_VM_HOST ??
    process.env.SITE_BUILDER_ATLAS_VM_IP
  )
    ?.trim()
    .toLowerCase();
  return {
    atlasVmEnabled: Boolean(vmIp),
    baseDomain: baseDomain || null,
    caddyRoot: process.env.SITE_BUILDER_CADDY_ROOT?.trim() || undefined,
    keyPath: process.env.SITE_BUILDER_SSH_KEY_PATH?.trim() || undefined,
    localDeploy:
      process.env.SITE_BUILDER_DEPLOY_MODE?.trim().toLowerCase() === "local",
    subdomainEnabled: Boolean(baseDomain && zoneDomain),
    vmIp: vmIp || null,
    webRoot: process.env.SITE_BUILDER_WEB_ROOT?.trim() || undefined,
    zoneDomain: zoneDomain || null,
  };
}
