import { Settings, UserPlus } from "lucide-react";
import Link from "next/link";
import type { OrganizationPageParams } from "@/app/(auth)/organization/types";
import { Button } from "@/components/ui/button";
import { InviteMemberDialog } from "./InviteMemberDialog";

interface OrganizationHeaderActionsProps {
  organizationName: string;
  organizationId: string;
  dialogOpen: boolean;
  searchParams: OrganizationPageParams;
}

export async function OrganizationHeaderActions({
  organizationName,
  organizationId,
  dialogOpen,
  searchParams,
}: OrganizationHeaderActionsProps) {
  const addMemberLink = {
    ...searchParams,
    action: "createMember",
  };

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl capitalize tracking-tight md:text-3xl">
            {organizationName} - Administração Geral
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua organização, membros da equipe e outras configurações
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link
              href={{
                pathname: "/organization",
                query: addMemberLink,
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Link>
          </Button>
          <Link href="/settings?tab=organization">
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Configurações da Organização
            </Button>
          </Link>
        </div>
      </div>
      <InviteMemberDialog
        open={dialogOpen}
        orgId={organizationId}
        searchParams={searchParams}
      />
    </>
  );
}
