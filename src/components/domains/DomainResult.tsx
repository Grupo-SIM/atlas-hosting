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
    <Card>
      <CardHeader>
        <CardTitle>Resultado da Busca: {fullDomain}</CardTitle>
        <CardDescription>
          {available
            ? "Este domínio está disponível para registro!"
            : isAlreadyOwned
              ? "Este domínio já está registrado em sua conta."
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
              <h3 className="text-lg font-semibold">{fullDomain}</h3>
              {available ? (
                <p className="text-sm text-muted-foreground">
                  Este domínio está disponível para registro
                </p>
              ) : isAlreadyOwned ? (
                <p className="text-sm text-green-600 dark:text-green-400">Este domínio já pertence à sua conta.</p>
              ) : (
                <p className="text-sm text-muted-foreground">Este domínio já está registrado.</p>
              )}
            </div>
          </div>
        </div>

        {isPremium && available ? (
          <div className="mt-4 flex items-center gap-2 text-amber-500">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm">
              Este é um domínio premium. O preço de registro é {toBrl(price!)}.
            </p>
          </div>
        ) : null}
        {available ? (
          <>
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
          </>
        ) : (
          <DomainUnavailable domainData={domainData} isAlreadyOwned={isAlreadyOwned} />
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
