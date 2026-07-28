import { Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NoDomains() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Globe className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 font-semibold text-lg">Nenhum domínio registrado</h3>
      <p className="mb-4 text-muted-foreground">
        Você ainda não registrou nenhum domínio.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          asChild={true}
          className="border-0 bg-gradient-to-r from-sky-500 to-sky-600 font-bold text-white hover:brightness-110"
        >
          <Link href="/domain?tab=register">
            <Globe className="mr-2 h-4 w-4" /> Registrar Novo Domínio
          </Link>
        </Button>
        <Button asChild={true} variant="outline">
          <Link href="/domain?tab=transfer">
            <Globe className="mr-2 h-4 w-4" /> Trazer Domínio
          </Link>
        </Button>
      </div>
    </div>
  );
}
