"use client";

import { X } from "lucide-react";
import Form from "next/form";
import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { SearchButton } from "./SearchButton";

export default function RegisterDomainSearch({
  domain,
  returnTo,
}: DomainPageParams) {
  const [inputValue, setInputValue] = useState(domain || "");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClear = () => {
    setInputValue("");
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <Form
      action="/domain"
      className="mx-auto flex w-full max-w-2xl flex-col gap-4"
    >
      <input name="tab" type="hidden" value="register" />
      <input name="returnTo" type="hidden" value={returnTo || "/home"} />

      <div className="flex w-full flex-row gap-2">
        <div className="group relative flex-1">
          <Input
            className="h-11 w-full rounded-2xl border-slate-200 bg-white px-4 pr-10 text-slate-950 outline-none backdrop-blur-md transition-all placeholder:text-slate-400 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 group-hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white dark:group-hover:bg-white/10 dark:placeholder:text-slate-600"
            name="domain"
            onChange={e => setInputValue(e.target.value)}
            placeholder="Digite o nome do domínio..."
            ref={inputRef}
            type="text"
            value={inputValue}
          />
          {inputValue && (
            <button
              className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-slate-400 transition-colors hover:text-slate-950 dark:hover:text-white"
              onClick={handleClear}
              title="Limpar busca"
              type="button"
            >
              <X className="h-4 w-4 stroke-[2.5px]" />
            </button>
          )}
        </div>
        <div className="shrink-0">
          <SearchButton />
        </div>
      </div>
    </Form>
  );
}

export interface DomainPageParams {
  domain?: string;
  returnTo?: string;
}
