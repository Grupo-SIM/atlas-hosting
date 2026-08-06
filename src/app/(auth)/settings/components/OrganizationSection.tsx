"use client";

import {
  Building2,
  Calendar,
  Code,
  Crown,
  Edit,
  MoreHorizontal,
  Save,
  Shield,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { IMaskInput } from "react-imask";
import MemberPasswordInput from "@/app/(auth)/organization/components/MemberPasswordInput"; // Assuming path
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
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import type { RawUser, User } from "@/lib/db/schema/tables/user";
import { formatDate } from "@/lib/utils";
import {
  addMemberToOrganizationAction, // New action to be created
  removeMemberFromOrganizationAction, // New action to be created
  updateMemberRoleAction, // New action to be created
  updateOrganizationNameAction,
} from "../actions";

interface OrganizationSectionProps {
  user: User;
}

/** Gestão de membros desativada na interface — ligue aqui para trazer de volta. */
const SHOW_MEMBERS_SECTION = false;

/** Estatísticas da organização desativadas na interface. */
const SHOW_STATS_SECTION = false;

/** Documento vem só com dígitos do banco; a tela mostra com máscara de CPF ou CNPJ. */
function formatDocument(document: string | null | undefined): string {
  const digits = (document ?? "").replace(/\D/g, "");
  if (digits.length === 11) {
    return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  if (digits.length === 14) {
    return digits.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      "$1.$2.$3/$4-$5"
    );
  }
  return digits;
}

export function OrganizationSection({ user }: OrganizationSectionProps) {
  const [isEditingOrg, setIsEditingOrg] = useState(false);
  const [orgName, setOrgName] = useState(user.organization.name);
  const [orgDocument, setOrgDocument] = useState(
    formatDocument(user.organization.document)
  );
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<RawUser | null>(null);
  const [newMemberFullName, setNewMemberFullName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("member");

  const [isPending, startTransition] = useTransition();
  const [isMemberActionPending, startMemberActionTransition] = useTransition();

  const organization = user.organization;
  const members = organization.members || [];
  const isOwner = organization.ownerId === user.id;

  const handleSaveOrgName = () => {
    startTransition(async () => {
      try {
        const result = await updateOrganizationNameAction(orgName, orgDocument);

        if (result.success) {
          toast({
            description: result.message,
            title: "Sucesso",
          });
          setIsEditingOrg(false);
        } else {
          toast({
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao salvar dados da organização.",
          title: "Erro",
          variant: "destructive",
        });
      }
    });
  };

  const handleAddMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("organizationId", organization.id);

    startMemberActionTransition(async () => {
      try {
        const result = await addMemberToOrganizationAction(formData);
        if (result.success) {
          toast({ description: result.message, title: "Sucesso" });
          setIsAddMemberOpen(false);
          // Form fields would ideally be reset here or dialog unmounted/remounted
          setNewMemberFullName("");
          setNewMemberEmail("");
          setNewMemberRole("member");
        } else {
          toast({
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao adicionar membro.",
          title: "Erro",
          variant: "destructive",
        });
      }
    });
  };

  const handleRemoveMember = (memberId: string) => {
    if (
      !confirm(
        "Tem certeza que deseja remover este membro? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }
    startMemberActionTransition(async () => {
      try {
        const result = await removeMemberFromOrganizationAction(
          memberId,
          organization.id
        );
        if (result.success) {
          toast({ description: result.message, title: "Sucesso" });
        } else {
          toast({
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao remover membro.",
          title: "Erro",
          variant: "destructive",
        });
      }
    });
  };

  const handleOpenEditRoleDialog = (member: RawUser) => {
    setEditingMember(member);
    // setNewMemberRole(member.organizationRole || "member"); // Pre-fill current role
  };

  const handleUpdateMemberRole = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    if (!editingMember) return;

    const formData = new FormData(e.currentTarget);
    const role = formData.get("role") as string;

    startMemberActionTransition(async () => {
      try {
        const result = await updateMemberRoleAction(
          editingMember.id,
          organization.id,
          role
        );
        if (result.success) {
          toast({ description: result.message, title: "Sucesso" });
          setEditingMember(null);
        } else {
          toast({
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao atualizar função.",
          title: "Erro",
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="orgName">Nome da Organização</Label>
                {isEditingOrg ? (
                  <Input
                    disabled={!isOwner}
                    id="orgName"
                    onChange={e => setOrgName(e.target.value)}
                    placeholder="Nome da empresa"
                    value={orgName}
                  />
                ) : (
                  <Input readOnly value={organization.name} />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgDocument">CNPJ / CPF</Label>
                {isEditingOrg ? (
                  <IMaskInput
                    className={inputClasses}
                    disabled={!isOwner}
                    dispatch={(appended, dynamicMasked) => {
                      // Até 11 dígitos é CPF; a partir daí vira CNPJ.
                      const digits = (dynamicMasked.value + appended).replace(
                        /\D/g,
                        ""
                      );
                      return dynamicMasked.compiledMasks[
                        digits.length > 11 ? 1 : 0
                      ];
                    }}
                    id="orgDocument"
                    inputMode="numeric"
                    mask={[
                      { mask: "000.000.000-00" },
                      { mask: "00.000.000/0000-00" },
                    ]}
                    onAccept={value => setOrgDocument(String(value))}
                    placeholder="CPF ou CNPJ"
                    value={orgDocument}
                  />
                ) : (
                  <Input
                    readOnly
                    value={
                      formatDocument(organization.document) || "Não informado"
                    }
                  />
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditingOrg ? (
                <>
                  <Button
                    disabled={isPending}
                    onClick={handleSaveOrgName}
                    size="sm"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
                  </Button>
                  <Button
                    disabled={isPending}
                    onClick={() => {
                      setOrgName(organization.name);
                      setOrgDocument(formatDocument(organization.document));
                      setIsEditingOrg(false);
                    }}
                    size="sm"
                    variant="outline"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </>
              ) : (
                isOwner && (
                  <Button
                    onClick={() => setIsEditingOrg(true)}
                    size="sm"
                    variant="outline"
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                )
              )}
            </div>
            {!isOwner && (
              <p className="text-muted-foreground text-sm">
                Apenas o proprietário pode editar os dados da organização
              </p>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Criada em</Label>
                <Input readOnly value={formatDate(organization.createdAt)} />
              </div>
              <div className="space-y-2">
                <Label>ID da Organização</Label>
                <Input
                  className="font-mono text-sm"
                  readOnly
                  value={organization.id}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organization Members — seção oculta a pedido; o código segue aqui para
          quando a gestão de membros voltar a ser usada. */}
      {SHOW_MEMBERS_SECTION && (
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
              <Dialog
                onOpenChange={isOpen => {
                  setIsAddMemberOpen(isOpen);
                  if (!isOpen) {
                    setNewMemberFullName("");
                    setNewMemberEmail("");
                    setNewMemberRole("member");
                  }
                }}
                open={isAddMemberOpen}
              >
                <DialogTrigger asChild>
                  {/*    <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Adicionar Membro
                </Button> */}
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Adicionar Novo Membro</DialogTitle>
                    <DialogDescription>
                      Convide um novo membro para sua organização
                    </DialogDescription>
                  </DialogHeader>
                  <form className="mt-4 space-y-4" onSubmit={handleAddMember}>
                    <div className="space-y-2">
                      <Label htmlFor="newMemberFullName">Nome Completo</Label>
                      <Input
                        id="newMemberFullName"
                        name="fullName"
                        onChange={e => setNewMemberFullName(e.target.value)}
                        placeholder="Nome do membro"
                        required
                        value={newMemberFullName}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newMemberEmail">Endereço de email</Label>
                      <Input
                        id="newMemberEmail"
                        name="email"
                        onChange={e => setNewMemberEmail(e.target.value)}
                        placeholder="nome@example.com"
                        required
                        type="email"
                        value={newMemberEmail}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newMemberRole">Função</Label>
                      <Select
                        name="role"
                        onValueChange={setNewMemberRole}
                        required
                        value={newMemberRole}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um cargo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="developer">
                            Desenvolvedor
                          </SelectItem>
                          <SelectItem value="member">Membro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newMemberPassword">Senha</Label>
                      <MemberPasswordInput />{" "}
                      {/* Name="password" is handled inside */}
                      <p className="text-muted-foreground text-xs">
                        Uma senha segura será gerada. Compartilhe com o usuário.
                      </p>
                    </div>
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button type="button" variant="outline">
                          Cancelar
                        </Button>
                      </DialogClose>
                      <Button disabled={isMemberActionPending} type="submit">
                        {isMemberActionPending && (
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Adicionar Membro
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Membro</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Adicionado em</TableHead>
                    {isOwner && (
                      <TableHead className="text-right">Ações</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map(member => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={member.image || undefined} />
                            <AvatarFallback>
                              {member.name
                                .split(" ")
                                .map(n => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-muted-foreground text-sm">
                              {member.email}
                            </p>
                          </div>
                          {member.id === organization.ownerId && (
                            <Badge
                              className="bg-yellow-500/10 text-yellow-700"
                              variant="secondary"
                            >
                              <Crown className="mr-1 h-3 w-3" />
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
                      {isOwner && (
                        <TableCell className="text-right">
                          {member.id !== user.id && ( // Owner cannot remove or edit their own role directly here
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  className="h-8 w-8"
                                  size="icon"
                                  variant="ghost"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleOpenEditRoleDialog(member)
                                  }
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar Função
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="hover:!text-destructive-foreground hover:!bg-destructive text-destructive"
                                  onClick={() => handleRemoveMember(member.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
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

            {members.length === 0 && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  Nenhum membro encontrado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Organization Statistics — seção oculta a pedido. */}
      {SHOW_STATS_SECTION && (
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border bg-card/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-2xl">{members.length}</p>
                    <p className="text-muted-foreground text-sm">
                      Total de Membros
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </div>
              <div className="rounded-lg border bg-card/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-2xl">
                      {organization.domains?.length || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Domínios Ativos
                    </p>
                  </div>
                  <Building2 className="h-8 w-8 text-green-500" />
                </div>
              </div>
              <div className="rounded-lg border bg-card/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-2xl">
                      {formatDate(organization.createdAt).split("/")[2]}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      Ano de Criação
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Role Dialog */}
      {editingMember && (
        <Dialog
          onOpenChange={isOpen => !isOpen && setEditingMember(null)}
          open={!!editingMember}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Função de {editingMember.name}</DialogTitle>
              <DialogDescription>
                Altere a função do membro na organização.
              </DialogDescription>
            </DialogHeader>
            <form className="mt-4 space-y-4" onSubmit={handleUpdateMemberRole}>
              <div className="space-y-2">
                <Label htmlFor="editMemberRole">Função</Label>
                <Select
                  defaultValue={editingMember.organizationRole || "member"}
                  name="role"
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="developer">Desenvolvedor</SelectItem>
                    <SelectItem value="member">Membro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button
                    onClick={() => setEditingMember(null)}
                    type="button"
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </DialogClose>
                <Button disabled={isMemberActionPending} type="submit">
                  {isMemberActionPending && (
                    <Save className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Salvar Alterações
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
