"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DomainListItem } from "@/lib/server/apis/namecheap/types";
import { startTransition, useActionState } from "react";
import { changeSelectedDomain } from "@/app/actions";
import { cn } from "@/lib/utils";
import clsx from "clsx";
import Skeleton from "react-loading-skeleton";

export default function DomainSelector({
  domains,
  selectedDomain,
}: DomainSelectorProps) {
  const [state, setSelectedDomain, isLoading] = useActionState(
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
      <Select value={selectedDomain} onValueChange={onValueChange}>
        <SelectTrigger
          id="domainName"
          className={cn(
            { "opacity-0": isLoading },
            "w-[300px] text-foreground"
          )}
        >
          <SelectValue placeholder="Selecione um domínio" />
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
  selectedDomain?: string;
  domains: (DomainListItem & { inPlesk: boolean })[];
}
