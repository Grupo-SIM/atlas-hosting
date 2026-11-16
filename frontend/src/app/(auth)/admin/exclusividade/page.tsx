import { getTemplate, listTemplates } from "@repo/site-builder";
import { format } from "date-fns";
import { inArray } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRealUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  LIVE_EXCLUSIVITY_STATUSES,
  pgTemplateExclusivity,
  pgTemplateExclusivitySetting,
  pgTemplateProposal,
  pgUser,
} from "@/lib/db/schema";
import { hasAreaAccess } from "@/lib/permissions/access";
import { formatBrl } from "@/lib/template-exclusivity/rules";
import { getResaleConfig } from "@/lib/template-exclusivity/status";
import {
  type AdminOwnerStatus,
  type AdminTemplateRow,
  ResaleSettingsForm,
  TemplatesTable,
} from "./forms";

export const metadata: Metadata = {
  title: "Exclusividade de templates - Admin",
};

/** Texto de apoio do dono: vencimento e valor pago, ou o fim da reserva. */
function ownerSub(
  owner: {
    expiresAt: Date | null;
    paidAmountBrl: number;
    reservedUntil: Date | null;
    status: string;
  },
  now: Date
): string {
  if (owner.status === "reserved") {
    if (!owner.reservedUntil) return "Reserva em andamento";
    const hours = Math.max(
      1,
      Math.ceil((owner.reservedUntil.getTime() - now.getTime()) / 3_600_000)
    );
    return `Reserva expira em ${hours}h`;
  }
  const paid = `pagou ${formatBrl(owner.paidAmountBrl)}`;
  if (!owner.expiresAt) return paid;
  const verb = owner.status === "past_due" ? "Venceu" : "Vence";
  return `${verb} ${format(owner.expiresAt, "dd/MM/yyyy")} · ${paid}`;
}

export default async function AdminExclusivityPage() {
  const admin = await getRealUser();
  if (!(await hasAreaAccess(admin, "admin_exclusivity", "view")))
    redirect("/home");

  const [settings, live, openProposals, resale] = await Promise.all([
    db.select().from(pgTemplateExclusivitySetting),
    db
      .select()
      .from(pgTemplateExclusivity)
      .where(
        inArray(pgTemplateExclusivity.status, [...LIVE_EXCLUSIVITY_STATUSES])
      ),
    db
      .select({
        exclusivityId: pgTemplateProposal.exclusivityId,
        status: pgTemplateProposal.status,
      })
      .from(pgTemplateProposal)
      .where(inArray(pgTemplateProposal.status, ["open", "awaiting_payment"])),
    getResaleConfig(),
  ]);

  const ownerIds = [...new Set(live.map(row => row.ownerUserId))];
  const owners = ownerIds.length
    ? await db
        .select({ email: pgUser.email, id: pgUser.id, name: pgUser.name })
        .from(pgUser)
        .where(inArray(pgUser.id, ownerIds))
    : [];

  const now = new Date();
  const templates = listTemplates();
  const rows: AdminTemplateRow[] = templates.map(template => {
    const setting = settings.find(item => item.templateId === template.id);
    const owner = live.find(item => item.templateId === template.id);
    const user = owner
      ? owners.find(item => item.id === owner.ownerUserId)
      : undefined;
    const negotiations = owner
      ? openProposals.filter(item => item.exclusivityId === owner.id)
      : [];
    return {
      annualPriceBrl: setting?.annualPriceBrl ?? 0,
      enabled: setting?.enabled ?? false,
      id: template.id,
      name: template.name,
      negotiations: {
        awaitingPayment: negotiations.some(
          item => item.status === "awaiting_payment"
        ),
        open: negotiations.length,
      },
      owner: owner
        ? {
            email: user?.email ?? "",
            name: user?.name ?? "",
            status: owner.status as AdminOwnerStatus,
            sub: ownerSub(owner, now),
          }
        : null,
      swatch: getTemplate(template.id)?.site.theme.bg ?? "#27272a",
    };
  });

  // Resumo: só conta templates que ainda existem no registro.
  const ids = new Set(templates.map(template => template.id));
  const owned = live.filter(
    item => ids.has(item.templateId) && item.status !== "reserved"
  );
  const pastDue = owned.filter(item => item.status === "past_due").length;
  // Receita anual: o que a próxima renovação de cada dono vai cobrar
  // (preço atual do admin; sem preço, o valor pago).
  const annualRevenue = owned.reduce((total, item) => {
    const price = settings.find(s => s.templateId === item.templateId)?.annualPriceBrl;
    return total + (price && price > 0 ? price : item.paidAmountBrl);
  }, 0);
  const liveIds = new Set(
    live.filter(item => ids.has(item.templateId)).map(item => item.id)
  );
  const openNegotiations = openProposals.filter(item =>
    liveIds.has(item.exclusivityId)
  ).length;

  const stats = [
    {
      label: "Aceitam exclusividade",
      suffix: `de ${templates.length}`,
      value: String(rows.filter(row => row.enabled).length),
    },
    {
      label: "Com dono",
      suffix: pastDue ? `· ${pastDue} em atraso` : "",
      value: String(owned.length),
    },
    { label: "Receita anual ativa", suffix: "", value: formatBrl(annualRevenue) },
    { label: "Negociações abertas", suffix: "", value: String(openNegotiations) },
  ];

  return (
    <div className="flex flex-col gap-5 p-6 pb-24">
      <div className="flex flex-col gap-1">
        <h1 className="font-bold text-3xl tracking-tight">
          Exclusividade de templates
        </h1>
        <p className="max-w-[720px] text-pretty text-muted-foreground">
          Escolha quais templates podem ser comprados com exclusividade e o
          preço anual de cada um. Templates sem exclusividade continuam livres
          para todos.
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-lg border bg-card lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            className={`flex flex-col gap-1 px-5 py-4 ${index % 2 ? "border-l" : ""} ${
              index >= 2 ? "border-t lg:border-t-0" : ""
            } ${index === 2 ? "lg:border-l" : ""}`}
            key={stat.label}
          >
            <span className="text-muted-foreground text-xs">{stat.label}</span>
            <span className="font-medium text-[22px] tracking-[-0.01em]">
              {stat.value}
              {stat.suffix && (
                <span className="font-normal text-[13px] text-muted-foreground">
                  {" "}
                  {stat.suffix}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <ResaleSettingsForm
        feePercent={resale.feePercent}
        minPriceBrl={resale.minPriceBrl}
      />

      <TemplatesTable rows={rows} />
    </div>
  );
}
