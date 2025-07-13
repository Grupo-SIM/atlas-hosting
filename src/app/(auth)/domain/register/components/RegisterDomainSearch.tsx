import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Form from "next/form";

export default function RegisterDomainSearch({ domain }: DomainPageParams) {
  return (
    <Form action="/domain?tab=register" className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="search"
          name="domain"
          defaultValue={domain}
          placeholder="Digite o nome do domínio..."
          className="flex-1"
        />
        <Button type="submit" className="sm:w-auto w-full">
          Buscar domínios
        </Button>
      </div>
    </Form>
  );
}

export interface DomainPageParams {
  domain?: string;
}
