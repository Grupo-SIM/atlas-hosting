import { eq } from "drizzle-orm";
import { AlertCircle, Check, CheckCircle2, X, XCircle } from "lucide-react";
import type { DomainData, DomainPageParams } from "@/app/(auth)/domain/types";
import { getDomainData } from "@/app/(auth)/domain/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgDomainPricingCache } from "@/lib/db/schema";
import { toBrl } from "@/lib/utils";
import { DomainPriceSelector } from "./DomainPriceSelector";

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
    d => d.domain.toLowerCase() === domain.toLowerCase()
  );

  const selectedYears = searchParams.years
    ? Number.parseInt(searchParams.years, 10)
    : 1;

  let price = domainData?.domain?.multiYearPricesBRL?.[selectedYears]
    ? domainData.domain.multiYearPricesBRL[selectedYears]
    : domainData?.domain?.priceBRL
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
            Não foi possível verificar a disponibilidade do domínio &quot;
            {domain}&quot;. Tente novamente ou verifique o termo.
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
        columns: { maxRegisterYears: true, minRegisterYears: true },
        where: eq(pgDomainPricingCache.tld, tld),
      })
    : null;

  const minYear = tldRow?.minRegisterYears ?? 1;
  const maxYear = tldRow?.maxRegisterYears ?? 10;
  const registerOptions = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => ({ duration: minYear + i })
  );

  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200 bg-white shadow-2xl backdrop-blur-md dark:border-white/10 dark:bg-white/5">
      <CardHeader className="border-slate-100 border-b pb-6 dark:border-white/5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-black text-slate-900 text-xl uppercase tracking-tight dark:text-white">
              Resultado da Busca: {fullDomain}
            </CardTitle>
            <CardDescription className="font-medium text-slate-500 dark:text-slate-400">
              {available
                ? "Este domínio está disponível para registro!"
                : isAlreadyOwned
                  ? "Este domínio já está registrado em sua conta."
                  : "Este domínio não está disponível para registro."}
            </CardDescription>
          </div>
          {available ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2 shadow-emerald-500/10 shadow-lg">
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            </div>
          ) : (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 shadow-lg shadow-rose-500/10">
              <XCircle className="h-6 w-6 text-rose-400" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <h3 className="font-black text-2xl text-slate-900 uppercase tracking-tighter dark:text-white">
                {fullDomain}
              </h3>
              {available ? (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  <p className="font-black text-[11px] text-emerald-400 uppercase tracking-[0.2em]">
                    Disponível
                  </p>
                </div>
              ) : isAlreadyOwned ? (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                  <p className="font-black text-[11px] text-sky-400 uppercase tracking-[0.2em]">
                    Sua conta
                  </p>
                </div>
              ) : (
                <div className="mt-1 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                  <p className="font-black text-[11px] text-rose-400 uppercase tracking-[0.2em]">
                    Indisponível
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {isPremium && available ? (
          <div className="mb-8 flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500" />
            <p className="font-bold text-amber-500/90 text-xs uppercase tracking-wider">
              Domínio Premium: O preço de registro é {toBrl(price!)}.
            </p>
          </div>
        ) : null}

        {available ? (
          <div className="mt-4">
            <DomainPriceSelector
              defaultYears={selectedYears.toString()}
              domain={fullDomain}
              isConfirming={!!searchParams.confirm}
              isPremium={isPremium}
              multiYearPricesBRL={domainData.domain.multiYearPricesBRL}
              price={price}
              registerOptions={registerOptions}
              renewBRL={renewBRL}
              whoisguard={searchParams.whoisguard ?? "off"}
            />
          </div>
        ) : (
          <div className="mt-6 border-white/5 border-t pt-6">
            <DomainUnavailable
              domainData={domainData}
              isAlreadyOwned={isAlreadyOwned}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function DomainUnavailable({
  domainData,
  isAlreadyOwned,
}: {
  domainData: DomainData;
  isAlreadyOwned: boolean;
}) {
  if (isAlreadyOwned) {
    return (
      <div className="flex items-center justify-end gap-2 border-t p-4">
        <Button disabled={true} variant="outline">
          <Check className="mr-2 h-4 w-4 text-green-500" />
          Já registrado em sua conta
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2 border-t p-4">
      <Button disabled={true} variant="outline">
        <X className="mr-2 h-4 w-4" />
        Indisponível
      </Button>
      <Button asChild={true} className="text-sm" variant="link">
        <a
          href={`https://www.whois.com/whois/${domainData?.domain?.domain}`}
          rel="noopener noreferrer"
          target="_blank"
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
