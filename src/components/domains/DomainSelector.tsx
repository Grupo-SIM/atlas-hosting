"use client";

import { changeSelectedDomain } from "@/app/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrganizationDomain } from "@/lib/db/schema";
import { startTransition, useActionState, useEffect } from "react";
import { Globe, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function DomainSelector({
  domains,
  selectedDomain,
}: DomainSelectorProps) {
  const router = useRouter();
  const [state, setSelectedDomain, isLoading] = useActionState(
    changeSelectedDomain,
    { message: "", status: "idle" }
  );

  useEffect(() => {
    if (state.status === "success") {
      router.refresh();
    }
  }, [state, router]);

  const onValueChange = (domain: string) => {
    startTransition(() => {
      setSelectedDomain(domain);
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <Globe className="h-4 w-4 text-muted-foreground" />
        <Skeleton className="h-9 w-[280px]" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground hidden md:block" />
      <Select value={selectedDomain?.domain} onValueChange={onValueChange}>
        <SelectTrigger
          id="domainName"
          className="w-fit md:w-[280px] h-9 text-foreground bg-card border-border transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <div className="flex flex-1 items-center gap-2">
            <SelectValue
              placeholder="Selecione um domínio"
              className="text-sm"
            />
          </div>
        </SelectTrigger>
        <SelectContent className="w-[280px]">
          {domains.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mx-auto mb-2" />
              Nenhum domínio encontrado
            </div>
          ) : (
            domains.map((domain) => (
              <SelectItem
                key={domain.id}
                value={domain.domain}
                disabled={!domain.active}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-medium">{domain.domain}</span>
                  <Badge
                    variant={domain.active ? "default" : "secondary"}
                    className={cn(
                      "text-xs ml-2",
                      domain.active
                        ? "bg-green-500/10 text-green-700"
                        : "bg-yellow-500/10 text-yellow-700"
                    )}
                  >
                    {domain.active ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

export interface DomainSelectorProps {
  selectedDomain?: OrganizationDomain;
  domains: OrganizationDomain[];
}
