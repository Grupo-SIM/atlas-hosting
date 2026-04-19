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
    <Form action="/domain" className="flex flex-col gap-4 w-full">
      <input type="hidden" name="tab" value="register" />
      
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            type="text" // Usamos text para remover o X nativo do navegador
            name="domain"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Digite o nome do domínio..."
            className="w-full bg-background/50 backdrop-blur-sm border-primary/10 focus-visible:ring-primary/30 h-11 pr-10"
          />
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive hover:text-destructive/80 transition-colors cursor-pointer p-1"
              title="Limpar busca"
            >
              <X className="h-4 w-4 stroke-[3px]" />
            </button>
          )}
        </div>
        <SearchButton />
      </div>
    </Form>
  );
}

export interface DomainPageParams {
  domain?: string;
}
