"use client";

import { searchDomains } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { startTransition, useActionState, useCallback } from "react";
import { CgSpinner } from "react-icons/cg";

export default function DomainSearchForm({ searchQuery }: { searchQuery: string }) {
  const [, doSearch, isPending] = useActionState(searchDomains, void 0);

  const onSubmit = useCallback(() => {
    startTransition(() => {
      doSearch(searchQuery);
    });
  }, [doSearch, searchQuery]);

  return (
    <form onSubmit={onSubmit} className="flex flex-row gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="ex: minhaempresa.com"
          className="pl-10"
          name="search"
          defaultValue={searchQuery}
        />
      </div>
      <Button type="submit" size="icon" className="shrink-0" aria-label="Buscar">
        {isPending ? 
          <CgSpinner className="w-4 h-4 animate-spin" />
          : <Search className="w-4 h-4" />
        }
      </Button>
    </form>
  );
}
