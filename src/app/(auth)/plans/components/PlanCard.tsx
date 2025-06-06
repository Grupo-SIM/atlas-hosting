import { createPlanInvoice } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Organization, Plan, User } from "@/lib/db/schema";
import { intersperse, toBrl } from "@/lib/utils";
import clsx from "clsx";
import { capitalize } from "lodash";
import { Check, XIcon, Crown, Zap, Shield, AlertTriangle } from "lucide-react";
import Form from "next/form";
import Link from "next/link";

export function PlanCard({ plan, user, searchParams, isDowngrade }: PlanCardProps) {
  const userPlan = user.organization.plan;
  const hasPlan = !!userPlan?.id;
  const isCurrentPlan = user.organization.planId === plan.id;

  // Unified configuration for all plan features
  const allFeaturesConfig: {
    key: keyof Plan;
    label: string;
    isBoolean: boolean;
    unit?: string;
  }[] = [
    { key: "maxSites", label: "Sites", isBoolean: false },
    { key: "maxStorage", label: "Armazenamento", isBoolean: false, unit: "GB" },
    { key: "ssl", label: "SSL Grátis", isBoolean: true },
    { key: "backup", label: "Backup", isBoolean: true },
    { key: "email", label: "Email", isBoolean: true },
    { key: "cdn", label: "CDN", isBoolean: true },
    { key: "supportPriority", label: "Suporte Prioritário", isBoolean: true },
  ];

  return (
    <Card
      className={clsx([
        "group relative transition-all duration-500 hover:scale-[1.01] hover:shadow-2xl hover:shadow-primary/10",
        plan.featured 
          ? "border-yellow-400/50 shadow-xl bg-gradient-to-br from-yellow-50/50 via-background to-orange-50/30 dark:from-yellow-950/20 dark:via-background dark:to-orange-950/20 hover:shadow-yellow-500/20" 
          : "hover:border-primary/50 hover:shadow-primary/5",
        isCurrentPlan && "ring-2 ring-emerald-500/50 bg-emerald-50/30 dark:bg-emerald-950/20 hover:ring-emerald-500/70",
        "flex flex-col h-full backdrop-blur-sm",
      ])}
    >
      {/* Featured Badge */}
      {plan.featured && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
            <Crown className="w-3 h-3 mr-1" />
            Mais Popular
          </Badge>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4 z-10">
          <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
            <Shield className="w-3 h-3 mr-1" />
            Seu Plano
          </Badge>
        </div>
      )}

      <CardHeader className={clsx("relative", plan.featured && "pt-8")}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">
                {capitalize(plan.name)}
              </CardTitle>
              <CardDescription className="text-sm">
                {capitalize(plan.description)}
              </CardDescription>
            </div>
            {plan.featured && (
              <div className="text-yellow-500">
                <Zap className="w-6 h-6" />
              </div>
            )}
          </div>
          
          {/* Price Section */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                {toBrl(plan.price)}
              </span>
              <span className="text-muted-foreground text-sm">/mês</span>
            </div>
            <div className="text-xs text-muted-foreground">
              Cobrado mensalmente • Cancele quando quiser
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-6">
        <div className="flex-1 space-y-4">
          {/* Features Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              ✨ Recursos inclusos
            </Badge>
          </div>

          {/* Features List */}
          <ul className="space-y-3">
            {intersperse(
              allFeaturesConfig.map(({ key, label, isBoolean, unit }) => {
                const value = plan[key];
                const hasFeature = isBoolean ? !!value : true;

                return (
                  <li
                    key={key as string}
                    className={clsx(
                      "flex items-center gap-3 text-sm transition-colors",
                      hasFeature 
                        ? "text-foreground" 
                        : "text-muted-foreground line-through"
                    )}
                  >
                    <div className={clsx(
                      "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center",
                      hasFeature 
                        ? "bg-emerald-100 dark:bg-emerald-950" 
                        : "bg-red-100 dark:bg-red-950"
                    )}>
                      {hasFeature ? (
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <XIcon className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    <span className="flex-1">
                      {isBoolean
                        ? label
                        : `${label}: ${value}${unit ? ` ${unit}` : ""}`}
                    </span>
                  </li>
                );
              }),
              (i) => (
                <li key={i} className="border-l border-muted ml-2.5 pl-2.5 h-0" />
              )
            )}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="pt-4 border-t space-y-3">
          {isCurrentPlan ? (
            <Button 
              disabled={true} 
              className="w-full h-12 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" 
              variant="outline"
            >
              <Shield className="w-4 h-4 mr-2" />
              Plano Atual
            </Button>
          ) : isDowngrade ? (
            <>
              <Button
                disabled={true}
                className="w-full h-12 font-semibold opacity-50 cursor-not-allowed"
                variant="outline"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Downgrade Não Permitido
              </Button>
              <Alert className="border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/20">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-xs text-amber-800 dark:text-amber-200">
                  Para fazer downgrade, cancele sua assinatura atual em{" "}
                  <Link 
                    href="/settings" 
                    className="font-medium underline hover:no-underline"
                  >
                    configurações
                  </Link>
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <Form action="">
              <input type="hidden" name="planId" value={plan.id} />
              <input type="hidden" name="action" value="buy" />
              <Button
                isLoading={searchParams?.action === "buy"}
                type="submit"
                className={clsx(
                  "w-full h-12 font-semibold transition-all duration-300",
                  plan.featured 
                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl" 
                    : "hover:shadow-lg"
                )}
                variant={plan.featured ? "default" : "outline"}
              >
                {hasPlan ? "Atualizar Plano" : "Começar Agora"}
                {!plan.featured && <Zap className="w-4 h-4 ml-2" />}
              </Button>
            </Form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export interface PlanCardProps {
  plan: Plan; // Removed features property as it's part of Plan now
  user: User & { organization: Organization };
  searchParams?: { [key: string]: string };
  isDowngrade?: boolean;
}
