"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DomainListItem } from "@/lib/server/apis/namecheap/types";
import { startTransition, useActionState } from "react";
import { changeSelectedDomain } from "@/app/actions";
import { cn } from "@/lib/utils";

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
    <div className="relative">
      <Select value={selectedDomain?.Name} onValueChange={onValueChange}>
        <SelectTrigger id="domainName" className="w-[300px] text-foreground relative">
          <SelectValue
            // className={cn({ "opacity-0": isLoading })}
            placeholder={isLoading ? "": "Selecione um domínio"}
          />
        </SelectTrigger>
        <SelectContent>
          {domains.map((domain) => (
            <SelectItem key={domain.ID} value={domain.Name}>
              {domain.Name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export interface DomainSelectorProps {
  selectedDomain?: DomainListItem;
  domains: (DomainListItem & { inPlesk: boolean })[];
}
