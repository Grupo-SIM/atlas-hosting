"use client";

import { CheckCircle, Clock, Edit, Mail } from "lucide-react";
import { useState } from "react";
import { ChangeEmailForm } from "@/components/auth/ChangeEmailForm";
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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { User } from "@/lib/db/schema/tables/user";

interface ChangeEmailSectionProps {
  user: User;
}

export function ChangeEmailSection({ user }: ChangeEmailSectionProps) {
  const [isChangeEmailOpen, setIsChangeEmailOpen] = useState(false);

  const handleEmailChangeSuccess = () => {
    setIsChangeEmailOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Endereço de Email
        </CardTitle>
        <CardDescription>
          Gerencie o endereço de email da sua conta
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="font-medium text-sm">Email atual</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {user.emailVerified ? (
              <Badge
                className="bg-green-500/10 text-green-700"
                variant="secondary"
              >
                <CheckCircle className="mr-1 h-3 w-3" />
                Verificado
              </Badge>
            ) : (
              <Badge
                className="bg-yellow-500/10 text-yellow-700"
                variant="secondary"
              >
                <Clock className="mr-1 h-3 w-3" />
                Não verificado
              </Badge>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <Dialog onOpenChange={setIsChangeEmailOpen} open={isChangeEmailOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Alterar Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Alterar Email</DialogTitle>
                <DialogDescription>
                  Para alterar seu email, você precisará verificar o novo
                  endereço.
                </DialogDescription>
              </DialogHeader>
              <ChangeEmailForm
                currentEmail={user.email}
                onSuccess={handleEmailChangeSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-1 text-muted-foreground text-xs">
          <p>• Você receberá um email de verificação no novo endereço</p>
          <p>• Seu email será alterado apenas após a verificação</p>
          <p>
            • Você será notificado no email atual quando a alteração for
            concluída
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
