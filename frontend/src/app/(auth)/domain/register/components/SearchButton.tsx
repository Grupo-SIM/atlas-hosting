"use client";

import { Loader2, Search } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SearchButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="group relative h-11 shrink-0 gap-1.5 overflow-hidden border-0 bg-white px-4 font-bold text-slate-950 text-sm shadow-lg transition-all hover:scale-[1.02] hover:bg-white/90 active:scale-95"
      disabled={pending}
      type="submit"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
      )}
      <span className="hidden sm:inline">{pending ? "..." : "Buscar"}</span>

      {/* Efeito de brilho ao carregar */}
      {pending && (
        <div className="absolute inset-0 animate-pulse bg-white/10" />
      )}
    </Button>
  );
}
