import { ChevronDown } from "lucide-react";
import Form from "next/form";
import type { DomainData } from "@/app/(auth)/domains/register/types";
import { Button } from "@/components/ui/button";

export default function RegisterDomainForm({
  domainData,
}: RegisterDomainButtonProps) {
  return (
    <Form action="/domains/register" className="flex items-center gap-2">
      <input
        name="search"
        readOnly={true}
        type="hidden"
        value={domainData.domain.domain}
      />
      <input name="confirm" readOnly={true} type="hidden" value="true" />
      <Button
        className="flex w-45 items-center justify-between gap-2"
        disabled={!domainData}
        type="submit"
      >
        <span>Registrar domínio</span>
        <ChevronDown className="min-h-5 min-w-5 text-inherit" />
      </Button>
    </Form>
  );
}

export interface RegisterDomainButtonProps {
  domainData: Exclude<DomainData, null>;
}
