"use client";

import { AlertCircle, Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, useEffect } from "react";
import { changeSelectedDomain } from "@/app/actions";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { OrganizationDomain } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

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
      <Globe className="hidden h-4 w-4 text-muted-foreground md:block" />
      <Select onValueChange={onValueChange} value={selectedDomain?.domain}>
        <SelectTrigger
          className="h-9 w-fit border-border bg-card text-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:w-[280px]"
          id="domainName"
        >
          <div className="flex flex-1 items-center gap-2">
            <SelectValue
              className="text-sm"
              placeholder="Selecione um domínio"
            />
          </div>
        </SelectTrigger>
        <SelectContent className="w-[280px]">
          {domains.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              <AlertCircle className="mx-auto mb-2 h-4 w-4" />
              Nenhum domínio encontrado
            </div>
          ) : (
            domains.map(domain => (
              <SelectItem
                className="cursor-pointer"
                disabled={!domain.active}
                key={domain.id}
                value={domain.domain}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="font-medium">{domain.domain}</span>
                  <Badge
                    className={cn(
                      "ml-2 text-xs",
                      domain.active
                        ? "bg-green-500/10 text-green-700"
                        : "bg-yellow-500/10 text-yellow-700"
                    )}
                    variant={domain.active ? "default" : "secondary"}
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
