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
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { IMaskInput } from "react-imask";
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
  CreditCard,
  MapPin,
  Phone,
  FileText,
} from "lucide-react";
import type { User, UserSettings } from "@/lib/db/schema/tables/user";
import { formatDate } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { ChangeEmailSection } from "@/components/auth/ChangeEmailSection";
import { saveUserBillingInfo } from "@/app/(auth)/billing/actions";
import axios from "axios";
import {
  updateUserProfileAction,
  changePasswordAction,
  sendEmailVerificationAction,
  deleteUserAccountAction,
  updateUserProfileImageAction,
  type ProfileUpdateMessage,
} from "../actions";

interface UserSectionProps {
  user: User;
}

export function UserSection({ user }: UserSectionProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [userName, setUserName] = useState(user.name);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);

  // Billing state
  const [isEditingBilling, setIsEditingBilling] = useState(false);
  const [billingInfo, setBillingInfo] = useState({
    document: user.billingDocument || "",
    phoneNumber: user.billingPhone || "",
    address: {
      street: user.billingStreet || "",
      number: user.billingNumber || "",
      neighborhood: user.billingNeighborhood || "",
      city: user.billingCity || "",
      state: user.billingState || "",
      zipCode: user.billingZipCode || "",
    },
  });

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [preferences, setPreferences] = useState(user.settings);

  const handleSaveProfile = () => {
    startTransition(async () => {
      try {
        const result = await updateUserProfileAction(
          userName,
          user.email, // Keep the current email - don't allow changing it here
          preferences
        );

        if (result.success) {
          toast({
            title: "Sucesso",
            description: result.message,
          });
          setIsEditingProfile(false);

          const updateMessage = JSON.parse(
            result.message
          ) as ProfileUpdateMessage;

          setPreferences((prev) => {
            if (
              updateMessage.settings &&
              updateMessage.settings?.emailNotifications !==
                preferences.emailNotifications
            ) {
              return {
                ...prev,
                email: updateMessage.settings.emailNotifications ?? false,
              };
            }

            return prev;
          });
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

  const handleSaveBilling = () => {
    startTransition(async () => {
      try {
        const result = await saveUserBillingInfo(billingInfo);

        if (result.status === "success") {
          toast({
            title: "Sucesso",
            description: result.message,
          });
          setIsEditingBilling(false);
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
          description: "Erro ao salvar informações de cobrança.",
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive",
      });
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setIsUploading(true);
    try {
      const result = await updateUserProfileImageAction(formData);
      if (result.success) {
        toast({
          title: "Sucesso",
          description: result.message,
        });
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
        description: "Erro ao fazer upload da imagem.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
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
            <div className="relative group">
              <label className="cursor-pointer block relative">
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
                <Avatar className="h-20 w-20 transition-opacity group-hover:opacity-80">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-full">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}
                
                <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-background border flex items-center justify-center shadow-sm group-hover:bg-accent transition-colors">
                  <Camera className="h-4 w-4" />
                </div>
              </label>
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
                    value={user.email}
                    readOnly
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
                <p className="text-xs text-muted-foreground">
                  Para alterar seu email, use a seção "Alterar Email" abaixo.
                </p>
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex gap-2">
                <Button onClick={handleSaveProfile} disabled={isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUserName(user.name);
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

      {/* Billing Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Dados de Faturamento
              </CardTitle>
              <CardDescription>
                Informações utilizadas para geração de faturas e notas fiscais
              </CardDescription>
            </div>
            {!isEditingBilling && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditingBilling(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground font-medium">
                  <FileText className="h-4 w-4" />
                  CPF ou CNPJ
                </Label>
                <IMaskInput
                  mask={[
                    { mask: "000.000.000-00" },
                    { mask: "00.000.000/0000-00" },
                  ]}
                  value={billingInfo.document}
                  onAccept={(value) => setBillingInfo({ ...billingInfo, document: value })}
                  readOnly={!isEditingBilling}
                  placeholder="000.000.000-00"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Phone className="h-4 w-4" />
                  Telefone de Contato
                </Label>
                <IMaskInput
                  mask="(00) 00000-0000"
                  value={billingInfo.phoneNumber}
                  onAccept={(value) => setBillingInfo({ ...billingInfo, phoneNumber: value })}
                  readOnly={!isEditingBilling}
                  placeholder="(00) 00000-0000"
                  className={inputClasses}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-muted-foreground font-medium">
                  <MapPin className="h-4 w-4" />
                  CEP
                </Label>
                <IMaskInput
                  mask="00000-000"
                  unmask={true}
                  value={billingInfo.address.zipCode}
                  onAccept={(value) => {
                    const digits = value.replace(/\D/g, "");
                    setBillingInfo((prev) => ({ 
                      ...prev, 
                      address: { ...prev.address, zipCode: digits } 
                    }));

                    if (digits && digits.length === 8) {
                      (async () => {
                        try {
                          const { data } = await axios.get(`https://opencep.com/v1/${digits}.json`);
                          if (data && !data.error) {
                            setBillingInfo((prev) => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                street: data.logradouro || prev.address.street,
                                neighborhood: data.bairro || prev.address.neighborhood,
                                city: data.localidade || prev.address.city,
                                state: data.uf || prev.address.state,
                                zipCode: digits
                              }
                            }));
                          }
                        } catch (error) {
                          console.error("Error fetching CEP:", error);
                        }
                      })();
                    }
                  }}
                  readOnly={!isEditingBilling}
                  placeholder="00000-000"
                  className={inputClasses}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-border/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-muted-foreground font-medium">Rua</Label>
                <Input
                  value={billingInfo.address.street}
                  onChange={(e) => setBillingInfo({ 
                    ...billingInfo, 
                    address: { ...billingInfo.address, street: e.target.value } 
                  })}
                  readOnly={!isEditingBilling}
                  placeholder="Nome da rua"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium">Número</Label>
                <Input
                  value={billingInfo.address.number}
                  onChange={(e) => setBillingInfo({ 
                    ...billingInfo, 
                    address: { ...billingInfo.address, number: e.target.value } 
                  })}
                  readOnly={!isEditingBilling}
                  placeholder="123"
                  className="bg-muted/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium">Bairro</Label>
                <Input
                  value={billingInfo.address.neighborhood}
                  onChange={(e) => setBillingInfo({ 
                    ...billingInfo, 
                    address: { ...billingInfo.address, neighborhood: e.target.value } 
                  })}
                  readOnly={!isEditingBilling}
                  placeholder="Nome do bairro"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium">Cidade</Label>
                <Input
                  value={billingInfo.address.city}
                  onChange={(e) => setBillingInfo({ 
                    ...billingInfo, 
                    address: { ...billingInfo.address, city: e.target.value } 
                  })}
                  readOnly={!isEditingBilling}
                  placeholder="Nome da cidade"
                  className="bg-muted/30"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground font-medium">Estado</Label>
                <Input
                  value={billingInfo.address.state}
                  onChange={(e) => setBillingInfo({ 
                    ...billingInfo, 
                    address: { ...billingInfo.address, state: e.target.value } 
                  })}
                  readOnly={!isEditingBilling}
                  placeholder="SP"
                  maxLength={2}
                  className="bg-muted/30"
                />
              </div>
            </div>
          </div>

          {isEditingBilling && (
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveBilling} disabled={isPending}>
                <Save className="h-4 w-4 mr-2" />
                {isPending ? "Salvando..." : "Salvar Dados de Cobrança"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setBillingInfo({
                    document: user.billingDocument || "",
                    phoneNumber: user.billingPhone || "",
                    address: {
                      street: user.billingStreet || "",
                      number: user.billingNumber || "",
                      neighborhood: user.billingNeighborhood || "",
                      city: user.billingCity || "",
                      state: user.billingState || "",
                      zipCode: user.billingZipCode || "",
                    },
                  });
                  setIsEditingBilling(false);
                }}
                disabled={isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Email Section */}
    {/*   <ChangeEmailSection user={user} /> */}

      {/* Security Settings */}
     {/*  <Card>
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
      </Card> */}

      {/* Notification Preferences */}
{/*       <Card>
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
            {(
              Object.entries(preferences) as [
                "emailNotifications" | "pushNotifications" | "smsNotifications",
                UserSettings[
                  | "emailNotifications"
                  | "pushNotifications"
                  | "smsNotifications"],
              ][]
            ).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {key === "emailNotifications"
                      ? "Notificações por E-mail"
                      : key === "pushNotifications"
                        ? "Notificações Push"
                        : key === "smsNotifications"
                          ? "Alertas por telefone"
                          : "Ofertas especiais e novidades"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {key === "emailNotifications"
                      ? "Receba atualizações importantes por e-mail"
                      : key === "pushNotifications"
                        ? "Notificações em tempo real no navegador"
                        : key === "smsNotifications"
                          ? "Alertas por telefone"
                          : "Ofertas especiais e novidades"}
                  </p>
                </div>
                <Switch
                  checked={value ?? false}
                  onCheckedChange={(checked) =>
                    setPreferences((prev) => ({
                      ...prev,
                      [key]: checked,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card> */}

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

export interface NotificationsSettings {
  email: boolean;
  push: boolean;
  security: boolean;
  billing: boolean;
  marketing: boolean;
}
