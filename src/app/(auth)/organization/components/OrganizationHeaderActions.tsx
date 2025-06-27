import { Button } from "@/components/ui/button";
import { UserPlus, Settings } from "lucide-react";
import { InviteMemberDialog } from "./InviteMemberDialog";
import { headers } from "next/headers";
import type { OrganizationPageParams } from "@/app/(auth)/organization/types";
import Link from "next/link";

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">
            {organizationName} - Administração Geral
          </h1>
          <p className="text-muted-foreground">
            Gerencie sua organização, membros da equipe e outras configurações
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link
              href={{
                pathname: "/organization",
                query: addMemberLink,
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Membro
            </Link>
          </Button>
          <Link href="/settings?tab=organization">
            <Button>
              <Settings className="h-4 w-4 mr-2" />
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
