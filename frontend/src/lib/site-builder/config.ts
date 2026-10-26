/**
 * Configuração do Atlas para hospedar sites do Criador de Sites (variáveis de ambiente).
 * Fica fora do arquivo de server actions para que `keyPath` e `vmIp` nunca sejam chamáveis do navegador.
 *
 * - SITE_BUILDER_BASE_DOMAIN: domínio dos subdomínios grátis (ex.: `sites.atlashosting.com.br`)
 * - SITE_BUILDER_CLOUDFLARE_ZONE: zona Cloudflare que contém esse domínio (ex.: `atlashosting.com.br`)
 * - SITE_BUILDER_ATLAS_VM_IP: IP da VM do Atlas que hospeda sites (sem isso a opção fica desligada)
 * - SITE_BUILDER_SSH_KEY_PATH: chave privada do Atlas para acessar as VMs
 */
export function getAtlasHostingConfig() {
  const baseDomain = process.env.SITE_BUILDER_BASE_DOMAIN?.trim().toLowerCase();
  const zoneDomain =
    process.env.SITE_BUILDER_CLOUDFLARE_ZONE?.trim().toLowerCase();
  const vmIp = process.env.SITE_BUILDER_ATLAS_VM_IP?.trim();
  return {
    atlasVmEnabled: Boolean(vmIp),
    baseDomain: baseDomain || null,
    keyPath: process.env.SITE_BUILDER_SSH_KEY_PATH?.trim() || undefined,
    subdomainEnabled: Boolean(baseDomain && zoneDomain),
    vmIp: vmIp || null,
    zoneDomain: zoneDomain || null,
  };
}
