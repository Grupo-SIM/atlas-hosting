import type { DomainData } from "@/app/(auth)/domains/register/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Form from "next/form";

export default function RegisterDomainForm({
  domainData,
}: RegisterDomainButtonProps) {
  return (
    <Form action="/domains/register" className="flex items-center gap-2">
      <input
        type="hidden"
        name="search"
        value={domainData.domain.domain}
        readOnly={true}
      />
      <input type="hidden" name="confirm" value="true" readOnly={true} />
      <Button
        disabled={!domainData}
        className="w-45 flex gap-2 items-center justify-between"
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
