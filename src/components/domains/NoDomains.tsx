import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import Link from "next/link";

export default function NoDomains() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Globe className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Nenhum domínio registrado</h3>
      <p className="text-muted-foreground mb-4">
        Você ainda não registrou nenhum domínio.
      </p>
      <Button 
        className="bg-gradient-to-r from-sky-500 to-sky-600 text-white font-bold hover:brightness-110 border-0"
        asChild={true}
      >
        <Link href="/domain?tab=register">
          <Globe className="mr-2 h-4 w-4" /> Registrar Novo Domínio
        </Link>
      </Button>
    </div>
  );
}
