import { Button } from "@/components/ui/button";
import type { User } from "@/lib/db/schema";
import { CircleFadingArrowUp, PlusCircle } from "lucide-react";
import { Badge } from "../ui/badge";
import Link from "next/link";

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <UserName user={user} />
        </h1>
        <div className="text-muted-foreground mt-2">
          <UserPlanBadge user={user} />
        </div>
      </div>
      <div className="flex space-x-3">
        <Button variant="outline" asChild>
          <Link href="/plans">
            <CircleFadingArrowUp className="mr-2 h-4 w-4" />
            Atualizar Plano
          </Link>
        </Button>
        <Button asChild>
          <Link href="/sites/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Serviço
          </Link>
        </Button>
      </div>
    </div>
  );
}

async function UserName({ user }: WelcomeHeaderProps) {
  const userData = await user;
  const firstName = userData?.name.split(" ")[0];

  return firstName
    ? `Bem-vindo de volta, ${firstName}!`
    : "Bem-vindo de volta!";
}

export function UserPlanBadge({ user }: WelcomeHeaderProps) {
  if (user.organization.plan) {
    return (
      <Badge variant="secondary">Plano {user.organization.plan.name}</Badge>
    );
  }

  return "Nenhum plano ativo no momento.";
}

export interface WelcomeHeaderProps {
  user: User;
}
