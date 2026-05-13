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
      className="w-full h-14 bg-white text-slate-950 text-base font-bold hover:bg-white/90 border-0 shadow-lg gap-2 relative overflow-hidden group transition-all hover:scale-[1.02] active:scale-95"
    >
      {pending ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <Search className="h-5 w-5 group-hover:scale-110 transition-transform" />
      )}
      {pending ? "..." : "Buscar"}
      
      {/* Efeito de brilho ao carregar */}
      {pending && (
        <div className="absolute inset-0 bg-white/10 animate-pulse" />
      )}
    </Button>
  );
}
