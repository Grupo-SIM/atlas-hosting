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
          className="w-[230px] text-foreground relative !grid grid-cols-[1fr_auto] items-center"
        >
          <SelectValue
            className="text-center w-full"
            placeholder={isLoading ? "" : "Selecione um domínio"}
          />
        </SelectTrigger>
        <SelectContent>
          {domains.map((domain) => (
            <SelectItem disabled={!domain.active} key={domain.id} value={domain.domain}>
              {domain.domain}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export interface DomainSelectorProps {
  selectedDomain?: OrganizationDomain;
  domains: OrganizationDomain[];
}
