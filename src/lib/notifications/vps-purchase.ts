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
  storage: string;
  image: string;
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
  "eu": "União Europeia",
  "uk": "Reino Unido",
  "us-east": "Estados Unidos (Leste)",
  "us-west": "Estados Unidos (Oeste)",
  "us-central": "Estados Unidos (Central)",
  "au-sydney": "Austrália (Sydney)",
  "sg": "Ásia (Singapura)",
  "jp": "Ásia (Japão)",
  "in": "Ásia (Índia)",
};

const storageLabels: Record<string, string> = {
  "ssd-150": "SSD 150 GB",
  "ssd-300": "SSD 300 GB",
  "nvme-75": "NVMe 75 GB",
  "nvme-150": "NVMe 150 GB",
};

const imageLabels: Record<string, string> = {
  "ubuntu": "Ubuntu",
  "windows": "Windows Server",
  "cpanel": "cPanel",
  "rhel": "RHEL Variants",
  "plesk": "Plesk + Linux",
  "plesk-win": "Plesk + Windows",
  "debian": "Debian",
  "docker": "Docker",
  "lamp": "LAMP",
  "n8n": "n8n Server",
  "wireguard": "Wireguard",
  "nextcloud": "Nextcloud",
  "gitlab": "Gitlab",
  "webmin": "Webmin",
  "custom": "Imagem Personalizada",
};

function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

/**
 * Build the WhatsApp message for the admin.
 */
function buildAdminWhatsAppMessage(data: VpsPurchaseData): string {
  const lines = [
    `🖥️ *NOVA COMPRA VPS*`,
    ``,
    `👤 *Cliente:*`,
    `Nome: ${data.userName}`,
    `Email: ${data.userEmail}`,
    data.userPhone ? `Tel: ${data.userPhone}` : null,
    data.userDocument ? `Doc: ${data.userDocument}` : null,
    data.userAddress || null,
    data.isNewAccount ? `⚡ Conta nova criada` : `✅ Conta existente`,
    ``,
    `📋 *Configuração VPS:*`,
    `Plano: ${data.planName}`,
    `Qtd: ${data.quantity}`,
    `Período: ${data.duration} ${data.duration === 1 ? "mês" : "meses"}`,
    `Região: ${locationLabels[data.location] || data.location}`,
    `Disco: ${storageLabels[data.storage] || data.storage}`,
    `SO: ${imageLabels[data.image] || data.image}`,
    `Backup: ${data.backup ? "Sim" : "Não"}`,
    `Gerenciamento: ${data.management === "managed" ? "Gerenciado" : "Não gerenciado"}`,
    data.monitoring && data.monitoring !== "none" ? `Monitoramento: Completo` : null,
    data.privateNetwork && data.privateNetwork !== "none" ? `Rede Privada: Ativada` : null,
    data.ipv4Address && data.ipv4Address !== "1ip" ? `IPv4 Adicional: Sim` : null,
    data.objectStorage && data.objectStorage !== "none" ? `Object Storage: ${data.objectStorage.toUpperCase()}` : null,
    ``,
    `💰 *Total: ${formatCurrency(data.totalAmount)}*`,
    `Fatura: ${data.invoiceRef}`,
  ];

  return lines.filter(Boolean).join("\n");
}

/**
 * Build the HTML email content for the customer.
 */
function buildCustomerEmailMessage(data: VpsPurchaseData): string {
  const configRows = [
    { label: "Plano", value: data.planName },
    { label: "Quantidade", value: String(data.quantity) },
    { label: "Período", value: `${data.duration} ${data.duration === 1 ? "mês" : "meses"}` },
    { label: "Região", value: locationLabels[data.location] || data.location },
    { label: "Armazenamento", value: storageLabels[data.storage] || data.storage },
    { label: "Sistema Operacional", value: imageLabels[data.image] || data.image },
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

Recebemos seu pedido de VPS com sucesso! 🎉

Abaixo estão os detalhes da sua compra:

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

Nossa equipe de suporte entrará em contato em breve para finalizar a configuração do seu servidor. Se precisar de ajuda imediata, responda a este e-mail ou entre em contato pelo nosso suporte.`;
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

  // 2) Email to customer — purchase confirmation
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
      "Acessar Painel",
      "Nossa equipe entrará em contato para finalizar a configuração do seu servidor. Prazo médio: até 24 horas úteis."
    );
    console.log(`[VPS-NOTIFY] ✓ Email de confirmação enviado para ${data.userEmail}`);
  } catch (err) {
    console.error("[VPS-NOTIFY] Erro ao enviar email para cliente:", err);
  }

  // 3) If new account, send welcome email with password
  if (data.isNewAccount && data.guestPassword) {
    try {
      await sendNotificationEmail(
        data.userEmail,
        data.userName.split(" ")[0],
        "Atlas Hosting",
        "Sua conta foi criada!",
        `Olá! Sua compra foi confirmada e uma conta foi criada para você na Atlas Hosting.\n\nUse os dados abaixo para acessar seu painel:\n\n📧 Email: ${data.userEmail}\n🔑 Senha: ${data.guestPassword}\n\nRecomendamos alterar sua senha após o primeiro login.`,
        "success",
        `${baseUrl}/login`,
        "Acessar Painel",
        "Guarde esta senha em local seguro. Você pode alterá-la nas configurações do painel."
      );
      console.log(`[VPS-NOTIFY] ✓ Email de boas-vindas com senha enviado para ${data.userEmail}`);
    } catch (err) {
      console.error("[VPS-NOTIFY] Erro ao enviar email de boas-vindas:", err);
    }
  }
}
