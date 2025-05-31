"use client";

import { changeSelectedDomain } from "@/app/actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrganizationDomain } from "@/lib/db/schema";
import type { DomainListItem, DomainsGetInfoCleanedResponse } from "@/lib/server/apis/namecheap/types";
import { startTransition, useActionState } from "react";

export default function DomainSelector({
  domains,
  selectedDomain,
}: DomainSelectorProps) {
  const [_state, setSelectedDomain, isLoading] = useActionState(
    changeSelectedDomain,
    { message: "", status: "idle" }
  );

  const onValueChange = (domain: string) => {
    startTransition(() => {
      setSelectedDomain(domain);
    });
  };

  return (
    <div className="relative cursor-pointer">
      <Select value={selectedDomain?.domain} onValueChange={onValueChange}>
        <SelectTrigger
          id="domainName"
          className="w-[300px] text-foreground relative"
        >
          <SelectValue
            // className={cn({ "opacity-0": isLoading })}
            placeholder={isLoading ? "" : "Selecione um domínio"}
          />
        </SelectTrigger>
        <SelectContent>
          {domains.map((domain) => (
            <SelectItem key={domain.ID} value={domain.DomainName}>
              {domain.DomainName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export interface DomainSelectorProps {
  selectedDomain?: OrganizationDomain;
  domains: (DomainsGetInfoCleanedResponse & { inPlesk: boolean })[];
}
