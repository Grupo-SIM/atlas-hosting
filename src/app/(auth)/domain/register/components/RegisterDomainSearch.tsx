"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import Form from "next/form";
import { SearchButton } from "./SearchButton";
import { X } from "lucide-react";

export default function RegisterDomainSearch({ domain }: DomainPageParams) {
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
    <Form action="/domain" className="flex flex-col gap-4 w-full max-w-2xl mx-auto">
      <input type="hidden" name="tab" value="register" />
      
      <div className="flex flex-row gap-2 w-full">
        <div className="relative flex-1 group">
          <Input
            ref={inputRef}
            type="text"
            name="domain"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite o nome do domínio..."
            className="w-full h-11 bg-white dark:bg-white/5 backdrop-blur-md border-slate-200 dark:border-white/10 rounded-2xl px-4 text-slate-950 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all outline-none pr-10 group-hover:bg-slate-50 dark:group-hover:bg-white/10"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors cursor-pointer p-1"
              title="Limpar busca"
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
}
