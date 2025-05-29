"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface DomainOverviewActionsProps {
  onChangePlan: () => void;
}

export function DomainOverviewActions({
  onChangePlan,
}: DomainOverviewActionsProps) {
  return (
    <Button
      variant="link"
      className="text-sm p-0 h-auto"
      onClick={onChangePlan}
    >
      Alterar plano
      <ArrowRight className="ml-1 h-3 w-3" />
    </Button>
  );
}
