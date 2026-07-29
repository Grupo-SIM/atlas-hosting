"use client";

import { Check } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { createDomainInvoice } from "@/app/actions";
import { toBrl } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";

interface DomainPriceSelectorProps {
  domain: string;
  defaultYears: string;
  whoisguard: string;
  registerOptions: { duration: number }[];
  isConfirming: boolean;
  price: number;
  renewBRL: number;
  multiYearPricesBRL?: Record<number, number>;
  isPremium?: boolean;
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
  isPremium,
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

  const selectedYears = isPremium ? 1 : Number.parseInt(localYears, 10);

  const currentPrice =
    isPremium || !multiYearPricesBRL || !multiYearPricesBRL[selectedYears]
      ? price
      : multiYearPricesBRL[selectedYears];

  return (
    <div>
      {/* Preço e Status (Ajustado levemente para a esquerda) */}
      <div className="mb-6 flex items-center justify-between gap-4 px-4 pr-10">
        <div className="flex-1" />
        <div className="grid grid-flow-col grid-cols-[auto_auto_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-1">
          <div className="text-slate-500 text-xs dark:text-muted-foreground">
            {selectedYears === 1 ? "Primeiro ano" : `${selectedYears} anos`}
          </div>
          <h2 className="m-0 font-black text-2xl text-slate-900 uppercase tracking-tighter dark:text-white">
            {toBrl(currentPrice)}
          </h2>
          <Separator
            className="row-span-2 my-auto h-3/4 bg-slate-200 dark:bg-white/10"
            orientation="vertical"
          />
          <div className="text-right text-slate-500 text-xs dark:text-muted-foreground">
            Renovação
          </div>
          <span className="flex items-center font-medium text-slate-600 dark:text-muted-foreground">
            {toBrl(renewBRL)}
          </span>
        </div>
      </div>

      <Separator className="mb-6 w-full bg-slate-100 dark:bg-white/5" />
      <div className="grid grid-cols-[1fr_1fr_auto] grid-rows-[auto_1fr] gap-x-6 gap-y-4 px-4 pb-4">
        <h2 className="col-span-3 font-black text-slate-900 text-xl uppercase tracking-tight dark:text-white">
          Opções de registro
        </h2>

        <Select
          disabled={isPremium}
          name="years"
          onValueChange={handleYearsChange}
          value={isPremium ? "1" : localYears}
        >
          <SelectTrigger
            className={isPremium ? "cursor-not-allowed opacity-50" : ""}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {isPremium ? (
              <SelectItem value="1">1 ano (Máximo para Premium)</SelectItem>
            ) : registerOptions.length === 0 ? (
              <SelectItem value="1">1 ano</SelectItem>
            ) : (
              registerOptions.map(option => (
                <SelectItem
                  key={option.duration}
                  value={option.duration.toString()}
                >
                  {option.duration} ano{option.duration > 1 ? "s" : ""}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        <form
          action={async formData => {
            const res = await createDomainInvoice(formData);
            if (res.error) {
              toast.error(res.error);
              return;
            }
            router.push(`/checkout/${res.invoiceId}`);
          }}
        >
          <input name="domain" type="hidden" value={domain} />
          <input name="years" type="hidden" value={localYears} />
          <input name="whoisguard" type="hidden" value="on" />
          <Button
            disabled={isConfirming}
            isLoading={isConfirming}
            type="submit"
            variant="action"
          >
            Registrar domínio
          </Button>
        </form>
      </div>

      {/* Informações de serviços gratuitos */}
      <div className="border-green-100 border-t bg-green-50 p-4 dark:border-green-900/20 dark:bg-green-900/10">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
          <p className="flex items-center whitespace-nowrap font-medium text-green-700 text-sm dark:text-green-400">
            <Check className="mr-1 h-4 w-4 shrink-0" />
            Domínio inclui serviços gratuitos:
          </p>
          <ul className="flex w-full flex-nowrap items-center gap-2">
            <li className="rounded bg-green-100 px-2 py-1 text-green-700 text-xs dark:bg-green-800/30 dark:text-green-400">
              Administração de DNS
            </li>
            <li className="rounded bg-green-100 px-2 py-1 text-green-700 text-xs dark:bg-green-800/30 dark:text-green-400">
              Proteção de Privacidade
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
