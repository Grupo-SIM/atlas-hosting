"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { FaCircleQuestion } from "react-icons/fa6";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { Separator } from "../ui/separator";
import { Check } from "lucide-react";
import { useState, useTransition, useEffect } from "react";
import { Skeleton } from "../ui/skeleton";
import { toBrl } from "@/lib/utils";
import { createDomainInvoice } from "@/app/actions";
import { toast } from "sonner";

interface DomainPriceSelectorProps {
  domain: string;
  defaultYears: string;
  whoisguard: string;
  registerOptions: { duration: number }[];
  isConfirming: boolean;
  price: number;
  renewBRL: number;
  multiYearPricesBRL?: Record<number, number>;
}

export function DomainPriceSelector({
  domain,
  defaultYears,
  whoisguard,
  registerOptions,
  isConfirming,
  price,
  renewBRL,
  multiYearPricesBRL,
}: DomainPriceSelectorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Estado local para atualização instantânea
  const [localYears, setLocalYears] = useState(defaultYears);

  // Sincroniza o estado local quando a prop defaultYears mudar (vinda do servidor)
  useEffect(() => {
    setLocalYears(defaultYears);
  }, [defaultYears]);

  const handleYearsChange = (value: string) => {
    setLocalYears(value); // Atualiza instantaneamente a UI
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("years", value);
      params.delete("confirm");
      router.push(`?${params.toString()}`, { scroll: false });
    });
  };



  const currentPrice = (multiYearPricesBRL && multiYearPricesBRL[parseInt(localYears, 10)]) 
    ? multiYearPricesBRL[parseInt(localYears, 10)] 
    : price;

  const selectedYears = parseInt(localYears, 10);

  return (
    <div>
      {/* Preço e Status (Ajustado levemente para a esquerda) */}
      <div className="flex items-center justify-between gap-4 px-4 pr-10 mb-6">
        <div className="flex-1" />
        <div className="grid grid-flow-col grid-cols-[auto_auto_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-1">
          <div className="text-xs text-muted-foreground">
            {selectedYears === 1 ? "Primeiro ano" : `${selectedYears} anos`}
          </div>
          <h2 className="m-0 text-2xl font-semibold">
            {toBrl(currentPrice)}
          </h2>
          <Separator orientation="vertical" className="row-span-2 my-auto h-3/4" />
          <div className="text-right text-xs text-muted-foreground">Renovação</div>
          <span className="flex items-center text-muted-foreground">
            {toBrl(renewBRL)}
          </span>
        </div>
      </div>

      <Separator className="mb-4 w-full" />
      <div className="grid grid-cols-[1fr_1fr_auto] grid-rows-[auto_1fr] gap-4 px-4 pb-4">
        <h2 className="col-span-3 text-xl font-medium">Opções de registro</h2>
        
        <Select name="years" value={localYears} onValueChange={handleYearsChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {registerOptions.length === 0 ? (
              <SelectItem value="1">1 ano</SelectItem>
            ) : (
              registerOptions.map((option) => (
                <SelectItem key={option.duration} value={option.duration.toString()}>
                  {option.duration} ano{option.duration > 1 ? "s" : ""}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <form action={async (formData) => {
          const res = await createDomainInvoice(formData);
          if (res.error) {
            toast.error(res.error);
            return;
          }
          router.push(`/checkout/${res.invoiceId}`);
        }}>
          <input type="hidden" name="domain" value={domain} />
          <input type="hidden" name="years" value={localYears} />
          <input type="hidden" name="whoisguard" value="on" />
          <Button type="submit" variant="action" isLoading={isConfirming} disabled={isConfirming}>
            Registrar domínio
          </Button>
        </form>
      </div>
      
      {/* Informações de serviços gratuitos */}
      <div className="bg-green-50 p-4 dark:bg-green-900/10 border-t border-green-100 dark:border-green-900/20">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <p className="flex items-center whitespace-nowrap text-sm font-medium text-green-700 dark:text-green-400">
            <Check className="mr-1 h-4 w-4 shrink-0" />
            Domínio inclui serviços gratuitos:
          </p>
          <ul className="flex w-full flex-nowrap items-center gap-2">
            <li className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-800/30 dark:text-green-400">
              Administração de DNS
            </li>
            <li className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-800/30 dark:text-green-400">
              Encaminhamento de email
            </li>
            <li className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-800/30 dark:text-green-400">
              Proteção de Privacidade
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
