"use client";

import { TooltipArrow } from "@radix-ui/react-tooltip";
import { Info } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  domains: string[];
  disabled?: boolean;
}

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
      <p className="text-muted-foreground text-sm">
        Uma única fatura inclui os {domains.length} domínios. Após o pagamento,
        todos são registrados automaticamente.
      </p>
      <div className="space-y-2">
        <Label>Período de registro</Label>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Select onValueChange={setYears} value={years}>
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
              checked={whois}
              id="bundle-wg"
              onCheckedChange={v => setWhois(v === true)}
            />
            <div className="flex items-center gap-1.5">
              <Label
                className="cursor-pointer font-normal text-sm"
                htmlFor="bundle-wg"
              >
                Proteção WHOIS
              </Label>
              <TooltipProvider>
                <Tooltip delayDuration={100}>
                  <TooltipTrigger asChild>
                    <button
                      aria-label="O que é proteção WHOIS"
                      className="inline-flex shrink-0 rounded-full text-muted-foreground outline-offset-2 transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring/70"
                      type="button"
                    >
                      <Info aria-hidden className="size-4" strokeWidth={2} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent
                    align="start"
                    className="max-w-[min(18rem,calc(100vw-2rem))]"
                    side="top"
                  >
                    <p className="p-1 text-center text-foreground/90 text-sm leading-snug">
                      WHOIS é a listagem pública dos dados de registo do
                      domínio. A proteção oculta os seus dados pessoais nessa
                      consulta.
                    </p>
                    <TooltipArrow className="fill-border" />
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </div>
      <Button
        asChild
        className="w-full sm:w-auto"
        disabled={disabled}
        size="lg"
      >
        <Link href={confirmHref}>Gerar fatura e ir ao pagamento</Link>
      </Button>
    </div>
  );
}
