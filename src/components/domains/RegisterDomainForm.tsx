import type {
  DomainData,
  DomainPageParams,
} from "@/app/(auth)/domains/[action]/types";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import Form from "next/form";

export default function RegisterDomainForm({
  domainData,
}: RegisterDomainButtonProps) {
  // const [_state, doCreateInvoice, isPending] = useActionState(
  //   createDomainInvoice,
  //   {
  //     status: "idle" as "error" | "success" | "idle",
  //     message: "",
  //   }
  // );

  // const onSubmit = useCallback(
  //   async (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();

  //     startTransition(() => {
  //       doCreateInvoice(domainData.domain.domain);
  //     });
  //   },
  //   [doCreateInvoice, domainData]
  // );

  return (
    <Form action="/domain/register" className="flex items-center gap-2">
      <input
        type="hidden"
        name="domain"
        value={domainData.domain.domain}
        readOnly={true}
      />
      <input type="hidden" name="confirm" value="true" readOnly={true} />
      <Button
        // isLoading={isPending}
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
