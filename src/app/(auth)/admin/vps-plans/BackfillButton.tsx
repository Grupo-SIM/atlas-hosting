"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { backfillVpsSubscriptionsAction } from "./actions";

export function BackfillButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
  } | null>(null);

  function handleClick() {
    startTransition(async () => {
      const r = await backfillVpsSubscriptionsAction();
      setResult(r);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button
        disabled={pending}
        onClick={handleClick}
        size="sm"
        variant="outline"
      >
        {pending ? "Importando..." : "Importar faturas antigas"}
      </Button>
      {result && (
        <span className="text-muted-foreground text-sm">
          {result.created} criadas, {result.skipped} ignoradas
        </span>
      )}
    </div>
  );
}
