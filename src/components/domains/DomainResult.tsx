import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getDomainPricing } from "@/lib/server/apis/namecheap/index";
import { toBrl } from "@/lib/utils";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { AlertCircle, Check, CheckCircle2, X, XCircle } from "lucide-react";
import { Suspense } from "react";
import { FaCircleQuestion } from "react-icons/fa6";
import Skeleton from "react-loading-skeleton";
import { Checkbox } from "../ui/checkbox";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import Form from "next/form";
import { createDomainInvoice } from "@/app/actions";
import { getDomainData } from "@/app/(auth)/domain/utils";
import type {
  DomainData,
  DomainPageParams,
} from "@/app/(auth)/domain/types";

export async function DomainResult({
  searchParams,
}: {
  searchParams: DomainPageParams;
}) {
  const { domain } = searchParams;

  const domainData = await getDomainData(domain as string);

  const domainPricing = await getDomainPricing(
    domain?.split(".").pop() as string
  ).catch(() => null);

  let price = domainPricing?.Prices?.find(
    (p) => p.DurationType === "YEAR" && p.Duration === 1
  )?.Price;

  if (!domainData?.domain || !price) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultado da Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível verificar a disponibilidade do domínio &quot;
            {searchParams.domain}&quot;. Tente novamente ou verifique o termo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const {
    available,
    domain: { renewBRL, isPremium },
  } = domainData;

  if (searchParams.whoisguard) {
    price += 3;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resultado da Busca: {domain}</CardTitle>
        <CardDescription>
          {available
            ? "Este domínio está disponível para registro!"
            : "Este domínio não está disponível para registro."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {available ? (
              <CheckCircle2 className="h-8 w-8 text-green-500 flex-shrink-0" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{domain}</h3>
              {available ? (
                <p className="text-sm text-muted-foreground">
                  Este domínio está disponível para registro
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Este domínio já está registrado.
                </p>
              )}
            </div>
          </div>

          {searchParams.domain && searchParams.years && (
            <div className="grid grid-cols-[1fr_auto_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-1 grid-flow-col">
              <div className="text-xs text-muted-foreground">Primeiro ano</div>
              <h2 className="font-semibold text-2xl m-0">{toBrl(price)}</h2>
              <Separator
                orientation="vertical"
                className="row-span-2 h-3/4 my-auto"
              />
              <div className="text-xs text-muted-foreground text-right">
                Renovação
              </div>
              <span className="text-muted-foreground flex items-center">
                {toBrl(renewBRL)}
              </span>
            </div>
          )}
        </div>

        {isPremium && available && (
          <div className="mt-4 flex items-center gap-2 text-amber-500">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Este é um domínio premium. O preço de registro é {toBrl(price)}.
            </p>
          </div>
        )}
      </CardContent>

      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton height={40} />
          </div>
        }
      >
        {available ? (
          <DomainAvailable
            domainData={domainData}
            searchParams={searchParams as Partial<DomainPageParams>}
          />
        ) : (
          <DomainUnavailable domainData={domainData} />
        )}
      </Suspense>
    </Card>
  );
}

async function DomainUnavailable({ domainData }: { domainData: DomainData }) {
  return (
    !domainData?.available && (
      <div className="p-4 border-t flex items-center justify-end gap-2">
        <Button variant="outline" disabled={true}>
          <X className="h-4 w-4 mr-2" />
          Indisponível
        </Button>
        <Button variant="link" className="text-sm" asChild={true}>
          <a
            href={`https://www.whois.com/whois/${domainData?.domain?.domain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Tentar pesquisa WHOIS
          </a>
        </Button>
      </div>
    )
  );
}

async function DomainAvailable({
  domainData,
  searchParams,
}: { domainData: DomainData; searchParams: Partial<DomainPageParams> }) {
  const domain = domainData
    ? await getDomainPricing(
        domainData?.domain.domain.split(".").pop() as string
      )
    : null;

  const registerOptions = (domain?.Prices ?? [])
    .filter((domain) => domain.DurationType === "YEAR")
    .map((domain) => ({
      duration: domain.Duration,
      price: domain.YourPrice,
    }));

  return (
    domainData?.available &&
    domainData.domain && (
      <div>
        <Separator className="mb-4 w-full" />
        <Form
          action=""
          className="grid grid-rows-[auto_1fr] grid-cols-[1fr_1fr_auto] gap-4 px-4 pb-4"
        >
          <h2 className="col-span-3 font-medium text-xl">Opções de registro</h2>
          <Select
            name="years"
            defaultValue={
              searchParams.years ?? registerOptions[0].duration.toString()
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {registerOptions.map((option) => (
                <SelectItem
                  key={option.duration}
                  value={option.duration.toString()}
                >
                  {option.duration} ano{option.duration > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-2 mr-auto">
                  <Checkbox
                    name="whoisguard"
                    defaultChecked={searchParams.whoisguard === "on"}
                  />
                  <Label
                    htmlFor="whoisguard"
                    className="text-sm flex items-center space-x-2"
                  >
                    <span>Proteção de Privacidade</span>
                    <FaCircleQuestion className="h-4 w-4 text-muted-foreground" />
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent align="start" side="top">
                <div className="text-sm max-w-sm text-center text-foreground/90 mr-auto space-y-1 p-2">
                  <div>
                    Protege suas informações pessoais de serem exibidas
                    publicamente ao buscar seu domínio.
                  </div>
                  <div className="text-muted-foreground text-xs">
                    *Adicional de {toBrl(3)}
                  </div>
                </div>
                <TooltipArrow className="fill-border" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input type="hidden" name="domain" value={domainData.domain.domain} />
          <Button
            type="submit"
            variant={searchParams.years ? "secondary" : "default"}
          >
            {searchParams.years ? "Alterar opções" : "Continuar"}
          </Button>
        </Form>
        {searchParams.years && (
          <Form action="">
            <Separator className="m-0 w-full" />
            <div className="animate-accordion-down animate-in duration-300 ease-out">
              <div className="p-4 bg-green-50 dark:bg-green-900/10">
                <div className="flex items-center gap-2 justify-between w-full">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <p className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center whitespace-nowrap">
                      <Check className="h-4 w-4 mr-1 flex-shrink-0" />
                      Domínio inclui serviços gratuitos:
                    </p>
                    <ul className="flex flex-nowrap gap-2 items-center justify-end w-full">
                      <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        Administração de DNS
                      </li>
                      <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">
                        Encaminhamento de email
                      </li>
                    </ul>
                  </div>
                  <div className="flex-1 flex items-center justify-end gap-2 mt-2 sm:mt-0">
                    <div className="flex justify-end w-full">
                      <input
                        type="hidden"
                        name="domain"
                        value={domainData.domain.domain}
                      />
                      <input
                        type="hidden"
                        name="years"
                        value={searchParams.years}
                      />
                      <input
                        type="hidden"
                        name="whoisguard"
                        value={searchParams.whoisguard ?? "off"}
                      />
                      <input type="hidden" name="confirm" value="true" />
                      <Button
                        disabled={!domainData || !!searchParams.confirm}
                        isLoading={!!searchParams.confirm}
                        className="w-45"
                        type="submit"
                        variant="action"
                      >
                        Registrar domínio
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}
      </div>
    )
  );
}

export const adminNamecheapDetails = {
  Address1: "Beco Neuteu Maia",
  City: "Rio Branco",
  Country: "BR",
  EmailAddress: "lucasgarrafielo@gmail.com",
  FirstName: "Lucas",
  LastName: "Garrafielo",
  Phone: process.env.ADMIN_PHONENUMBER as string,
  PostalCode: "69900430",
  StateProvince: "AC",
};
