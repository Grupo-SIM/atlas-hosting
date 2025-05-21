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
import { Feature, Plan, User } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import clsx from "clsx";
import { capitalize } from "lodash";
import { Check } from "lucide-react";
import { startTransition, useActionState, useCallback, useEffect } from "react"; // Import useEffect for handling redirection

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

  return (
    <Card
      className={clsx([
        plan.featured ? "border-primary shadow-lg" : "",
        user.planId === plan.id && "opacity-70",
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
            <div>
              <p className="text-sm font-medium mb-3">Incluso:</p>
              <ul className="space-y-2.5">
                {plan.features.map((feature: Feature, index: number) => (
                  <li key={index} className="flex items-center text-sm">
                    <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span>{feature.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {user.planId === plan.id ? (
            <Button disabled className="w-full" variant="outline">
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
  plan: Plan & { features: Feature[] };
  user: User;
}
