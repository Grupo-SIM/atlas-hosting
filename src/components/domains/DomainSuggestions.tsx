import { DomainData } from "@/app/(auth)/(dashboard)/domains/register/page";
import { Button } from "@/components/ui/button";
import { toBrl } from "@/lib/utils";
import Link from "next/link";

interface DomainSuggestionsProps {
  searchQuery: string;
  domainData: Promise<DomainData>;
}

export async function DomainSuggestions({ searchQuery, domainData }: DomainSuggestionsProps) {
  const data = await domainData;

  return (
    <div>
      <h3 className="text-lg font-medium mb-4">Sugestões de domínio</h3>
      <div className="grid gap-4">
        {data && data.extraDomains.map((domain, index) => {
          const tld = domain.domain.split(".").pop() || "";
          const price = domain.price;

          const priceString = price ? toBrl(price) : null;

          return (
            <Link
              key={index}
              href={`?search=${domain.domain}`}
              className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-primary/50 hover:bg-muted/50 transition-colors"
            >
              <div>
                <p className="font-medium">{domain.domain}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Includes free privacy protection and DNS management
                </p>
              </div>
              
              <div className="flex items-center gap-4 self-end sm:self-auto">
                <div className="text-right">
                  <p className="font-semibold">{priceString}</p>
                  <p className="text-xs text-muted-foreground">Renovação: {toBrl(domain.renew)}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

