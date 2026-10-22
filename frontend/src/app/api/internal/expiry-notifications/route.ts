import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { pgOrganizationDomains, pgVpsSubscription } from "@/lib/db/schema";
import { notifySubscriptionExpiring } from "@/lib/server/subscriptions/renewal-reminder";
import { daysUntilRenewal, RENEWAL_REMINDER_DAYS } from "@/lib/server/subscriptions/renewal-policy";
import { sendNotificationEmail } from "@/lib/email/service";
import { namecheapApi } from "@/lib/server/apis/namecheap";
import { getServerPublicBaseUrl } from "@/lib/server/public-base-url";

const ADMIN_NOTIFY_EMAIL = "jbmidiadigital@gmail.com";

/** Dias-antes-do-vencimento em que disparamos aviso. Cron roda 1x/dia — cada
 * assinatura/domínio recebe um email por checkpoint cruzado, não um por dia. */
const EXPIRY_CHECKPOINTS_DAYS = [7, 3, 1];

function ensureAuthorized(req: Request): boolean {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "").trim();
  return !!token && [process.env.CRON_SECRET, process.env.API_MACHINE_INTERNAL_TOKEN, process.env.INTERNAL_SERVICE_TOKEN].filter(Boolean).includes(token);
}

function daysUntil(date: Date): number {
  return Math.ceil((date.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

async function notifyDomainExpiring(
  domain: string,
  owner: { name: string | null; email: string },
  expireDate: Date,
  daysLeft: number,
  baseUrl: string
): Promise<void> {
  const dateLabel = expireDate.toLocaleDateString("pt-BR");
  const dayWord = daysLeft === 1 ? "dia" : "dias";
  const severity = daysLeft <= 3 ? "danger" : "warning";
  const title = `Seu domínio ${domain} vence em ${daysLeft} ${dayWord}`;
  const message = `O domínio <strong>${domain}</strong> vence em <strong>${dateLabel}</strong> (${daysLeft} ${dayWord}). Renove pelo painel pra não correr o risco de perder o domínio.`;

  await sendNotificationEmail(
    owner.email,
    (owner.name || "Cliente").split(" ")[0],
    "Atlas Hosting",
    title,
    message,
    severity,
    `${baseUrl}/domains`,
    "Gerenciar Domínios"
  );

  await sendNotificationEmail(
    ADMIN_NOTIFY_EMAIL,
    "Admin",
    "Atlas Hosting",
    title,
    `${message}<br><br>Cliente: ${owner.name || "N/A"} (${owner.email})`,
    severity,
    `${baseUrl}/domains`,
    "Ver Domínios"
  );
}

export async function GET(req: Request) {
  return POST(req);
}

export async function POST(req: Request) {
  if (!ensureAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = getServerPublicBaseUrl();
  let subscriptionsNotified = 0;
  let domainsNotified = 0;
  // 1) Assinaturas VPS/VDS/Storage/Windows ativas prestes a vencer/cobrar
  const activeSubs = await db.query.pgVpsSubscription.findMany({
    where: eq(pgVpsSubscription.status, "active"),
    with: { user: true },
  });

  for (const sub of activeSubs) {
    const daysLeft = daysUntilRenewal(sub.nextChargeDate);
    if (!RENEWAL_REMINDER_DAYS.some(day => day === daysLeft)) continue;
    if ((sub.config as any)?.renewalReminderSent?.[`${sub.nextChargeDate.toISOString()}:${daysLeft}`]) continue;
    try {
      if (await notifySubscriptionExpiring(sub as any, daysLeft, baseUrl)) subscriptionsNotified++;
    } catch (err) {
      console.error(
        `[EXPIRY-CRON] Falha ao notificar assinatura ${sub.id}:`,
        err
      );
    }
  }

  if (new URL(req.url).searchParams.get("subscriptionsOnly") === "true") {
    return NextResponse.json({ subscriptionsNotified, checkpoints: RENEWAL_REMINDER_DAYS });
  }

  // 2) Domínios ativos registrados via Namecheap/Atlas. Domínios só "apontados"
  // (registrados em outro registrador, ex. Hostinger) não retornam ExpireDate
  // consultável aqui — a chamada falha e o domínio é ignorado silenciosamente,
  // já que não temos como saber o vencimento real de um registrador terceiro.
  const activeDomains = await db.query.pgOrganizationDomains.findMany({
    where: eq(pgOrganizationDomains.active, true),
    with: { organization: { with: { owner: true } } },
  });

  for (const domainRow of activeDomains) {
    const owner = (domainRow.organization as any)?.owner;
    if (!owner?.email) continue;

    try {
      const info = await namecheapApi.getInfo({ DomainName: domainRow.domain });
      if (!info?.ExpireDate) continue;

      const expireDate = new Date(info.ExpireDate);
      const daysLeft = daysUntil(expireDate);
      if (!EXPIRY_CHECKPOINTS_DAYS.includes(daysLeft)) continue;

      await notifyDomainExpiring(
        domainRow.domain,
        owner,
        expireDate,
        daysLeft,
        baseUrl
      );
      domainsNotified++;
    } catch (err) {
      console.error(
        `[EXPIRY-CRON] Domínio ${domainRow.domain} ignorado (não gerenciado por nós ou erro na consulta):`,
        err
      );
    }
  }

  return NextResponse.json({
    checkpoints: EXPIRY_CHECKPOINTS_DAYS,
    domainsNotified,
    subscriptionsNotified,
  });
}
