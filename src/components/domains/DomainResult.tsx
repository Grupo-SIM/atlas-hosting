import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import { eq } from "drizzle-orm";
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
import { getDomainData } from "@/app/(auth)/domain/utils";
import type { DomainData, DomainPageParams } from "@/app/(auth)/domain/types";

export async function DomainResult({
  searchParams,
}: {
  searchParams: DomainPageParams;
}) {
  const domain = searchParams.domain?.trim();
  if (!domain) {
    return null;
  }

  const domainData = await getDomainData(domain);

  const selectedYears = searchParams.years ? parseInt(searchParams.years, 10) : 1;

  let price = domainData?.domain?.priceBRL
    ? domainData.domain.priceBRL * selectedYears
    : undefined;

  if (!domainData?.domain || !price) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resultado da Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Não foi possível verificar a disponibilidade do domínio &quot;{domain}&quot;. Tente
            novamente ou verifique o termo.
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
              <CheckCircle2 className="h-8 w-8 shrink-0 text-green-500" />
            ) : (
              <XCircle className="h-8 w-8 shrink-0 text-red-500" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{domain}</h3>
              {available ? (
                <p className="text-sm text-muted-foreground">
                  Este domínio está disponível para registro
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Este domínio já está registrado.</p>
              )}
            </div>
          </div>

          {searchParams.domain && available && price ? (
            <div className="grid grid-flow-col grid-cols-[1fr_auto_auto] grid-rows-[auto_1fr] gap-x-3 gap-y-1">
              <div className="text-xs text-muted-foreground">
                {selectedYears === 1 ? "Primeiro ano" : `${selectedYears} anos`}
              </div>
              <h2 className="m-0 text-2xl font-semibold">{toBrl(price)}</h2>
              <Separator orientation="vertical" className="row-span-2 my-auto h-3/4" />
              <div className="text-right text-xs text-muted-foreground">Renovação</div>
              <span className="flex items-center text-muted-foreground">{toBrl(renewBRL)}</span>
            </div>
          ) : null}
        </div>

        {isPremium && available ? (
          <div className="mt-4 flex items-center gap-2 text-amber-500">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Este é um domínio premium. O preço de registro é {toBrl(price!)}.
            </p>
          </div>
        ) : null}
      </CardContent>

      <Suspense
        fallback={
          <div className="p-4">
            <Skeleton height={40} />
          </div>
        }
      >
        {available ? (
          <DomainAvailable domainData={domainData} searchParams={searchParams} />
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
      <div className="flex items-center justify-end gap-2 border-t p-4">
        <Button variant="outline" disabled={true}>
          <X className="mr-2 h-4 w-4" />
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
}: {
  domainData: DomainData;
  searchParams: DomainPageParams;
}) {
  const tld = domainData?.domain?.domain?.split(".").pop() ?? "";
  const tldRow = tld
    ? await db.query.pgDomainPricingCache.findFirst({
        where: eq(pgDomainPricingCache.tld, tld),
        columns: { minRegisterYears: true, maxRegisterYears: true },
      })
    : null;

  const minYear = tldRow?.minRegisterYears ?? 1;
  const maxYear = tldRow?.maxRegisterYears ?? 10;
  const registerOptions = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => ({ duration: minYear + i })
  );

  const defaultYears =
    searchParams.years ??
    (registerOptions[0] ? registerOptions[0].duration.toString() : "1");

  return (
    domainData?.available &&
    domainData.domain && (
      <div>
        <Separator className="mb-4 w-full" />
        <Form
          action=""
          className="grid grid-cols-[1fr_1fr_auto] grid-rows-[auto_1fr] gap-4 px-4 pb-4"
        >
          <h2 className="col-span-3 text-xl font-medium">Opções de registro</h2>
          <Select name="years" defaultValue={defaultYears}>
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
          <TooltipProvider>
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <div className="mr-auto flex items-center space-x-2">
                  <Checkbox name="whoisguard" defaultChecked={searchParams.whoisguard === "on"} />
                  <Label htmlFor="whoisguard" className="flex items-center space-x-2 text-sm">
                    <span>Proteção de Privacidade</span>
                    <FaCircleQuestion className="h-4 w-4 text-muted-foreground" />
                  </Label>
                </div>
              </TooltipTrigger>
              <TooltipContent align="start" side="top">
                <div className="mr-auto max-w-sm space-y-1 p-2 text-center text-sm text-foreground/90">
                  <div>
                    Protege suas informações pessoais de serem exibidas publicamente ao buscar seu
                    domínio.
                  </div>
                  <div className="text-xs text-muted-foreground">
                    *Opcional e sem custo adicional neste registro
                  </div>
                </div>
                <TooltipArrow className="fill-border" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <input type="hidden" name="domain" value={domainData.domain.domain} />
          <Button type="submit" variant={searchParams.years ? "secondary" : "default"}>
            {searchParams.years ? "Alterar opções" : "Continuar"}
          </Button>
        </Form>
        {searchParams.years ? (
          <Form action="">
            <Separator className="m-0 w-full" />
            <div className="animate-in duration-300 ease-out animate-accordion-down">
              <div className="bg-green-50 p-4 dark:bg-green-900/10">
                <div className="flex w-full items-center justify-between gap-2">
                  <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
                    <p className="flex items-center whitespace-nowrap text-sm font-medium text-green-700 dark:text-green-400">
                      <Check className="mr-1 h-4 w-4 shrink-0" />
                      Domínio inclui serviços gratuitos:
                    </p>
                    <ul className="flex w-full flex-nowrap items-center justify-end gap-2">
                      <li className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-800/30 dark:text-green-400">
                        Administração de DNS
                      </li>
                      <li className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 dark:bg-green-800/30 dark:text-green-400">
                        Encaminhamento de email
                      </li>
                    </ul>
                  </div>
                  <div className="mt-2 flex flex-1 items-center justify-end gap-2 sm:mt-0">
                    <div className="flex w-full justify-end">
                      <input type="hidden" name="domain" value={domainData.domain.domain} />
                      <input type="hidden" name="years" value={searchParams.years} />
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
        ) : null}
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
