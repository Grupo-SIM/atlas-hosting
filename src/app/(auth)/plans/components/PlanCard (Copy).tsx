import { createPlanInvoice } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import clsx from "clsx";
import type { Organization, Plan, User } from "@/lib/db/schema";
import { intersperse, toBrl } from "@/lib/utils";
import { Check, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import clsx from "clsx";
import type { Plan } from "@/lib/db/schema";
import type { User } from "next-auth";
import type { Organization } from "@/lib/db/schema";

export interface PlanCardProps {
  plan: Plan;
  user: User & { organization: Organization & { plan?: Plan | null } };
}

export function PlanCard({ plan, user }: PlanCardProps) {
  const currentPlanId = user.organization.planId;
  const isCurrentPlan = currentPlanId === plan.id;
  const userPlan = user.organization.plan;
  const hasPlan = !!userPlan?.id;
  const userPlanPrice = userPlan?.price ?? 0;

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

  let buttonText = "Escolher Plano";
  const buttonHref = `/plans?action=buy&planId=${plan.id}`;
  let buttonDisabled = false;
  let buttonVariant: "default" | "outline" | "secondary" = plan.featured
    ? "default"
    : "outline";

  if (isCurrentPlan) {
    buttonText = "Plano Atual";
    buttonDisabled = true;
    buttonVariant = "secondary";
  } else if (hasPlan && plan.price < userPlanPrice) {
    buttonText = "Selecionar Plano";
  } else if (hasPlan && plan.price > userPlanPrice) {
    buttonText = "Fazer Upgrade";
    buttonVariant = "default";
  }

  return (
    <Card
      className={clsx(
        "flex flex-col h-full transition-all duration-300 ease-in-out relative",
        plan.featured
          ? "border-2 border-primary shadow-xl transform lg:scale-105"
          : "border",
        isCurrentPlan
          ? "bg-muted/30 border-sky-500 border-dashed"
          : "hover:shadow-2xl hover:border-gray-300 dark:hover:border-gray-700"
      )}
    >
      {plan.featured && !isCurrentPlan && (
        <div className="absolute top-0 -right-0.5 bg-primary text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-bl-lg rounded-tr-md shadow-md z-10">
          POPULAR
        </div>
      )}
      {isCurrentPlan && (
        <div className="absolute top-0 -right-0.5 bg-sky-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-lg rounded-tr-md shadow-md z-10">
          SEU PLANO
        </div>
      )}
      <CardHeader className="p-6 pb-4">
        <CardTitle className="text-2xl font-semibold text-gray-800 dark:text-white">
          {plan.name}
        </CardTitle>
        {plan.description && (
          <p className="text-sm text-muted-foreground mt-1 min-h-[3em] line-clamp-2">
            {plan.description}
          </p>
        )}
        <div className="mt-4">
          <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
            R$ {plan.price ? plan.price.toFixed(2) : "N/A"}
          </span>
          <span className="text-sm font-medium text-muted-foreground">
            /mês
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-2 flex-grow">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
          Recursos incluídos:
        </h4>
        <ul className="space-y-3">
          {allFeaturesConfig.map((feature) => {
            const value = plan[feature.key as keyof Plan];
            let isPresent: boolean;
            if (feature.isBoolean) {
              isPresent = !!value;
            } else {
              isPresent =
                value !== null &&
                value !== undefined &&
                value !== 0 &&
                value !== false &&
                value !== "";
            }

            return (
              <li key={feature.key} className="flex items-start text-sm">
                {isPresent ? (
                  <Check className="h-4 w-4 text-green-500 mr-2.5 mt-[3px] flex-shrink-0" />
                ) : (
                  <XIcon className="h-4 w-4 text-red-400 mr-2.5 mt-[3px] flex-shrink-0" />
                )}
                <span
                  className={
                    isPresent
                      ? "text-gray-700 dark:text-gray-300"
                      : "text-muted-foreground line-through"
                  }
                >
                  {feature.label}
                  {!feature.isBoolean &&
                    isPresent &&
                    (value || value === 0) && (
                      <span className="font-medium text-gray-600 dark:text-gray-400 ml-1">
                        ({value}
                        {feature.unit ? ` ${feature.unit}` : ""})
                      </span>
                    )}
                </span>
              </li>
            );
          })}
        </ul>
      </CardContent>
      <CardFooter className="p-6 mt-auto bg-gray-50/50 dark:bg-black/10 rounded-b-lg">
        <Button
          asChild={!buttonDisabled}
          disabled={buttonDisabled}
          variant={buttonVariant}
          className="w-full text-md py-3 h-11 font-semibold"
          size="lg"
        >
          {buttonDisabled ? (
            <span>{buttonText}</span>
          ) : (
            <Link href={buttonHref}>{buttonText}</Link>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
