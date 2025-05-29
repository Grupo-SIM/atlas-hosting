"use client";

import type { DomainData } from "@/app/(authenticated)/(dashboard)/domains/register/page";
import { createDomainInvoice } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { startTransition, useActionState, useCallback } from "react";

export default function RegisterDomainForm({
  domainData,
}: RegisterDomainButtonProps) {
  const [_state, doCreateInvoice, isPending] = useActionState(
    createDomainInvoice,
    {
      status: "idle" as "error" | "success" | "idle",
      message: "",
    }
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      startTransition(() => {
        doCreateInvoice(domainData.domain.domain);
      });
    },
    [doCreateInvoice, domainData]
  );

  return (
    <form onSubmit={onSubmit} className="flex items-center gap-2">
      <input
        type="hidden"
        name="domainName"
        value={domainData.domain.domain}
        readOnly={true}
      />
      <input
        type="hidden"
        name="isPremium"
        value={domainData.domain.isPremium.toString()}
        readOnly={true}
      />
      <Button
        isLoading={isPending}
        disabled={!domainData}
        variant="action"
        className="w-40"
        type="submit"
      >
        Registrar domínio
      </Button>
    </form>
  );
}

export interface RegisterDomainButtonProps {
  domainData: Exclude<DomainData, null>;
}
