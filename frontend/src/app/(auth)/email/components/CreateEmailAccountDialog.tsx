"use client";

import { HardDrive, Loader2, Lock, Mail, Plus, User } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { createPleskMailAccount } from "../actions";

interface CreateEmailAccountDialogProps {
  domainName: string;
}

export function CreateEmailAccountDialog({
  domainName,
}: CreateEmailAccountDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    confirmPassword: "",
    displayName: "",
    password: "",
    quota: "100", // 1GB default
    username: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      toast.error("Nome de usuário e senha são obrigatórios");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("A senha deve ter pelo menos 8 caracteres");
      return;
    }

    startTransition(async () => {
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("username", formData.username);
        formDataToSend.append("password", formData.password);
        formDataToSend.append("displayName", formData.displayName);
        formDataToSend.append("quota", formData.quota);

        await createPleskMailAccount(formDataToSend);

        toast.success(
          `Conta ${formData.username}@${domainName} criada com sucesso!`
        );
        setOpen(false);
        setFormData({
          confirmPassword: "",
          displayName: "",
          password: "",
          quota: "1000",
          username: "",
        });
      } catch (error) {
        console.error("Error creating email account:", error);
        toast.error("Erro inesperado ao criar conta de email");
      }
    });
  };

  const generateSecurePassword = () => {
    const charset =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, confirmPassword: password, password }));
    toast.info("Senha segura gerada automaticamente");
  };

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Criar Nova Conta
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Criar Nova Conta de Email
          </DialogTitle>
          <DialogDescription>
            Crie uma nova conta de email para o domínio{" "}
            <strong>{domainName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Username */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="username">
              <User className="h-4 w-4" />
              Nome de Usuário
            </Label>
            <div className="flex">
              <Input
                className="rounded-r-none"
                disabled={isPending}
                id="username"
                onChange={e =>
                  setFormData(prev => ({
                    ...prev,
                    username: e.target.value.toLowerCase(),
                  }))
                }
                placeholder="usuario"
                required
                value={formData.username}
              />
              <div className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-muted-foreground text-sm">
                @{domainName}
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Digite apenas o nome de usuário (sem @{domainName})
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome de Exibição (Opcional)</Label>
            <Input
              disabled={isPending}
              id="displayName"
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              placeholder="João Silva"
              value={formData.displayName}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2" htmlFor="password">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Button
                disabled={isPending}
                onClick={generateSecurePassword}
                size="sm"
                type="button"
                variant="outline"
              >
                Gerar Senha
              </Button>
            </div>
            <Input
              disabled={isPending}
              id="password"
              minLength={8}
              onChange={e =>
                setFormData(prev => ({ ...prev, password: e.target.value }))
              }
              placeholder="Digite uma senha segura"
              required
              type="password"
              value={formData.password}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              disabled={isPending}
              id="confirmPassword"
              minLength={8}
              onChange={e =>
                setFormData(prev => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              placeholder="Digite a senha novamente"
              required
              type="password"
              value={formData.confirmPassword}
            />
          </div>

          {/* Quota */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2" htmlFor="quota">
              <HardDrive className="h-4 w-4" />
              Cota de Armazenamento
            </Label>
            <Select
              disabled={isPending}
              onValueChange={value =>
                setFormData(prev => ({ ...prev, quota: value }))
              }
              value={formData.quota}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="500">500 MB</SelectItem>
                <SelectItem value="1000">1 GB (Recomendado)</SelectItem>
                <SelectItem value="2000">2 GB</SelectItem>
                <SelectItem value="5000">5 GB</SelectItem>
                <SelectItem value="10000">10 GB</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Password Requirements */}
          <div className="rounded-lg bg-muted p-3">
            <p className="mb-2 font-medium text-sm">Requisitos da Senha:</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li
                className={
                  formData.password.length >= 8 ? "text-green-600" : ""
                }
              >
                • Mínimo de 8 caracteres
              </li>
              <li
                className={
                  /[A-Z]/.test(formData.password) ? "text-green-600" : ""
                }
              >
                • Pelo menos uma letra maiúscula
              </li>
              <li
                className={
                  /[0-9]/.test(formData.password) ? "text-green-600" : ""
                }
              >
                • Pelo menos um número
              </li>
              <li
                className={
                  /[!@#$%^&*]/.test(formData.password) ? "text-green-600" : ""
                }
              >
                • Pelo menos um caractere especial
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1"
              disabled={isPending}
              onClick={() => setOpen(false)}
              type="button"
              variant="outline"
            >
              Cancelar
            </Button>
            <Button className="flex-1" disabled={isPending} type="submit">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Conta
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
