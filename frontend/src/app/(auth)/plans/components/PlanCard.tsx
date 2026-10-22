import { TooltipArrow } from "@radix-ui/react-tooltip";
import clsx from "clsx";
import { capitalize } from "lodash";
import { AlertTriangle, Check, Crown, Shield, XIcon, Zap } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Organization, Plan, User } from "@/lib/db/schema";
import { intersperse, toBrl } from "@/lib/utils";

export function PlanCard({
  plan,
  user,
  searchParams,
  isDowngrade,
}: PlanCardProps) {
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
    { isBoolean: false, key: "maxSites", label: "Sites" },
    { isBoolean: false, key: "maxStorage", label: "Armazenamento", unit: "GB" },
    { isBoolean: true, key: "ssl", label: "SSL Grátis" },
    { isBoolean: true, key: "backup", label: "Backup" },
    { isBoolean: true, key: "email", label: "Email" },
    { isBoolean: true, key: "cdn", label: "CDN" },
    { isBoolean: true, key: "supportPriority", label: "Suporte Prioritário" },
  ];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            className={clsx([
              "group relative transition-all duration-500",
              !isCurrentPlan && plan.featured
                ? "border-yellow-400/50 bg-gradient-to-br from-yellow-50/50 via-background to-orange-50/30 shadow-xl hover:shadow-yellow-500/20 dark:from-yellow-950/20 dark:via-background dark:to-orange-950/20"
                : "hover:border-primary/50 hover:shadow-primary/5",
              isCurrentPlan
                ? "bg-emerald-50/30 ring-2 ring-emerald-500/50 hover:ring-emerald-500/70 dark:bg-emerald-950/20"
                : "hover:scale-[1.02] hover:shadow-lg hover:shadow-primary/10",
              "flex h-full flex-col backdrop-blur-sm",
            ])}
          >
            {/* Featured Badge */}
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 transform">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
                  <Crown className="mr-1 h-3 w-3" />
                  Mais Popular
                </Badge>
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan && (
              <div className="absolute -top-3 right-4 z-10">
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg">
                  <Shield className="mr-1 h-3 w-3" />
                  Seu Plano
                </Badge>
              </div>
            )}

            <CardHeader className={clsx("relative", plan.featured && "pt-8")}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="font-bold text-xl">
                      {capitalize(plan.name)}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {capitalize(plan.description)}
                    </CardDescription>
                  </div>
                  {plan.featured && (
                    <div className="text-yellow-500">
                      <Zap className="h-6 w-6" />
                    </div>
                  )}
                </div>

                {/* Price Section */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text font-bold text-3xl text-transparent">
                      {toBrl(plan.price)}
                    </span>
                    <span className="text-muted-foreground text-sm">/mês</span>
                  </div>
                  <div className="text-muted-foreground text-xs">
                    Cobrado mensalmente • Cancele quando quiser
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col space-y-6">
              <div className="flex-1 space-y-4">
                {/* Features Badge */}
                <div className="flex items-center gap-2">
                  <Badge className="text-xs" variant="secondary">
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
                          className={clsx(
                            "flex items-center gap-3 text-sm transition-colors",
                            hasFeature
                              ? "text-foreground"
                              : "text-muted-foreground line-through"
                          )}
                          key={key as string}
                        >
                          <div
                            className={clsx(
                              "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                              hasFeature
                                ? "bg-emerald-100 dark:bg-emerald-950"
                                : "bg-red-100 dark:bg-red-950"
                            )}
                          >
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
                    i => (
                      <li
                        className="ml-2.5 h-0 border-muted border-l pl-2.5"
                        key={i}
                      />
                    )
                  )}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="space-y-3 border-t pt-4">
                {isCurrentPlan ? (
                  <Button
                    className="h-12 w-full border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    disabled={true}
                    variant="outline"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Plano Atual
                  </Button>
                ) : isDowngrade ? (
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        className="h-12 w-full cursor-not-allowed font-semibold opacity-50"
                        disabled={true}
                        variant="outline"
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Downgrade Não Permitido
                      </Button>
                    </span>
                  </TooltipTrigger>
                ) : (
                  <Form action="">
                    <input name="planId" type="hidden" value={plan.id} />
                    <input name="action" type="hidden" value="buy" />
                    <Button
                      className={clsx(
                        "h-12 w-full font-semibold transition-all duration-300",
                        plan.featured
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg hover:from-yellow-600 hover:to-orange-600 hover:shadow-xl"
                          : "hover:shadow-lg"
                      )}
                      isLoading={searchParams?.action === "buy"}
                      type="submit"
                      variant={plan.featured ? "default" : "outline"}
                    >
                      {hasPlan ? "Atualizar Plano" : "Começar Agora"}
                      {!plan.featured && <Zap className="ml-2 h-4 w-4" />}
                    </Button>
                  </Form>
                )}
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        {isDowngrade && (
          <TooltipPortal>
            <TooltipContent className="max-w-xs" side="bottom" sideOffset={8}>
              <TooltipArrow className="fill-border" />
              <span className="text-muted-foreground text-sm">
                Para fazer downgrade do seu plano, você precisa primeiro
                cancelar sua assinatura atual.{" "}
                <Link
                  className="font-medium text-foreground underline hover:no-underline"
                  href="/settings"
                >
                  Gerencie suas assinaturas aqui
                </Link>
              </span>
            </TooltipContent>
          </TooltipPortal>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}

export interface PlanCardProps {
  plan: Plan; // Removed features property as it's part of Plan now
  user: User & { organization: Organization };
  searchParams?: { [key: string]: string };
  isDowngrade?: boolean;
}
