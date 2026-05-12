"use client";

import { useTransition, useState } from "react";
import { Button } from "@/components/ui/button";
import { backfillVpsSubscriptionsAction } from "./actions";

export function BackfillButton() {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ created: number; skipped: number } | null>(null);

  function handleClick() {
    startTransition(async () => {
      const r = await backfillVpsSubscriptionsAction();
      setResult(r);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="sm" onClick={handleClick} disabled={pending}>
        {pending ? "Importando..." : "Importar faturas antigas"}
      </Button>
      {result && (
        <span className="text-sm text-muted-foreground">
          {result.created} criadas, {result.skipped} ignoradas
        </span>
      )}
    </div>
  );
}
