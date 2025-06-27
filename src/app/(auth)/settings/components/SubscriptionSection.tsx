import { UserPlanBadge } from "@/components/dashboard/WelcomeHeader";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { db } from "@/lib/db";
import type { User } from "@/lib/db/schema/tables/user";
import { toBrl } from "@/lib/utils";
import { addMonths } from "date-fns";
import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  CreditCard,
  HardDrive,
  Mail,
  Package,
  Server,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { DomainResponse } from "@/plesk/models"; // Assuming this type is available from your Plesk SDK
import { getDomain, getDomainDiskUsage } from "@/lib/server/apis/plesk-xml/client";
import pleskApi from "@/lib/server/apis/plesk";
import { sum } from "lodash";

interface SubscriptionSectionProps {
  user: User;
}

export async function SubscriptionSection({ user }: SubscriptionSectionProps) {
  if (!user.organization.plan) {
    return redirect("/settings?");
  }

  const plan = user.organization.plan;
  const hasActivePlan = !!plan;

  const lastBillingInvoice = await db.query.pgInvoice.findFirst({
    where: (pgInvoice, { eq }) =>
      eq(pgInvoice.reference, user.organization.planId ?? ""),
    orderBy: (pgInvoice, { desc }) => desc(pgInvoice.createdAt),
  });

  // Mock data for demonstration
  const nextBillingDate = addMonths(
    lastBillingInvoice?.createdAt ?? new Date(),
    1
  );

  let totalStorageUsedBytes = 0;
  try {
    const usages = await Promise.all(user.organization.domains.filter(domain =>domain.active).map(domain => getDomainDiskUsage(domain.domain).then(d => sum(Object.values(d ?? {})))));
    totalStorageUsedBytes = sum(usages)
  } catch (error) {
    console.error("Failed to initialize Plesk API or process domains for storage usage:", error);
  }

  const calculatedStorageUsedGB = totalStorageUsedBytes / (1024 * 1024 * 1024); // Convert bytes to GB
  const storageLimit = plan?.maxStorage || 100; // GB
  const storagePercentage = storageLimit > 0 ? (calculatedStorageUsedGB / storageLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card>
        <CardHeader className="grid gap-2 grid-cols-2 grid-rows-[auto]">
          <div className="grid grid-rows-2 grid-cols-1">
            <CardTitle className="flex items-center gap-2 mb-3">
              <Package className="h-5 w-5" />
              Plano Atual
            </CardTitle>
            <UserPlanBadge user={user} />
          </div>
          {hasActivePlan && (
            <div className="text-right">
              <div className="text-2xl font-bold">{toBrl(plan.price)}</div>
              <div className="text-sm text-muted-foreground">por mês</div>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {hasActivePlan ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                  <Server className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="font-medium">{plan.maxSites}</p>
                    <p className="text-sm text-muted-foreground">Sites</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                  <HardDrive className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="font-medium">{plan.maxStorage} GB</p>
                    <p className="text-sm text-muted-foreground">
                      Armazenamento
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border bg-card/50">
                  <Mail className="h-8 w-8 text-purple-500" />
                  <div>
                    <p className="font-medium">
                      {plan.email ? "Ilimitado" : "Não incluído"}
                    </p>
                    <p className="text-sm text-muted-foreground">E-mails</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {plan.ssl && (
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-700"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    SSL Incluído
                  </Badge>
                )}
                {plan.backup && (
                  <Badge
                    variant="secondary"
                    className="bg-blue-500/10 text-blue-700"
                  >
                    <HardDrive className="w-3 h-3 mr-1" />
                    Backup Automático
                  </Badge>
                )}
                {plan.cdn && (
                  <Badge
                    variant="secondary"
                    className="bg-purple-500/10 text-purple-700"
                  >
                    CDN Global
                  </Badge>
                )}
                {plan.supportPriority && (
                  <Badge
                    variant="secondary"
                    className="bg-orange-500/10 text-orange-700"
                  >
                    Suporte Prioritário
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Nenhum plano ativo</h3>
              <p className="text-muted-foreground mb-4">
                Assine um plano para começar a usar nossos serviços
              </p>
              <Link href="/plans">
                <Button>
                  Ver Planos Disponíveis
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Information */}
      {hasActivePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HardDrive className="h-5 w-5" />
              Uso de Recursos
            </CardTitle>
            <CardDescription>
              Monitoramento do uso dos recursos do seu plano
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Armazenamento</p>
                  <p className="text-sm text-muted-foreground">
                    {calculatedStorageUsedGB.toFixed(2)} GB de {storageLimit} GB utilizados
                  </p>
                </div>
                <Badge
                  variant={storagePercentage > 80 ? "destructive" : "secondary"}
                  className={
                    storagePercentage > 80
                      ? ""
                      : "bg-green-500/10 text-green-700"
                  }
                >
                  {storagePercentage.toFixed(1)}%
                </Badge>
              </div>
              <Progress value={storagePercentage} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sites Ativos</p>
                    <p className="text-sm text-muted-foreground">
                      2 de {plan.maxSites} sites
                    </p>
                  </div>
                  <Server className="h-6 w-6 text-blue-500" />
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-card/50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Contas de E-mail</p>
                    <p className="text-sm text-muted-foreground">
                      {plan.email ? "8 contas ativas" : "Não disponível"}
                    </p>
                  </div>
                  <Mail className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Billing Information */}
      {hasActivePlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Informações de Cobrança
            </CardTitle>
            <CardDescription>
              Detalhes sobre pagamentos e próximas cobranças
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Próxima cobrança</p>
                  <p className="text-sm text-muted-foreground">
                    {nextBillingDate.toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold">{toBrl(plan.price)}</p>
                <Badge
                  variant="outline"
                  className="bg-green-500/10 text-green-600"
                >
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ativo
                </Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Link href="/plans" className="flex-1">
                <Button className="w-full">Alterar Plano</Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Cancelar Assinatura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Cancelar assinatura do plano {plan.name}?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Você perderá acesso a
                      todos os recursos do seu plano atual. Seus sites e dados
                      permanecerão ativos até o final do período de cobrança
                      atual ({nextBillingDate.toLocaleDateString("pt-BR")}).
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Manter Assinatura</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Confirmar Cancelamento
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
