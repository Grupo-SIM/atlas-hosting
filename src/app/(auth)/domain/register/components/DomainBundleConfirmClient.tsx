"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";

type Props = {
  domains: string[];
  disabled?: boolean;
};

export function DomainBundleConfirmClient({ domains, disabled }: Props) {
  const [years, setYears] = useState("1");
  const [whois, setWhois] = useState(false);

  const confirmHref = useMemo(() => {
    const q = new URLSearchParams();
    q.set("tab", "register");
    q.set("bundle", domains.join(","));
    q.set("confirm", "1");
    q.set("years", years);
    q.set("whoisguard", whois ? "on" : "off");
    return `/domain?${q.toString()}`;
  }, [domains, years, whois]);

  return (
    <div className="mt-6 space-y-4 rounded-xl border border-border/80 bg-muted/20 p-4">
      <p className="text-sm text-muted-foreground">
        Uma única fatura inclui os {domains.length} domínios. Após o pagamento, todos são registrados
        automaticamente.
      </p>
      <div className="space-y-2">
        <Label>Período de registro</Label>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Select value={years} onValueChange={setYears}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 ano</SelectItem>
              <SelectItem value="2">2 anos</SelectItem>
              <SelectItem value="3">3 anos</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center justify-center gap-2">
            <Checkbox
              id="bundle-wg"
              checked={whois}
              onCheckedChange={(v) => setWhois(v === true)}
            />
            <div className="flex items-center gap-1.5">
              <Label htmlFor="bundle-wg" className="cursor-pointer text-sm font-normal">
                Proteção WHOIS
              </Label>
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex shrink-0 rounded-full text-muted-foreground outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70"
                      aria-label="O que é proteção WHOIS"
                    >
                      <Info className="size-4" strokeWidth={2} aria-hidden />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent align="start" side="top" className="max-w-[min(18rem,calc(100vw-2rem))]">
                    <p className="p-1 text-center text-sm leading-snug text-foreground/90">
                      WHOIS é a listagem pública dos dados de registo do domínio. A proteção oculta os
                      seus dados pessoais nessa consulta.
                    </p>
                    <TooltipArrow className="fill-border" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
      <Button asChild disabled={disabled} className="w-full sm:w-auto" size="lg">
        <Link href={confirmHref}>Gerar fatura e ir ao pagamento</Link>
      </Button>
    </div>
  );
}
