/**
 * Converte a query que as telas de configuração de VPS montam (a mesma que vai
 * para `/checkout/personal-data`) no `config` aceito por `createVpsInvoice`.
 * Usado pelo checkout direto e pelo carrinho, para os dois lerem igual.
 */
export function vpsConfigFromSearchParams(params: {
  get(name: string): string | null;
}) {
  let storageUpgrades: Record<string, number> | undefined;
  const rawUpgrades = params.get("storageUpgrades");
  if (rawUpgrades) {
    try {
      storageUpgrades = JSON.parse(rawUpgrades);
    } catch {
      storageUpgrades = undefined;
    }
  }

  return {
    backup: params.get("backup") || "false",
    cpanelLicence: params.get("cpanelLicence"),
    cpanelVersion: params.get("cpanelVersion"),
    customImageOption: params.get("customImageOption"),
    customLinkAllowBoleto: params.get("customLinkAllowBoleto") || undefined,
    customLinkAllowPix: params.get("customLinkAllowPix") || undefined,
    // Admin-generated payment link (arbitrary period + admin-typed price) — see /pay/[linkId]
    customLinkAmountBrl: params.get("customLinkAmountBrl") || undefined,
    debianVersion: params.get("debianVersion"),
    dockerVersion: params.get("dockerVersion"),
    duration: params.get("duration") || "1",
    image: params.get("image") || "ubuntu",
    ipv4Address: params.get("ipv4Address"),
    lampVersion: params.get("lampVersion"),
    location: params.get("location") || "eu",
    management: params.get("management") || "unmanaged",
    monitoring: params.get("monitoring"),
    objectStorage: params.get("objectStorage"),
    password: params.get("password"),
    paymentLinkId: params.get("paymentLinkId") || undefined,
    pleskLicence: params.get("pleskLicence"),
    pleskWinLicence: params.get("pleskWinLicence"),
    pleskWinVersion: params.get("pleskWinVersion"),
    privateNetwork: params.get("privateNetwork"),
    qty: params.get("qty") || "1",
    rhelVersion: params.get("rhelVersion"),
    storage: params.get("storage") || "ssd-150",
    storageUpgrades,
    type: params.get("type") || "vps",
    ubuntuVersion: params.get("ubuntuVersion"),
    webminVersion: params.get("webminVersion"),
    windowsVersion: params.get("windowsVersion"),
  };
}

/** Resumo curto para o carrinho: duração e quantidade. */
export function vpsCartSummary(params: {
  get(name: string): string | null;
}): string {
  const months = Number.parseInt(params.get("duration") || "1", 10) || 1;
  const qty = Number.parseInt(params.get("qty") || "1", 10) || 1;
  const period = `${months} ${months === 1 ? "mês" : "meses"}`;
  return qty > 1 ? `${period} · ${qty} unidades` : period;
}
