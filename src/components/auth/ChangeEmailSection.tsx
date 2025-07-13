"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Mail, Edit, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { ChangeEmailForm } from "@/components/auth/ChangeEmailForm";
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
            <p className="text-sm font-medium">Email atual</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
          <div className="flex items-center gap-2">
            {user.emailVerified ? (
              <Badge variant="secondary" className="bg-green-500/10 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verificado
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700">
                <Clock className="w-3 h-3 mr-1" />
                Não verificado
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-4 border-t">
          <Dialog open={isChangeEmailOpen} onOpenChange={setIsChangeEmailOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <Edit className="mr-2 h-4 w-4" />
                Alterar Email
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Alterar Email</DialogTitle>
                <DialogDescription>
                  Para alterar seu email, você precisará verificar o novo endereço.
                </DialogDescription>
              </DialogHeader>
              <ChangeEmailForm
                currentEmail={user.email}
                onSuccess={handleEmailChangeSuccess}
              />
            </DialogContent>
          </Dialog>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Você receberá um email de verificação no novo endereço</p>
          <p>• Seu email será alterado apenas após a verificação</p>
          <p>• Você será notificado no email atual quando a alteração for concluída</p>
        </div>
      </CardContent>
    </Card>
  );
}
