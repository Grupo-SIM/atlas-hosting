import { Button } from "@/components/ui/button";
import type { User } from "@/lib/db/schema";
import { getUserCurrentDomain, getUserDomains } from "@/lib/server/utils";
import { PlusCircle } from "lucide-react";
import DomainSelector from "../domains/DomainSelector";
import type { getUser } from "@/lib/auth";

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          <UserName user={user} />
        </h1>
        <div className="text-muted-foreground mt-2">
          <UserSiteLabel user={user} />
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

export async function UserSiteLabel({ user }: WelcomeHeaderProps) {
  const userData = await user;

  const domains = await getUserDomains(userData);

  return (
    userData.selectedDomain && (
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">Site atual:</span>
        <DomainSelector
          domains={domains}
          selectedDomain={userData.organization.domains.find(
            (domain) => domain.domain === userData.selectedDomain
          )}
        />
      </div>
    )
  );
}

export interface WelcomeHeaderProps {
  user: Promise<User>;
}
