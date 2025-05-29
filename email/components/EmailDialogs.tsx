/* "use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";
import { ZohoEmailAccountResponse, zohoMailApi } from "@/lib/server/apis/zoho";

interface CreateEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain: string;
  onSuccess?: () => void;
}

export function CreateEmailDialog({
  open,
  onOpenChange,
  domain,
  onSuccess,
}: CreateEmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);

    try {
      // Add domain to form data
      formData.set("domain", domain);

      const result = await createEmailAccount(formData);

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
        // Reset form by closing and reopening
        setTimeout(() => {
          setError(null);
        }, 100);
      } else {
        setError(result.error || "Failed to create email account");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Nova Conta de E-mail</DialogTitle>
          <DialogDescription>
            Crie uma nova conta de e-mail para {domain}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Usuário
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              <Input
                id="username"
                name="username"
                placeholder="usuario"
                required
                disabled={isLoading}
                className="flex-1"
              />
              <span className="text-sm text-muted-foreground">@{domain}</span>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Nome
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="João"
              required
              disabled={isLoading}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Sobrenome
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Silva"
              required
              disabled={isLoading}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              disabled={isLoading}
              className="col-span-3"
              minLength={8}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: ZohoEmailAccountResponse | null;
  domain: string;
  onSuccess?: () => void;
}

export function EditEmailDialog({
  open,
  onOpenChange,
  account,
  domain,
  onSuccess,
}: EditEmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    if (!account) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add required fields to form data
      formData.set("domain", domain);
      formData.set("emailAddress", account.emailAddress);

      const result = await zohoMailApi.updateEmailAccount(formData);

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
        setTimeout(() => {
          setError(null);
        }, 100);
      } else {
        setError(result.error || "Failed to update email account");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (!account) return null;

  const [username, domainPart] = account.emailAddress.split("@");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Conta de E-mail</DialogTitle>
          <DialogDescription>
            Edite as informações da conta {account.emailAddress}
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right text-muted-foreground">E-mail</Label>
            <div className="col-span-3 text-sm text-muted-foreground">
              {account.emailAddress}
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firstName" className="text-right">
              Nome
            </Label>
            <Input
              id="firstName"
              name="firstName"
              placeholder="João"
              required
              disabled={isLoading}
              className="col-span-3"
              defaultValue={account.displayName?.split(" ")[0] || ""}
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="lastName" className="text-right">
              Sobrenome
            </Label>
            <Input
              id="lastName"
              name="lastName"
              placeholder="Silva"
              required
              disabled={isLoading}
              className="col-span-3"
              defaultValue={
                account.displayName?.split(" ").slice(1).join(" ") || ""
              }
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right">
              Nova Senha
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              disabled={isLoading}
              className="col-span-3"
              minLength={8}
            />
            <div className="col-span-4 text-xs text-muted-foreground ml-auto">
              Deixe em branco para manter a senha atual
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: ZohoEmailAccountResponse | null;
  domain: string;
  onSuccess?: () => void;
}

export function DeleteEmailDialog({
  open,
  onOpenChange,
  account,
  domain,
  onSuccess,
}: DeleteEmailDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!account) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await deleteEmailAccount(domain, account.emailAddress);

      if (result.success) {
        onOpenChange(false);
        onSuccess?.();
        setTimeout(() => {
          setError(null);
        }, 100);
      } else {
        setError(result.error || "Failed to delete email account");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (!account) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Excluir Conta de E-mail</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja excluir a conta {account.emailAddress}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> Esta ação não pode ser desfeita. Todos
              os e-mails e dados associados a esta conta serão perdidos
              permanentemente.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              "Excluir Conta"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
 */

export default function F() {
  return <></>;
}
