"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Users,
  Crown,
  Calendar,
  Edit,
  Save,
  X,
  MoreHorizontal,
  UserPlus,
  Mail,
  Shield,
  Code,
} from "lucide-react";
import type { User } from "@/lib/db/schema/tables/user";
import { formatDate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import { updateOrganizationNameAction } from "../actions";

interface OrganizationSectionProps {
  user: User;
}

export function OrganizationSection({ user }: OrganizationSectionProps) {
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [orgName, setOrgName] = useState(user.organization.name);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const organization = user.organization;
  const members = organization.members || [];
  const isOwner = organization.ownerId === user.id;

  const handleSaveOrgName = () => {
    startTransition(async () => {
      try {
        const result = await updateOrganizationNameAction(orgName);
        
        if (result.success) {
          toast({
            title: "Sucesso",
            description: result.message,
          });
          setIsEditingOrg(false);
        } else {
          toast({
            title: "Erro",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro inesperado ao salvar nome da organização.",
          variant: "destructive",
        });
      }
    });
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case "developer":
        return <Code className="h-4 w-4 text-blue-500" />;
      default:
        return <Users className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "default";
      case "developer":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Organization Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Informações da Organização
          </CardTitle>
          <CardDescription>
            Gerencie as informações básicas da sua organização
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orgName">Nome da Organização</Label>
              <div className="flex items-center gap-2">
                {isEditingOrg ? (
                  <>
                    <Input
                      id="orgName"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                      className="flex-1"
                      disabled={!isOwner}
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSaveOrgName}
                      disabled={isPending}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setOrgName(organization.name);
                        setIsEditingOrg(false);
                      }}
                      disabled={isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Input
                      value={organization.name}
                      readOnly
                      className="flex-1"
                    />
                    {isOwner && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsEditingOrg(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
              {!isOwner && (
                <p className="text-sm text-muted-foreground">
                  Apenas o proprietário pode editar o nome da organização
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Criada em</Label>
                <Input value={formatDate(organization.createdAt)} readOnly />
              </div>
              <div className="space-y-2">
                <Label>ID da Organização</Label>
                <Input
                  value={organization.id}
                  readOnly
                  className="font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Membros da Organização
            </CardTitle>
            <CardDescription>
              Gerencie os membros e suas permissões
            </CardDescription>
          </div>
          {isOwner && (
            <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Membro
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Membro</DialogTitle>
                  <DialogDescription>
                    Convide um novo membro para sua organização
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberName">Nome Completo</Label>
                    <Input
                      id="memberName"
                      placeholder="Digite o nome completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberEmail">E-mail</Label>
                    <Input
                      id="memberEmail"
                      type="email"
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberRole">Função</Label>
                    <select
                      id="memberRole"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="member">Membro</option>
                      <option value="developer">Desenvolvedor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="memberPassword">Senha Temporária</Label>
                    <Input
                      id="memberPassword"
                      type="password"
                      placeholder="Senha inicial para o membro"
                    />
                  </div>
                  <Button className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Enviar Convite
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Membro</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Adicionado em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.image || undefined} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                        {member.id === organization.ownerId && (
                          <Badge
                            variant="secondary"
                            className="bg-yellow-500/10 text-yellow-700"
                          >
                            <Crown className="w-3 h-3 mr-1" />
                            Proprietário
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getRoleIcon(member.organizationRole || "member")}
                        <Badge
                          variant={getRoleBadgeVariant(
                            member.organizationRole || "member"
                          )}
                        >
                          {member.organizationRole === "admin"
                            ? "Administrador"
                            : member.organizationRole === "developer"
                              ? "Desenvolvedor"
                              : "Membro"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(member.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      {isOwner && member.id !== user.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar Função
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              <X className="mr-2 h-4 w-4" />
                              Remover Membro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {members.length === 0 && (
            <div className="text-center py-8">
              <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Nenhum membro encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Organization Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Estatísticas da Organização
          </CardTitle>
          <CardDescription>
            Visão geral das atividades da organização
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{members.length}</p>
                  <p className="text-sm text-muted-foreground">
                    Total de Membros
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {organization.domains?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Domínios Ativos
                  </p>
                </div>
                <Building2 className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-card/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {formatDate(organization.createdAt).split("/")[2]}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ano de Criação
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
