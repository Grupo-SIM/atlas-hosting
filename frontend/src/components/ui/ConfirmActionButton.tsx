"use client";

import { Check } from "lucide-react";
import { useEffect, useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function ConfirmActionButton({ confirmation, label, onConfirm, children, ...props }: Omit<ComponentProps<typeof Button>, "onClick"> & {
  confirmation: string;
  label: string;
  onConfirm: () => void;
}) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timeout = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timeout);
  }, [armed]);

  return (
    <TooltipProvider>
      <Tooltip open={armed ? true : undefined}>
        <TooltipTrigger asChild>
          <Button {...props} aria-label={armed ? `Confirmar: ${label}` : label} onClick={() => {
            if (!armed) { setArmed(true); return; }
            setArmed(false);
            onConfirm();
          }}>
            {armed ? <Check className="h-4 w-4" /> : children}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{armed ? confirmation : label}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
