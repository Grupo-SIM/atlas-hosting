"use client";

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
import { Textarea } from "@/components/ui/textarea";
import { Plus, Mail, Lock, User, HardDrive, Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
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
    username: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    quota: "100", // 1GB default
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
          username: "",
          password: "",
          confirmPassword: "",
          displayName: "",
          quota: "1000",
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
    setFormData((prev) => ({ ...prev, password, confirmPassword: password }));
    toast.info("Senha segura gerada automaticamente");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <Plus className="h-4 w-4 mr-2" />
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Nome de Usuário
            </Label>
            <div className="flex">
              <Input
                id="username"
                placeholder="usuario"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value.toLowerCase(),
                  }))
                }
                className="rounded-r-none"
                disabled={isPending}
                required
              />
              <div className="flex items-center px-3 bg-muted border border-l-0 rounded-r-md text-sm text-muted-foreground">
                @{domainName}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Digite apenas o nome de usuário (sem @{domainName})
            </p>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label htmlFor="displayName">Nome de Exibição (Opcional)</Label>
            <Input
              id="displayName"
              placeholder="João Silva"
              value={formData.displayName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  displayName: e.target.value,
                }))
              }
              disabled={isPending}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Senha
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={generateSecurePassword}
                disabled={isPending}
              >
                Gerar Senha
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Digite uma senha segura"
              value={formData.password}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, password: e.target.value }))
              }
              disabled={isPending}
              required
              minLength={8}
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar Senha</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Digite a senha novamente"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
              disabled={isPending}
              required
              minLength={8}
            />
          </div>

          {/* Quota */}
          <div className="space-y-2">
            <Label htmlFor="quota" className="flex items-center gap-2">
              <HardDrive className="h-4 w-4" />
              Cota de Armazenamento
            </Label>
            <Select
              value={formData.quota}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, quota: value }))
              }
              disabled={isPending}
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
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">Requisitos da Senha:</p>
            <ul className="text-xs text-muted-foreground space-y-1">
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
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
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
