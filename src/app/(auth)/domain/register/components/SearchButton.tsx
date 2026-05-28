"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

export function SearchButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      disabled={pending} 
      className="h-11 px-4 bg-white text-slate-950 text-sm font-bold hover:bg-white/90 border-0 shadow-lg gap-1.5 relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-95 shrink-0"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
      )}
      <span className="hidden sm:inline">{pending ? "..." : "Buscar"}</span>
      
      {/* Efeito de brilho ao carregar */}
      {pending && (
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
      )}
    </Button>
  );
}
