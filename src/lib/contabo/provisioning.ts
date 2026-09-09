import type { Contabo } from "./types";

type AtlasPlanType = "storage-vps" | "vds" | "vps" | "vps-windows";

export interface AtlasVpsConfiguration {
  backup?: boolean | string;
  cpanelLicence?: string;
  duration?: string;
  image?: string;
  ipv4Address?: string;
  location?: string;
  management?: string;
  monitoring?: string;
  objectStorage?: string;
  pleskLicence?: string;
  privateNetwork?: string;
  storage?: string;
  storageUpgrades?: Record<string, number>;
}

export interface BuildContaboInstanceRequestInput {
  config: AtlasVpsConfiguration;
  displayName: string;
  /** ID obtido de GET /v1/compute/images. Nunca aceite este valor do navegador. */
  imageId: string;
  planId: string;
  planType: AtlasPlanType;
  /** ID de segredo retornado por POST /v1/secrets para a senha do servidor. */
  rootPasswordSecretId?: number;
}

const CLOUD_PRODUCTS: Record<string, { nvme: string; ssd: string }> = {
  "4": { nvme: "V159", ssd: "V153" },
  "6": { nvme: "V160", ssd: "V154" },
  "8": { nvme: "V161", ssd: "V155" },
  "12": { nvme: "V162", ssd: "V156" },
  "16": { nvme: "V163", ssd: "V157" },
  "18": { nvme: "V164", ssd: "V158" },
};

const VDS_PRODUCTS: Record<string, string> = {
  l: "V10",
  m: "V9",
  s: "V8",
  xl: "V11",
  xxl: "V16",
};

const STORAGE_VPS_PRODUCTS: Record<string, string> = {
  "10": "V93",
  "20": "V96",
  "30": "V99",
  "40": "V102",
  "50": "V105",
};

const REGIONS: Record<string, Contabo.Body.CreateInstance["region"]> = {
  "au-sydney": "AUS",
  eu: "EU",
  in: "IND",
  jp: "JPN",
  sg: "SIN",
  uk: "UK",
  "us-central": "US-central",
  "us-east": "US-east",
  "us-west": "US-west",
};

const CPANEL_LICENSES = new Set([
  "5",
  "30",
  "50",
  "100",
  "150",
  "200",
  "250",
  "300",
  "350",
  "400",
  "450",
  "500",
  "550",
  "600",
  "650",
  "700",
  "750",
  "800",
  "850",
  "900",
  "950",
  "1000",
]);

function asEnabled(value: boolean | string | undefined): boolean {
  return value === true || value === "true" || value === "enabled";
}

function resolveProductId(
  planType: AtlasPlanType,
  planId: string,
  storage: string | undefined
): string {
  if (planType === "storage-vps") {
    const productId = STORAGE_VPS_PRODUCTS[planId];
    if (!productId) {
      throw new Error(`Plano Storage VPS Contabo inválido: ${planId}.`);
    }
    return productId;
  }

  if (planType === "vds") {
    if (storage && storage !== "default") {
      throw new Error(
        "Expansões de disco VDS não possuem mapeamento confirmado na API da Contabo."
      );
    }
    const productId = VDS_PRODUCTS[planId];
    if (!productId) throw new Error(`Plano VDS Contabo inválido: ${planId}.`);
    return productId;
  }

  const product = CLOUD_PRODUCTS[planId];
  if (!product) {
    throw new Error(
      `Plano Cloud VPS sem produto Contabo mapeado: ${planId}. Planos legados não podem ser provisionados automaticamente.`
    );
  }

  if (!storage || storage === "default" || storage === `${planId}-ssd`) {
    return product.ssd;
  }
  if (storage === `${planId}-storage-upgrade` || storage === `${planId}-nvme`) {
    return product.nvme;
  }
  throw new Error(`Opção de armazenamento Contabo inválida: ${storage}.`);
}

function resolveLicense(
  config: AtlasVpsConfiguration
): Contabo.Body.CreateInstance["license"] | undefined {
  if (config.image === "cpanel") {
    const license = config.cpanelLicence || "5";
    if (!CPANEL_LICENSES.has(license)) {
      throw new Error(`Licença cPanel inválida para Contabo: ${license}.`);
    }
    return `cPanel${license}` as Contabo.Body.CreateInstance["license"];
  }

  if (config.image === "plesk" || config.image === "plesk-linux") {
    const licenses = {
      admin: "PleskAdmin",
      host: "PleskHost",
      pro: "PleskPro",
    } as const;
    const license = licenses[config.pleskLicence as keyof typeof licenses];
    if (!license) {
      throw new Error(
        `Licença Plesk inválida para Contabo: ${config.pleskLicence ?? "ausente"}.`
      );
    }
    return license;
  }
}

function assertSupportedOptions(config: AtlasVpsConfiguration): void {
  if (config.objectStorage && config.objectStorage !== "none") {
    throw new Error(
      "Object Storage é recurso separado na API da Contabo; não pode ser criado no payload da VPS."
    );
  }
  if (config.management === "managed" || config.monitoring === "full") {
    throw new Error(
      "Gerenciamento e monitoramento não possuem complemento equivalente na API da Contabo."
    );
  }
  if (
    config.storageUpgrades &&
    Object.values(config.storageUpgrades).some(quantity => quantity > 0)
  ) {
    throw new Error(
      "Expansões de disco por quantidade não possuem mapeamento confirmado na API da Contabo."
    );
  }
  if (config.ipv4Address && !["1ip", "2ip"].includes(config.ipv4Address)) {
    throw new Error(
      `Quantidade de IPv4 sem suporte na API da Contabo: ${config.ipv4Address}.`
    );
  }
}

/**
 * Traduz configuração cobrada pela Atlas para o contrato de criação da Contabo.
 * Falha fechada: nunca descarta uma opção sem suporte nem escolhe produto/região
 * por aproximação, evitando contratar recurso diferente do que foi vendido.
 */
export function buildContaboInstanceRequest({
  config,
  displayName,
  imageId,
  planId,
  planType,
  rootPasswordSecretId,
}: BuildContaboInstanceRequestInput): Contabo.Body.CreateInstance {
  if (!imageId) throw new Error("Imagem Contabo é obrigatória para provisionar.");
  if (!displayName.trim()) throw new Error("Nome da VPS é obrigatório.");
  assertSupportedOptions(config);

  const region = REGIONS[config.location || "eu"];
  if (!region) {
    throw new Error(`Região Contabo inválida: ${config.location ?? "ausente"}.`);
  }

  const period = Number(config.duration || "1");
  if (period !== 1 && period !== 12 && period !== 24) {
    throw new Error(`Período Contabo inválido: ${config.duration ?? "ausente"}.`);
  }

  const addOns: NonNullable<Contabo.Body.CreateInstance["addOns"]> = {};
  if (asEnabled(config.backup)) addOns.backup = {};
  if (config.privateNetwork === "enabled") addOns.privateNetworking = {};
  if (config.ipv4Address === "2ip") addOns.additionalIps = {};

  const license = resolveLicense(config);

  return {
    ...(Object.keys(addOns).length > 0 ? { addOns } : {}),
    defaultUser: planType === "vps-windows" ? "administrator" : "root",
    displayName: displayName.trim().slice(0, 255),
    imageId,
    ...(license ? { license } : {}),
    period,
    productId: resolveProductId(planType, planId, config.storage),
    region,
    ...(rootPasswordSecretId ? { rootPassword: rootPasswordSecretId } : {}),
  };
}
