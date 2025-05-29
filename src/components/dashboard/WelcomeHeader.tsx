import { Button } from "@/components/ui/button";
import type { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgPlan, User } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { PlusCircle } from "lucide-react";
import { Suspense } from "react";
import Skeleton from "react-loading-skeleton";
import { Badge } from "../ui/badge";
import {
  getUserCurrentDomain,
  getUserDomainsWithNamecheap,
} from "@/lib/server/utils";
import DomainSelector from "../domains/DomainSelector";

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <Suspense fallback={<Skeleton height="1em" width="7rem" />}>
            <UserName user={user} />
          </Suspense>
        </h1>
        <div className="text-muted-foreground mt-2">
          <Suspense fallback={<Skeleton height="1em" width="7rem" />}>
            <UserSiteLabel user={user} />
          </Suspense>
        </div>
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

  const domains = await getUserDomainsWithNamecheap(userData.id);
  const selectedDomain = await getUserCurrentDomain(userData);

  if (!selectedDomain) {
    return "Você ainda não possui um domínio na plataforma.";
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">Site atual:</span>
      <DomainSelector domains={domains} selectedDomain={selectedDomain} />
    </div>
  );
}

export interface WelcomeHeaderProps {
  user: Promise<User>;
}
