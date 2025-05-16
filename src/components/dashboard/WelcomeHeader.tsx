import { Button } from "@/components/ui/button";
import { User } from "@/lib/db/schema";
import { PlusCircle } from "lucide-react";

export async function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const firstName = user?.name.split(" ")[0];
  const siteLabel = user?.namesiloId ? "Seu site atual: vemproclubedolivro.com": "Você ainda não tem um site ativo.";

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Bem-vindo de volta, {firstName}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {siteLabel}
        </p>
      </div>
      <div className="flex space-x-3">
        <Button variant="outline">
          Atualizar Plano
        </Button>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>
    </div>
  );
}

export interface WelcomeHeaderProps {
  user: User | null;
}