"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RawUser } from "@/lib/db/schema/tables/user";
import {
  Ban,
  Mail,
  MoreHorizontal,
  Search,
  Shield,
  UserCog,
  UserMinus,
} from "lucide-react";
import { useState, useTransition } from "react";
import type { User } from "@/lib/db/schema/tables/user"; // Changed from RawUser
import { toast } from "@/hooks/use-toast"; // For potential actions
import {
  removeMemberFromOrganizationAction,
  updateMemberRoleAction,
} from "@/app/(auth)/settings/actions"; // Assuming actions are shared or similar ones exist for this context

interface MemberManagementProps {
  members: RawUser[]; // Changed from RawUser to User for consistency with OrganizationSection
  currentUserId: string;
  organizationId: string;
  isOwner: boolean;
}

export function MemberManagement({
  members,
  currentUserId,
  organizationId,
  isOwner,
}: MemberManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();
  // Add state for edit role dialog if needed, similar to OrganizationSection

  const filteredMembers = members.filter(
    (member) =>
      (member.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (member.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  const getStatusBadgeInfo = (member: RawUser) => {
    if (member.deletedAt) {
      return {
        text: "Suspenso",
        className:
          "bg-red-500/10 text-red-500 border-red-200 dark:border-red-800",
      };
    }
    // Add logic for 'invited' if you have such a status
    // if (!member.emailVerified && !member.lastLoginAt) { // Example for invited
    //   return { text: "Convidado", className: "bg-yellow-500/10 text-yellow-500 border-yellow-200 dark:border-yellow-800" };
    // }
    return {
      text: "Ativo",
      className:
        "bg-green-500/10 text-green-500 border-green-200 dark:border-green-800",
    };
  };

  const getRoleDisplayName = (role?: string | null) => {
    switch (role) {
      case "active":
        return "Ativo";
      case "admin":
        return "Administrador";
      case "developer":
        return "Desenvolvedor";
      case "member":
        return "Membro";
      default:
        return "Membro";
    }
  };

  const getRoleIcon = (role?: string | null) => {
    switch (role) {
      case "admin":
        return <Shield className="h-3 w-3 mr-1" />;
      // Add other icons if needed
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Gerenciamento de Membros</CardTitle>
            <CardDescription>
              Visualize, adicione, ou modifique membros da sua organização.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative flex-1 md:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar membros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Adicionado em</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Status</TableHead>
                {isOwner && <TableHead className="text-right">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={member.image || undefined} />
                        <AvatarFallback>
                          {member.name
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase() ||
                            member.email?.charAt(0).toUpperCase() ||
                            "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {member.name || "Usuário sem nome"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.email || "Sem email"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getRoleIcon(member.organizationRole)}
                      {getRoleDisplayName(member.organizationRole)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {member.createdAt
                      ? new Date(member.createdAt).toLocaleDateString()
                      : "Desconhecido"}
                  </TableCell>
                  <TableCell>
                    {member.updatedAt // Assuming you have lastLoginAt
                      ? new Date(member.updatedAt).toLocaleDateString()
                      : "Nunca"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusBadgeInfo(member).className}
                    >
                      {getStatusBadgeInfo(member).text}
                    </Badge>
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right">
                      {member.id !== currentUserId && ( // Prevent owner from acting on themselves here
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Ações</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                /* TODO: Open edit role dialog */
                              }}
                            >
                              <UserCog className="h-4 w-4 mr-2" />
                              Alterar Função
                            </DropdownMenuItem>
                            {/* Add other actions like resend invite or suspend if applicable */}
                            {/* <DropdownMenuItem>
                              <Mail className="h-4 w-4 mr-2" />
                              Reenviar Convite
                            </DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 dark:text-red-400 hover:!text-red-50 hover:!bg-red-600"
                              onClick={async () => {
                                if (
                                  !confirm(
                                    `Tem certeza que deseja remover ${member.name || member.email}?`
                                  )
                                )
                                  return;
                                startTransition(async () => {
                                  const result =
                                    await removeMemberFromOrganizationAction(
                                      member.id,
                                      organizationId
                                    );
                                  toast({
                                    title: result.success ? "Sucesso" : "Erro",
                                    description: result.message,
                                    variant: result.success
                                      ? "default"
                                      : "destructive",
                                  });
                                });
                              }}
                            >
                              <UserMinus className="h-4 w-4 mr-2" />
                              Remover Membro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
