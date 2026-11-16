import { listTemplates } from "@repo/site-builder";
import { format } from "date-fns";
import { inArray } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getRealUser } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  LIVE_EXCLUSIVITY_STATUSES,
  pgTemplateExclusivity,
  pgTemplateExclusivitySetting,
  pgTemplateProposal,
  pgUser,
} from "@/lib/db/schema";
import { formatBrl } from "@/lib/template-exclusivity/rules";
import { getResaleConfig } from "@/lib/template-exclusivity/status";
import { ResaleSettingsForm, TemplateSettingRow } from "./forms";

export const metadata: Metadata = {
  title: "Exclusividade de templates - Admin",
};

const STATUS_LABEL: Record<string, string> = {
  active: "Ativa",
  past_due: "Em atraso",
  reserved: "Checkout em andamento",
};

export default async function AdminExclusivityPage() {
  const admin = await getRealUser();
  if (!admin.isAdmin) redirect("/home");

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

  const templates = listTemplates();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-3xl tracking-tight">
          Exclusividade de templates
        </h1>
        <p className="mt-1 text-muted-foreground">
          Escolha quais templates podem ser comprados com exclusividade e o
          preço anual de cada um. Templates sem exclusividade continuam livres
          para todos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenda</CardTitle>
          <CardDescription>
            Na revenda o comprador paga o valor fechado + a taxa do Atlas. O
            dono escolhe o valor mínimo de venda, que não pode ficar abaixo do
            piso abaixo. Mudanças valem para as próximas faturas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResaleSettingsForm
            feePercent={resale.feePercent}
            minPriceBrl={resale.minPriceBrl}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
          <CardDescription>
            {settings.filter(item => item.enabled).length} com exclusividade ·{" "}
            {live.filter(item => item.status !== "reserved").length} com dono
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template</TableHead>
                <TableHead>Exclusividade</TableHead>
                <TableHead>Dono atual</TableHead>
                <TableHead>Negociações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map(template => {
                const setting = settings.find(s => s.templateId === template.id);
                const owner = live.find(row => row.templateId === template.id);
                const ownerUser = owner
                  ? owners.find(user => user.id === owner.ownerUserId)
                  : undefined;
                const negotiations = owner
                  ? openProposals.filter(p => p.exclusivityId === owner.id)
                  : [];
                return (
                  <TableRow key={template.id}>
                    <TableCell className="align-top">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-muted-foreground text-xs">
                        {template.id}
                      </div>
                    </TableCell>
                    <TableCell className="align-top">
                      <TemplateSettingRow
                        annualPriceBrl={setting?.annualPriceBrl ?? 0}
                        enabled={setting?.enabled ?? false}
                        hasOwner={Boolean(owner)}
                        templateId={template.id}
                      />
                    </TableCell>
                    <TableCell className="align-top">
                      {owner ? (
                        <div className="space-y-1 text-sm">
                          <div>{ownerUser?.name ?? "—"}</div>
                          <div className="text-muted-foreground text-xs">
                            {ownerUser?.email}
                          </div>
                          <Badge
                            variant={
                              owner.status === "past_due"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {STATUS_LABEL[owner.status] ?? owner.status}
                          </Badge>
                          {owner.expiresAt && (
                            <div className="text-muted-foreground text-xs">
                              Vence em {format(owner.expiresAt, "dd/MM/yyyy")} ·
                              pagou {formatBrl(owner.paidAmountBrl)}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>
                    <TableCell className="align-top text-sm">
                      {negotiations.length === 0
                        ? "—"
                        : `${negotiations.length} aberta(s)${
                            negotiations.some(p => p.status === "awaiting_payment")
                              ? " · 1 aguardando pagamento"
                              : ""
                          }`}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
