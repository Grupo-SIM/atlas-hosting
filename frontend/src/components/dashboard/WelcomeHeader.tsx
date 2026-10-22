import type { User } from "@/lib/db/schema";
import { Badge } from "../ui/badge";

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
      <div>
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
          <UserName user={user} />
        </h1>
        <div className="mt-2 text-muted-foreground">
          <UserPlanBadge user={user} />
        </div>
      </div>
      <div className="flex space-x-3">
        {/*  <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button variant="outline" disabled className="opacity-50 cursor-not-allowed">
                  <CircleFadingArrowUp className="mr-2 h-4 w-4" />
                  Atualizar Plano
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="font-medium">
              Em breve
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}

        {/* <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <Button disabled className="opacity-50 cursor-not-allowed">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Serviço
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent className="font-medium">
              Em breve
            </TooltipContent>
          </Tooltip>
        </TooltipProvider> */}
      </div>
    </div>
  );
}

function UserName({ user }: WelcomeHeaderProps) {
  const firstName = user?.name?.split(" ")[0];
  return firstName
    ? `Bem-vindo, ${firstName}!`
    : "Bem-vindo!";
}

export function UserPlanBadge({ user }: WelcomeHeaderProps) {
  if (user?.organization?.plan) {
    return (
      <div className="flex h-min items-center gap-2">
        <Badge variant="default">Plano {user.organization.plan.name}</Badge>
        <Badge variant="secondary">{user.email}</Badge>
      </div>
    );
  }

  return "";
}

export interface WelcomeHeaderProps {
  user: User;
}
