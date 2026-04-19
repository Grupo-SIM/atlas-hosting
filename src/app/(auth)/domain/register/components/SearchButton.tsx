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
      className="sm:w-auto w-full gap-2 relative overflow-hidden group"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
      )}
      {pending ? "Buscando..." : "Buscar domínios"}
      
      {/* Efeito de brilho ao carregar */}
      {pending && (
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
      )}
    </Button>
  );
}
