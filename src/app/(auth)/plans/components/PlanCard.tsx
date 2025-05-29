"use client";

import { createPlanInvoice } from "@/app/actions"; // Import the server action
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast"; // Import toast for displaying messages
import type { Plan, User } from "@/lib/db/schema";
import { intersperse, toBrl } from "@/lib/utils";
import clsx from "clsx";
import { capitalize } from "lodash";
import { Check, XIcon } from "lucide-react"; // Import XIcon
import { startTransition, useActionState, useCallback, useEffect } from "react";

// Define initial state for the form
const initialState = {
  status: "idle" as "error" | "success" | "idle",
  message: "",
};

export function PlanCard({ plan, user }: PlanCardProps) {
  const [state, doBuyPlan, isPending] = useActionState(
    createPlanInvoice,
    initialState
  );

  useEffect(() => {
    if (state.status === "error" && state.message) {
      toast({
        title: "Erro",
        description: state.message,
        variant: "destructive",
      });
    }
    // Redirect logic can be added here if state.status === "success" and a redirectUrl is provided in state
  }, [state]);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      startTransition(() => {
        doBuyPlan(plan.id);
      });
    },
    [doBuyPlan, plan.id]
  );

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
        plan.featured ? "border-primary shadow-lg" : "",
        user.planId === plan.id && "opacity-20",
        "flex flex-col h-full",
      ])}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>{capitalize(plan.name)}</CardTitle>
            <CardDescription>{capitalize(plan.description)}</CardDescription>
          </div>
          {plan.featured && (
            <Badge
              variant="default"
              className="bg-primary text-primary-foreground"
            >
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 h-full">
        <div className="flex flex-col h-full gap-4">
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{toBrl(plan.price)}</span>
            <span className="text-muted-foreground ml-1">/mês</span>
          </div>
          <div className="h-full flex-1">
            <div className="flex flex-col gap-3">
              {/* <hr /> */}
              <Badge
                variant="secondary"
                className="text-sm font-medium my-0 mr-auto"
              >
                Incluso
              </Badge>
              <hr />
              <ul className="space-y-2.5">
                {intersperse(
                  allFeaturesConfig.map(({ key, label, isBoolean, unit }) => {
                    const value = plan[key];
                    const hasFeature = isBoolean ? !!value : true; // Non-boolean features are always considered 'present'

                    return (
                      <li
                        key={key as string}
                        className={clsx("flex items-center", {
                          "text-muted-foreground line-through":
                            isBoolean && !hasFeature,
                        })}
                      >
                        {hasFeature ? (
                          <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                        ) : (
                          // This case should only be hit for boolean features that are false
                          <XIcon className="h-4 w-4 mr-2 text-red-500 flex-shrink-0" />
                        )}
                        {isBoolean
                          ? label
                          : `${label}: ${value}${unit ? ` ${unit}` : ""}`}
                      </li>
                    );
                  }),
                  (i) => (
                    <hr key={i} />
                  )
                )}
              </ul>
            </div>
          </div>
          {user.planId === plan.id ? (
            <Button disabled={true} className="w-full" variant="outline">
              Plano atual
            </Button>
          ) : (
            <form onSubmit={onSubmit}>
              <Button
                isLoading={isPending}
                type="submit"
                className="w-full"
                variant={plan.featured ? "default" : "outline"}
              >
                Adquirir Agora
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export interface PlanCardProps {
  plan: Plan; // Removed features property as it's part of Plan now
  user: User;
}
