import { sendNotificationEmail } from "@/lib/email/service";
import { notifyAdminWhatsApp } from "@/lib/notifications/whatsapp";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";

interface VpsPurchaseData {
  // User data
  userName: string;
  userEmail: string;
  userPhone?: string;
  userDocument?: string;
  userAddress?: string;
  isNewAccount: boolean;
  guestPassword?: string;

  // VPS configuration
  planId: string;
  planName: string;
  quantity: number;
  duration: number;
  location: string;
  locationLabel?: string;
  storage: string;
  storageLabel?: string;
  image: string;
  imageLabel?: string;
  customImageOption?: string;
  backup: boolean;
  management: string;
  monitoring?: string;
  privateNetwork?: string;
  ipv4Address?: string;
  objectStorage?: string;

  // Invoice
  invoiceId: string;
  invoiceRef: string;
  totalAmount: number;
}

// Readable labels for VPS configuration values
const locationLabels: Record<string, string> = {
  eu: "União Europeia",
  uk: "Reino Unido",
  "us-east": "Estados Unidos (Leste)",
  "us-central": "Estados Unidos (Central)",
  "us-west": "Estados Unidos (Oeste)",
  "au-sydney": "Austrália (Sydney)",
  sg: "Ásia (Singapura)",
  jp: "Ásia (Japão)",
  in: "Ásia (Índia)",
};

const locationPrices: Record<string, number> = {
  eu: 0,
  uk: 11.13,
  "us-east": 16.41,
  "us-west": 13.48,
  "us-central": 11.13,
  "au-sydney": 22.85,
  sg: 26.96,
  jp: 27.54,
  in: 25.20,
};

const pleskLicenceNames: Record<string, string> = {
  admin: "Plesk Obsidian Web Admin Edition",
  host: "Plesk Obsidian Web Host Edition",
  pro: "Plesk Obsidian Web Pro Edition",
};

const storageLabels: Record<string, string> = {
  "ssd-150": "SSD de 150 GB",
  "ssd-300": "SSD de 300 GB",
  "nvme-75": "75 GB NVMe",
  "nvme-150": "NVMe de 150 GB",
};

const imageLabels: Record<string, string> = {
  ubuntu: "Ubuntu",
  custom: "Imagens personalizadas",
  windows: "Servidor Windows",
  cpanel: "cPanel",
  rhel: "RHEL Variants",
  plesk: "Plesk + Linux",
  "plesk-linux": "Plesk + Linux",
  "plesk-win": "Plesk + Windows",
  debian: "Debian",
  almalinux: "AlmaLinux",
  rockylinux: "Rocky Linux",
  n8n: "n8n Server",
  wireguard: "Wireguard Server",
  nextcloud: "Nextcloud Server",
  gitlab: "Gitlab Server",
  docker: "Docker",
  lamp: "LAMP",
  openclaw: "OpenClaw Server",
  webmin: "Webmin",
  "webmin-lamp": "Webmin + LAMP",
  ipfs: "IPFS Node",
  flux: "Flux Node",
  horizen: "Horizen Node",
};

const objectStorageLabels: Record<string, string> = {
  "250gb": "250 GB (EUA)",
  "500gb": "500 GB (EUA)",
  "750gb": "750 GB (EUA)",
  "1tb": "1 TB (EUA)",
};

const objectStoragePrices: Record<string, number> = {
  "250gb": 29.18,
  "500gb": 58.37,
  "750gb": 87.55,
  "1tb": 116.73,
};

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

/**
 * Build a detailed, itemized WhatsApp message for admins.
 * Matches landing page labels and shows prices for each selection.
 */
function buildAdminWhatsAppMessage(data: VpsPurchaseData): string {
  const RATE = 11.72; // EUR to BRL
  const durationMonths = data.duration;
  const qty = data.quantity || 1;

  // 1. Determine Plan Base Price
  const basePriceBrl = 4.50 * RATE; // R$ 52,74
  let planPrice = basePriceBrl;
  if (data.duration === 6) planPrice = 4.05 * RATE; // R$ 47,47
  if (data.duration === 12) planPrice = 3.60 * RATE; // R$ 42,19

  // 2. Setup Fee
  let setupFee = 0;
  if (data.duration === 1) setupFee = 4.50 * RATE;
  if (data.duration === 6) setupFee = 26.28;
  if (data.duration === 12) setupFee = 0;

  // 3. Location Price
  const locationPrice = locationPrices[data.location] ?? 0;

  // 4. Storage Price
  const storagePrice = data.storage === "ssd-300" ? 18.17 :
                      data.storage === "nvme-150" ? 21.68 : 0;

  // 5. Image Price
  const imagePrices: Record<string, number> = {
    "windows": 87.90,
    "cpanel": 254.91,
    "plesk-admin": 140.64,
    "plesk-host": 427.78,
    "plesk-pro": 222.68,
    "plesk-win-admin": 213.90,
    "plesk-win-host": 501.03,
    "plesk-win-pro": 295.93,
    "directadmin": 58.60,
  };
  const customStoragePrice = data.image === "custom" && data.customImageOption === "add" ? 13.95 : 0;
  const imagePriceBrl = (imagePrices[data.image] || 0) + customStoragePrice;

  // 6. Add-ons
  const backupPrice = data.backup ? 17.58 : 0;
  const managementPrice = data.management === "managed" ? 1289.08 : 0;
  const monitoringPrice = data.monitoring === "full" ? 134.66 : 0;
  const networkPrice = data.privateNetwork === "enabled" ? 26.84 : 0;
  const additionalIpPrice = data.ipv4Address === "2ip" ? 41.02 : 0;
  const objectStoragePrice = objectStoragePrices[data.objectStorage || ""] || 0;

  const subtotalPerUnit = planPrice + locationPrice + storagePrice + imagePriceBrl + backupPrice + managementPrice + monitoringPrice + networkPrice + additionalIpPrice + objectStoragePrice;
  const totalItems = subtotalPerUnit * durationMonths * qty;

  const lines: string[] = [
    `🚀 *NOVO PEDIDO: ATLAS HOSTING*`,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `👤 *INFORMAÇÕES DO CLIENTE*`,
    ``,
    `*Nome:* ${data.userName}`,
    `*E-mail:* ${data.userEmail}`,
    `*Telefone:* ${data.userPhone || "N/A"}`,
    `*Documento:* ${data.userDocument || "N/A"}`,
    `*Tipo:* ${data.isNewAccount ? `🆕 Conta Nova (Senha: ${data.guestPassword || "N/A"})` : "✅ Cliente Existente"}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `🖥️ *CONFIGURAÇÃO DA VM*`,
    ``,
    `*Plano:* ${data.planName} — R$ ${planPrice.toFixed(2).replace(".", ",")}/mês`,
    `*Quantidade:* ${qty} unidade${qty > 1 ? "s" : ""}`,
    `*Ciclo:* ${data.duration === 1 ? "1 mês" : `${data.duration} meses`}`,
    `*Localização:* ${data.locationLabel || data.location}${locationPrice > 0 ? ` — R$ ${locationPrice.toFixed(2).replace(".", ",")}/mês` : " — Grátis"}`,
    `*Armazenamento:* ${data.storageLabel || data.storage}${storagePrice > 0 ? ` — R$ ${storagePrice.toFixed(2).replace(".", ",")}/mês` : " — Grátis"}`,
    `*Imagem/SO:* ${data.imageLabel || data.image}${imagePriceBrl > 0 ? ` — R$ ${imagePriceBrl.toFixed(2).replace(".", ",")}/mês` : " — Grátis"}`,
    ``,
    `🛠️ *RECURSOS ADICIONAIS*`,
    ``,
    `*Backup Automático:* ${data.backup ? `✅ Ativado — R$ ${backupPrice.toFixed(2).replace(".", ",")}/mês` : "❌ Não"}`,
    `*Gerenciamento:* ${data.management === "managed" ? `🛡️ Gerenciado — R$ ${managementPrice.toFixed(2).replace(".", ",")}/mês` : "⚙️ Self-Managed — Grátis"}`,
    `*Monitoramento:* ${data.monitoring === "full" ? `📊 Completo — R$ ${monitoringPrice.toFixed(2).replace(".", ",")}/mês` : "❌ Não"}`,
    `*Rede Privada:* ${data.privateNetwork === "enabled" ? `🌐 Ativada — R$ ${networkPrice.toFixed(2).replace(".", ",")}/mês` : "❌ Não"}`,
    `*IPv4:* ${data.ipv4Address === "2ip" ? `2 IPs (1 adicional) — R$ ${additionalIpPrice.toFixed(2).replace(".", ",")}/mês` : "1 IP — Grátis"}`,
  ];

  if (data.objectStorage && data.objectStorage !== "none") {
    lines.push(`*Object Storage:* ${objectStorageLabels[data.objectStorage] || data.objectStorage} — R$ ${objectStoragePrice.toFixed(2).replace(".", ",")}/mês`);
  }

  lines.push(
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `💳 *RESUMO FINANCEIRO*`,
    ``,
    `*Subtotal (${durationMonths} ${durationMonths === 1 ? "mês" : "meses"} × ${qty}):* R$ ${totalItems.toFixed(2).replace(".", ",")}`,
    `*Taxa de Setup:* R$ ${(setupFee * qty).toFixed(2).replace(".", ",")}`,
    ``,
    `💰 *VALOR TOTAL COBRADO:*`,
    `*R$ ${data.totalAmount.toFixed(2).replace(".", ",")}*`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `*Fatura:* #${data.invoiceId.split("-")[0]}`,
    `*Referência:* ${data.invoiceRef}`,
    `🕒 _Gerado automaticamente — Atlas Hosting_`,
  );

  return lines.join("\n");
}

/**
 * Build the HTML email content for the customer.
 */
function buildCustomerEmailMessage(data: VpsPurchaseData): string {
  const configRows = [
    { label: "Plano", value: data.planName },
    { label: "Quantidade", value: String(data.quantity) },
    { label: "Período", value: `${data.duration} ${data.duration === 1 ? "mês" : "meses"}` },
    { label: "Região", value: data.locationLabel || data.location },
    { label: "Armazenamento", value: data.storageLabel || data.storage },
    { label: "Sistema Operacional", value: data.imageLabel || data.image },
    { label: "Backup Automático", value: data.backup ? "Sim" : "Não" },
    { label: "Gerenciamento", value: data.management === "managed" ? "Gerenciado" : "Não gerenciado" },
  ];

  if (data.monitoring && data.monitoring !== "none") {
    configRows.push({ label: "Monitoramento", value: "Completo" });
  }
  if (data.privateNetwork && data.privateNetwork !== "none") {
    configRows.push({ label: "Rede Privada", value: "Ativada" });
  }

  const tableRows = configRows
    .map(r => `<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#64748b;font-weight:600">${r.label}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;color:#1e293b">${r.value}</td></tr>`)
    .join("\n");

  return `Olá, ${data.userName.split(" ")[0]}!
<br><br>
Recebemos seu pedido de VPS com sucesso! 🎉
<br><br>
Abaixo estão os detalhes da sua compra:
<br>
<table style="width:100%;border-collapse:collapse;margin:16px 0;border:1px solid #e2e8f0;border-radius:8px">
  <thead>
    <tr style="background:#f8fafc">
      <th style="padding:10px 12px;text-align:left;color:#475569;font-size:13px">Item</th>
      <th style="padding:10px 12px;text-align:left;color:#475569;font-size:13px">Detalhes</th>
    </tr>
  </thead>
  <tbody>
    ${tableRows}
    <tr style="background:#f0f9ff">
      <td style="padding:10px 12px;font-weight:700;color:#0369a1">Total</td>
      <td style="padding:10px 12px;font-weight:700;color:#0369a1;font-size:16px">${formatCurrency(data.totalAmount)}</td>
    </tr>
  </tbody>
</table>

Referência da fatura: <strong>${data.invoiceRef}</strong>
<br><br>
Nossa equipe de suporte entrará em contato em breve para finalizar a configuração do seu servidor. Se precisar de ajuda imediata, responda a este e-mail ou entre em contato pelo nosso suporte.`;
}

/**
 * Trigger purchase notifications for VPS and other products.
 */
export async function triggerPurchaseNotifications(
  invoice: any,
  user: any,
  billing?: any
): Promise<void> {
  const meta = invoice.metadata as any;
  const config = meta?.config || {};

  if (invoice.type === "vps") {
    try {
      await sendVpsPurchaseNotifications({
        userName: user.name || "Cliente",
        userEmail: user.email,
        userPhone: billing?.phoneNumber || user.billingPhone,
        userDocument: billing?.document || user.billingDocument,
        userAddress: billing?.address 
          ? `${billing.address.street}, ${billing.address.city} - ${billing.address.state}` 
          : user.billingStreet ? `${user.billingStreet}, ${user.billingCity} - ${user.billingState}` : undefined,
        isNewAccount: !!meta?.guestPassword,
        guestPassword: meta?.guestPassword,
        planId: meta?.vpsId || "10",
        planName: `Cloud VPS ${meta?.vpsId || "10"}`,
        quantity: parseInt(config.qty || "1", 10),
        duration: parseInt(config.duration || "1", 10),
        location: config.location || "eu",
        locationLabel: locationLabels[config.location] || config.location,
        storage: config.storage || "ssd-150",
        storageLabel: storageLabels[config.storage] || config.storage,
        image: (() => {
          const img = config.image || "ubuntu";
          if (img === "plesk" || img === "plesk-linux") return `plesk-${config.pleskLicence || "admin"}`;
          if (img === "plesk-win") return `plesk-win-${config.pleskWinLicence || "admin"}`;
          return img;
        })(),
        imageLabel: (() => {
          const img = config.image || "ubuntu";
          if (img === "plesk" || img === "plesk-linux") {
            const licence = pleskLicenceNames[config.pleskLicence || "admin"] || config.pleskLicence || "admin";
            return `Plesk + Linux — ${licence}`;
          }
          if (img === "plesk-win") {
            const licence = pleskLicenceNames[config.pleskWinLicence || "admin"] || config.pleskWinLicence || "admin";
            const winVer = config.pleskWinVersion ? ` (Windows Server ${config.pleskWinVersion} Datacenter)` : "";
            return `Plesk + Windows — ${licence}${winVer}`;
          }
          const base = imageLabels[img] || img;
          if (img === "windows" && config.windowsVersion) {
            return `${base} (Windows Server ${config.windowsVersion} Datacenter)`;
          }
          if (img === "cpanel") {
            const parts: string[] = [];
            if (config.cpanelLicence) parts.push(`${config.cpanelLicence} contas`);
            if (config.cpanelVersion) parts.push(config.cpanelVersion);
            return parts.length > 0 ? `${base} — ${parts.join(", ")}` : base;
          }
          if (img === "custom" && config.customImageOption === "add") {
            return `${base} + Armazenamento adicional 25 GB — R$ 13,95/mês`;
          }
          const version = config.ubuntuVersion || config.rhelVersion || config.debianVersion || config.webminVersion || config.lampVersion || config.dockerVersion;
          return version ? `${base} (${version})` : base;
        })(),
        customImageOption: config.customImageOption,
        backup: config.backup === "true" || config.backup === true,
        management: config.management || "unmanaged",
        monitoring: config.monitoring,
        privateNetwork: config.privateNetwork,
        ipv4Address: config.ipv4Address,
        objectStorage: config.objectStorage,
        invoiceId: invoice.id,
        invoiceRef: invoice.reference,
        totalAmount: invoice.amount,
      });
    } catch (err) {
      console.error("[PURCHASE-NOTIFY] Erro ao enviar notificações VPS:", err);
    }
  } else if (invoice.type === "subscription") {
    try {
      const msg = [
        `🛒 *NOVA ASSINATURA*`,
        ``,
        `👤 *Cliente:* ${user.name} (${user.email})`,
        `📦 *Produto:* ${invoice.description || "Plano de Hospedagem"}`,
        `💰 *Valor:* R$ ${invoice.amount.toFixed(2)}`,
        `Fatura: ${invoice.reference}`,
      ].join("\n");
      
      await notifyAdminWhatsApp(msg);
    } catch (err) {
      console.error("[PURCHASE-NOTIFY] Erro ao enviar notificação de assinatura:", err);
    }
  }
}

/**
 * Send all notifications after a VPS purchase.
 */
export async function sendVpsPurchaseNotifications(data: VpsPurchaseData): Promise<void> {
  const baseUrl = getServerPublicBaseUrl();

  // 1) WhatsApp to admin via Evolution API
  try {
    const whatsappMsg = buildAdminWhatsAppMessage(data);
    await notifyAdminWhatsApp(whatsappMsg);
  } catch (err) {
    console.error("[VPS-NOTIFY] Erro ao enviar WhatsApp para admin:", err);
  }

  // 2) Email to customer
  try {
    const emailMessage = buildCustomerEmailMessage(data);
    await sendNotificationEmail(
      data.userEmail,
      data.userName.split(" ")[0],
      "Atlas Hosting",
      "Pedido de VPS recebido com sucesso!",
      emailMessage,
      "success",
      `${baseUrl}/login`,
      "Acessar Painel"
    );
  } catch (err) {
    console.error("[VPS-NOTIFY] Erro ao enviar email para cliente:", err);
  }

  // 3) Welcome email for new accounts
  if (data.isNewAccount && data.guestPassword) {
    try {
      await sendNotificationEmail(
        data.userEmail,
        data.userName.split(" ")[0],
        "Atlas Hosting",
        "Sua conta foi criada!",
        `Olá! Sua compra foi confirmada e uma conta foi criada para você na Atlas Hosting. Use os dados abaixo para acessar seu painel:
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding-bottom: 12px;">
                <div style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">E-mail de Acesso</div>
                <div style="color: #1e293b; font-size: 16px; font-weight: 500;">${data.userEmail}</div>
              </td>
            </tr>
            <tr>
              <td>
                <div style="color: #64748b; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;">Senha Temporária</div>
                <div style="color: #2563eb; font-size: 18px; font-weight: 700; font-family: monospace;">${data.guestPassword}</div>
              </td>
            </tr>
          </table>
        </div>
        
        Recomendamos alterar sua senha após o primeiro login nas configurações do seu perfil.`,
        "success",
        `${baseUrl}/login`,
        "Acessar Painel"
      );
    } catch (err) {
      console.error("[VPS-NOTIFY] Erro ao enviar email de boas-vindas:", err);
    }
  }
}
