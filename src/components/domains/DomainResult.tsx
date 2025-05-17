
import { DomainData } from "@/app/(authenticated)/domains/register/page";
import { Button } from "@/components/ui/button";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { invoiceTable } from "@/lib/db/schema";
import currencyConversion from "@/lib/server/apis/currency";
import nameSilo from "@/lib/server/apis/namesilo";
import { toBrl } from "@/lib/utils";
import { endOfTomorrow } from "date-fns";
import { Check, X } from "lucide-react";
import { redirect } from "next/navigation";
import { PropsWithChildren, ReactNode, Suspense } from "react";
import { CgSpinner } from "react-icons/cg";
import Skeleton from "react-loading-skeleton";

export function DomainResult({ searchQuery, domainData }: DomainResultProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-6 bg-muted/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center">
              <Suspense fallback={<CgSpinner className="animate-spin h-4 w-4 mr-2" />}>
                <DomainAvailabilityIcon domainData={domainData} />
              </Suspense>
              <h3 className="text-lg font-semibold">{searchQuery}</h3>
            </div>
            
            <p className="mt-2 text-muted-foreground">
              <Suspense fallback={<Skeleton height="1em" width="8em" />}>
                <DomainAvailabilityLabel domainData={domainData} />
              </Suspense>
            </p>
          </div>
          
          <div className="flex flex-col md:items-end gap-2">
            <Suspense fallback={(
              <>
                <p className="font-semibold text-xl"><Skeleton height="1em" width="6em" /></p>
                <p className="text-xs text-muted-foreground">Renovação: <Skeleton height="1em" width="6em" /></p>
              </>
            )}>
              <DomainPricing domainData={domainData} />
            </Suspense>
            
            <Suspense fallback={<></>}>
              <DomainUnavailable domainData={domainData} />
            </Suspense>
          </div>
        </div>
      </div>
      
      <Suspense fallback={(
        <DomainAvailableTemplate text1={<Skeleton height="1em" width="8em" />}
          text2={<Skeleton height="1em" width="6em" />}
          text3={<Skeleton height="1em" width="6em" />}
          text4={<Skeleton height="1em" width="6em" />}
        >
          <div className="flex-1 flex items-center justify-end">
            <Skeleton height="2.5em" width="8em" />
          </div>
        </DomainAvailableTemplate>
      )}>
        <DomainAvailable domainData={domainData} />
      </Suspense>
    </div>
  );
}

async function DomainAvailabilityIcon({ domainData }: { domainData: Promise<DomainData> }) {
  const data = await domainData;

  console.log(JSON.stringify(data));

  return (data?.available ? (
    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 dark:bg-green-900/30 mr-3">
      <Check className="h-4 w-4" />
    </div>
  ) : (
    <div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 dark:bg-red-900/30 mr-3">
      <X className="h-4 w-4" />
    </div>
  ));
}

async function DomainAvailabilityLabel({ domainData }: { domainData: Promise<DomainData> }) {
  const data = await domainData;

  return data?.available 
    ? "Este domínio está disponível para registro!"
    : "Este domínio está indisponível para registro.";
}

async function DomainPricing({ domainData }: { domainData: Promise<DomainData> }) {
  const data = await domainData;

  const price = data?.available ? data.domain?.price : null;
  const renewPrice = data?.available ? data.domain?.renew : null;

  const priceString = price ? toBrl(price) : null;

  const renewPriceString = renewPrice ? toBrl(renewPrice) : null;

  return data?.available && (
    <>
      <p className="font-semibold text-xl">{priceString}</p>
      <p className="text-xs text-muted-foreground">Renovação: {renewPriceString}</p>
    </>
  );
}

async function DomainUnavailable({ domainData }: { domainData: Promise<DomainData> }) {
  const data = await domainData;

  return !data?.available && (
    <>
      <Button variant="outline" disabled>
        <X className="h-4 w-4 mr-2" />
        Indisponível
      </Button>
      <Button variant="link" className="text-sm">
        Tentar pesquisa WHOIS
      </Button>
    </>
  );
}

async function DomainAvailable({ domainData }: { domainData: Promise<DomainData> }) {
  const data = await domainData;

  async function buyDomain(data: FormData) {
    "use server";

    const domain = data.get("domain") as string;

    if (!domain) {
      throw new Error("Domain is required");
    }

    const result = await nameSilo.checkDomainAvailability(domain);

    if (!result || !result.available) {
      throw new Error("Error checking domain availability");
    }

    const price = await currencyConversion.convert({
      from: "usd",
      to: "brl",
      amount: result.available.domain.price,
    });

    const user = await getUser();

    if (!user) {
      throw new Error("User not authenticated");
    }

    const invoices = await db.insert(invoiceTable).values({
      type: "domain",
      amount: price,
      reference: domain,
      dueDate: endOfTomorrow(),
      status: "pending",
      userId: user.id,
    }).returning({ id: invoiceTable.id });

    const invoice = invoices[0];

    redirect("/checkout/" + invoice.id);
  }

  return data?.available && (
    <DomainAvailableTemplate
      text1="Domínio inclui serviços gratuitos:"
      text2="Administração de DNS"
      text3="Proteção de privacidade"
      text4="Encaminhamento de Email"
    >
      <form action={buyDomain} className="flex items-center justify-end">
        <input
          type="hidden"
          name="domain"
          value={data.domain?.domain}
          readOnly
        />
        <Button variant="action" className="w-auto" type="submit">
              Registrar domínio
        </Button>
      </form>
    </DomainAvailableTemplate>
  );
}

function DomainAvailableTemplate({ text1, text2, text3, text4, children }: PropsWithChildren<{ 
  text1: ReactNode;
  text2: ReactNode;
  text3: ReactNode;
  text4: ReactNode;
 }>) {
  return (
    <div className="p-4 bg-green-50 dark:bg-green-900/10 border-t border-green-100 dark:border-green-900/20">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <p className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center">
          <Check className="h-4 w-4 mr-1 flex-shrink-0" />
          {text1}
        </p>
        <ul className="flex flex-wrap gap-2 items-center">
          <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">{text2}
          </li>
          <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">{text3}</li>
          <li className="text-xs bg-green-100 dark:bg-green-800/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">{text4}</li>
        </ul>
        <div className="flex-1 mt-2 sm:mt-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export interface DomainResultProps {
  searchQuery: string;
  domainData: Promise<DomainData>;
}
