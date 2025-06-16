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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  Bell,
  Globe,
  Eye,
  EyeOff,
  Save,
  Edit,
  X,
  Camera,
  Key,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import type { User } from "@/lib/db/schema/tables/user";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  updateUserProfileAction,
  changePasswordAction,
  sendEmailVerificationAction,
  deleteUserAccountAction,
} from "../actions";

interface UserSectionProps {
  user: User;
}

export function UserSection({ user }: UserSectionProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // User preferences state
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    security: true,
    billing: true,
    marketing: false,
  });

  const [preferences, setPreferences] = useState({
    language: "pt-BR",
    timezone: "America/Sao_Paulo",
    dateFormat: "DD/MM/YYYY",
    theme: "system",
  });

  const handleSaveProfile = () => {
    startTransition(async () => {
      try {
        const result = await updateUserProfileAction(userName, userEmail);
        
        if (result.success) {
          toast({
            title: "Sucesso",
            description: result.message,
          });
          setIsEditingProfile(false);
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
          description: "Erro inesperado ao salvar perfil.",
          variant: "destructive",
        });
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Erro",
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await changePasswordAction(currentPassword, newPassword);
        
        if (result.success) {
          toast({
            title: "Sucesso",
            description: result.message,
          });
          setIsChangePasswordOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
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
          description: "Erro inesperado ao alterar senha.",
          variant: "destructive",
        });
      }
    });
  };

  const handleEmailVerification = () => {
    startTransition(async () => {
      try {
        const result = await sendEmailVerificationAction();
        
        toast({
          title: result.success ? "Sucesso" : "Erro",
          description: result.message,
          variant: result.success ? "default" : "destructive",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro inesperado ao enviar verificação.",
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteAccount = () => {
    startTransition(async () => {
      try {
        const result = await deleteUserAccountAction();
        
        if (result.success) {
          toast({
            title: "Conta Excluída",
            description: result.message,
          });
          // Redirect to login page or home
          window.location.href = "/login";
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
          description: "Erro inesperado ao excluir conta.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            Informações Pessoais
          </CardTitle>
          <CardDescription>
            Gerencie suas informações pessoais e configurações de conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-lg">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                variant="outline"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline">
                  {user.organizationRole === "admin"
                    ? "Administrador"
                    : user.organizationRole === "developer"
                      ? "Desenvolvedor"
                      : "Membro"}
                </Badge>
                {user.emailVerified && (
                  <Badge
                    variant="secondary"
                    className="bg-green-500/10 text-green-700"
                  >
                    <Mail className="w-3 h-3 mr-1" />
                    E-mail Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome Completo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="displayName"
                    value={isEditingProfile ? userName : user.name}
                    onChange={(e) => setUserName(e.target.value)}
                    readOnly={!isEditingProfile}
                    className="flex-1"
                  />
                  {!isEditingProfile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailAddress">E-mail</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="emailAddress"
                    type="email"
                    value={isEditingProfile ? userEmail : user.email}
                    onChange={(e) => setUserEmail(e.target.value)}
                    readOnly={!isEditingProfile}
                    className="flex-1"
                  />
                  {!user.emailVerified && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleEmailVerification}
                      disabled={isPending}
                    >
                      {isPending ? "Enviando..." : "Verificar"}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveProfile}
                  disabled={isPending}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserName(user.name);
                    setUserEmail(user.email);
                    setIsEditingProfile(false);
                  }}
                  disabled={isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Membro desde</Label>
                <Input value={formatDate(user.createdAt)} readOnly />
              </div>
              <div className="space-y-2">
                <Label>ID do Usuário</Label>
                <Input value={user.id} readOnly className="font-mono text-sm" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Segurança
          </CardTitle>
          <CardDescription>
            Configurações de segurança e autenticação da sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div>
                <h4 className="font-medium">Alterar Senha</h4>
                <p className="text-sm text-muted-foreground">
                  Última alteração: Nunca
                </p>
              </div>
              <Dialog
                open={isChangePasswordOpen}
                onOpenChange={setIsChangePasswordOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Key className="h-4 w-4 mr-2" />
                    Alterar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Alterar Senha</DialogTitle>
                    <DialogDescription>
                      Digite sua senha atual e escolha uma nova senha segura
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Senha Atual</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">Nova Senha</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirmar Nova Senha
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isPending}
                    >
                      {isPending ? "Alterando..." : "Alterar Senha"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div>
                <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                <p className="text-sm text-muted-foreground">
                  Adicione uma camada extra de segurança à sua conta
                </p>
              </div>
              <Badge variant="secondary">Desabilitado</Badge>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border bg-card/50">
              <div>
                <h4 className="font-medium">Sessões Ativas</h4>
                <p className="text-sm text-muted-foreground">
                  Gerencie dispositivos conectados à sua conta
                </p>
              </div>
              <Button variant="outline" size="sm">
                Ver Sessões
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferências de Notificação
          </CardTitle>
          <CardDescription>
            Configure como e quando você deseja receber notificações
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {key === "email"
                      ? "Notificações por E-mail"
                      : key === "push"
                        ? "Notificações Push"
                        : key === "security"
                          ? "Alertas de Segurança"
                          : key === "billing"
                            ? "Avisos de Cobrança"
                            : "Marketing e Promoções"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {key === "email"
                      ? "Receba atualizações importantes por e-mail"
                      : key === "push"
                        ? "Notificações em tempo real no navegador"
                        : key === "security"
                          ? "Alertas sobre atividades suspeitas"
                          : key === "billing"
                            ? "Lembretes de pagamento e faturas"
                            : "Ofertas especiais e novidades"}
                  </p>
                </div>
                <Switch
                  checked={value}
                  onCheckedChange={(checked) =>
                    setNotifications((prev) => ({ ...prev, [key]: checked }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Zona de Perigo
          </CardTitle>
          <CardDescription>
            Ações irreversíveis relacionadas à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive/5">
              <div>
                <h4 className="font-medium">Excluir Conta</h4>
                <p className="text-sm text-muted-foreground">
                  Excluir permanentemente sua conta e todos os dados associados
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Conta
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Tem certeza que deseja excluir sua conta?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação não pode ser desfeita. Todos os seus dados,
                      incluindo sites, domínios e configurações serão
                      permanentemente removidos.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleDeleteAccount}
                      disabled={isPending}
                    >
                      {isPending ? "Excluindo..." : "Sim, excluir minha conta"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
