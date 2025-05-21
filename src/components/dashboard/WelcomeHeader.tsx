import { Button } from "@/components/ui/button";
import type { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { plansTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PlusCircle } from "lucide-react";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <Suspense fallback={<Skeleton height="1em" width="7rem" />}>
            <UserName user={user} />
          </Suspense>
        </h1>
        <p className="text-muted-foreground mt-1">
          <Suspense fallback={<Skeleton height="1em" width="7rem" />}>
            <UserSiteLabel user={user} />
          </Suspense>
        </p>
      </div>
      <div className="flex space-x-3">
        <Button variant="outline">Atualizar Plano</Button>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Serviço
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

async function UserSiteLabel({ user }: WelcomeHeaderProps) {
  const userData = await user;

  if (userData?.planId) {
    const plan = await db.query.plansTable.findFirst({
      where: eq(plansTable.id, userData.planId),
    });

    if (plan) {
      return `Seu plano atual: ${plan.name}`;
    }
  }

  return "Você ainda não tem um plano ativo.";
}

export interface WelcomeHeaderProps {
  user?: ReturnType<typeof getUser>;
}
