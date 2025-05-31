"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, Settings } from "lucide-react";
import { InviteMemberDialog } from "./InviteMemberDialog";

interface OrganizationHeaderActionsProps {
  organizationName: string;
}

export function OrganizationHeaderActions({
  organizationName,
}: OrganizationHeaderActionsProps) {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {organizationName} - Management
          </h1>
          <p className="text-muted-foreground">
            Manage your organization, team members, and settings
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsInviteDialogOpen(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Organization Settings
          </Button>
        </div>
      </div>
      
      <InviteMemberDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
      />
    </>
  );
}
