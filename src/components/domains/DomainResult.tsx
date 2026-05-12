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
import { Skeleton } from "../ui/skeleton";
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
import { DomainPriceSelector } from "./DomainPriceSelector";
import { getUser } from "@/lib/auth";

export async function DomainResult({
  searchParams,
}: {
  searchParams: DomainPageParams;
}) {
  const domain = searchParams.domain?.trim();
  if (!domain) {
    return null;
  }

  const [domainData, user] = await Promise.all([
    getDomainData(domain),
    getUser(),
  ]);

  const isAlreadyOwned = user.organization.domains.some(
    (d) => d.domain.toLowerCase() === domain.toLowerCase()
  );

  const selectedYears = searchParams.years ? parseInt(searchParams.years, 10) : 1;

  let price = (domainData?.domain?.multiYearPricesBRL && domainData.domain.multiYearPricesBRL[selectedYears]) 
    ? domainData.domain.multiYearPricesBRL[selectedYears]
    : (domainData?.domain?.priceBRL ? domainData.domain.priceBRL * selectedYears : undefined);

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
    available: availableFromApi,
    domain: { domain: fullDomain, renewBRL, isPremium },
  } = domainData;

  const available = availableFromApi && !isAlreadyOwned;

  if (searchParams.whoisguard) {
    price += 3;
  }

  const tld = fullDomain.split(".").pop() ?? "";
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

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-white/5 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-black text-white uppercase tracking-tight">Resultado da Busca: {fullDomain}</CardTitle>
            <CardDescription className="text-slate-400 font-medium">
              {available
                ? "Este domínio está disponível para registro!"
                : isAlreadyOwned
                  ? "Este domínio já está registrado em sua conta."
                  : "Este domínio não está disponível para registro."}
            </CardDescription>
          </div>
          {available ? (
            <div className="bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
          ) : (
            <div className="bg-rose-500/10 p-2 rounded-xl border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <XCircle className="h-6 w-6 text-rose-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter">{fullDomain}</h3>
              {available ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.2em]">Disponível</p>
                </div>
              ) : isAlreadyOwned ? (
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <p className="text-[11px] font-black text-sky-400 uppercase tracking-[0.2em]">Sua conta</p>
                </div>
              ) : (
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <p className="text-[11px] font-black text-rose-400 uppercase tracking-[0.2em]">Indisponível</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isPremium && available ? (
          <div className="mb-8 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <p className="text-xs font-bold text-amber-500/90 uppercase tracking-wider">
              Domínio Premium: O preço de registro é {toBrl(price!)}.
            </p>
          </div>
        ) : null}

        {available ? (
          <div className="mt-4">
            <DomainPriceSelector 
              domain={fullDomain}
              defaultYears={selectedYears.toString()}
              whoisguard={searchParams.whoisguard ?? "off"}
              registerOptions={registerOptions}
              isConfirming={!!searchParams.confirm}
              price={price}
              renewBRL={renewBRL}
              multiYearPricesBRL={domainData.domain.multiYearPricesBRL}
              isPremium={isPremium}
            />
          </div>
        ) : (
          <div className="border-t border-white/5 pt-6 mt-6">
            <DomainUnavailable domainData={domainData} isAlreadyOwned={isAlreadyOwned} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DomainUnavailable({ domainData, isAlreadyOwned }: { domainData: DomainData; isAlreadyOwned: boolean }) {
  if (isAlreadyOwned) {
    return (
      <div className="flex items-center justify-end gap-2 border-t p-4">
        <Button variant="outline" disabled={true}>
          <Check className="mr-2 h-4 w-4 text-green-500" />
          Já registrado em sua conta
        </Button>
      </div>
    );
  }

  return (
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
