import Link from "next/link";
import { RedirectType, redirect } from "next/navigation";
import InviteMemberDialogWrapper from "@/app/(auth)/organization/components/InviteMemberDialogWrapper";
import type { OrganizationPageParams } from "@/app/(auth)/organization/types";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserForOrganization } from "@/lib/auth/utils";
import MemberPasswordInput from "./MemberPasswordInput";

interface InviteMemberDialogProps {
  open: boolean;
  orgId: string;
  searchParams: OrganizationPageParams;
}

export function InviteMemberDialog({
  open,
  orgId,
  searchParams,
}: InviteMemberDialogProps) {
  async function addMemberToOrg(formData: FormData) {
    "use server";

    const fullName = formData.get("fullName") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const password = formData.get("password") as string;

    await createUserForOrganization(
      fullName,
      email,
      password,
      orgId,
      role as "admin" | "member" | "developer"
    );

    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.delete("action");

    redirect(`/organization?${newSearchParams.toString()}`, RedirectType.push);
  }

  return (
    <InviteMemberDialogWrapper open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convidar Novo Membro</DialogTitle>
          <DialogDescription>
            Adicione um novo membro à sua organização e defina suas permissões.
            Uma senha temporária será gerada.
          </DialogDescription>
        </DialogHeader>

        <form action={addMemberToOrg} className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Nome do membro"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Endereço de email</Label>
            <Input
              id="email"
              name="email"
              placeholder="nome@example.com"
              required
              type="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Função</Label>
            <Select defaultValue="member" name="role" required>
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
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <MemberPasswordInput />
            <p className="text-muted-foreground text-xs">
              Uma senha segura será gerada. Compartilhe-a com o novo membro.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button asChild variant="outline">
              <Link
                href={{ pathname: "/organization", query: { action: "none" } }}
              >
                Cancelar
              </Link>
            </Button>
            <Button type="submit">Adicionar Membro</Button>
          </div>
        </form>
      </DialogContent>
    </InviteMemberDialogWrapper>
  );
}
