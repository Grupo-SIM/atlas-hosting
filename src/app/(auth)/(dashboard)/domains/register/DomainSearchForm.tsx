"use client";

import { Search } from "lucide-react";
import { startTransition, useActionState, useCallback } from "react";
import { CgSpinner } from "react-icons/cg";
import { searchDomains } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function DomainSearchForm({
  searchQuery,
}: {
  searchQuery: string;
}) {
  const [, doSearch, isPending] = useActionState(searchDomains, void 0);

  const onSubmit = useCallback(() => {
    startTransition(() => {
      doSearch(searchQuery);
    });
  }, [doSearch, searchQuery]);

  return (
    <form className="flex flex-row gap-2" onSubmit={onSubmit}>
      <div className="relative flex-1">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
        <Input
          className="pl-10"
          defaultValue={searchQuery}
          name="search"
          placeholder="ex: minhaempresa.com"
          type="text"
        />
      </div>
      <Button
        aria-label="Buscar"
        className="shrink-0"
        size="icon"
        type="submit"
      >
        {isPending ? (
          <CgSpinner className="h-4 w-4 animate-spin" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
