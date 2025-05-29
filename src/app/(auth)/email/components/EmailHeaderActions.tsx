"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmailHeaderActionsProps {
  onNewEmailClick: () => void;
  onBuyPlanClick: () => void;
}

export function EmailHeaderActions({
  onNewEmailClick,
  onBuyPlanClick,
}: EmailHeaderActionsProps) {
  return (
    <div className="flex gap-3">
      <Button variant="outline" onClick={onBuyPlanClick}>
        Comprar um plano
      </Button>
      <Button onClick={onNewEmailClick}>
        <Plus className="h-4 w-4 mr-2" />
        Nova conta de e-mail
      </Button>
    </div>
  );
}
