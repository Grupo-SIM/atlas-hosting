"use client";

import axios from "axios";
import {
  AlertTriangle,
  Camera,
  CreditCard,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Key,
  Mail,
  MapPin,
  Phone,
  Save,
  Shield,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import { useState, useTransition } from "react";
import { IMaskInput } from "react-imask";
import { saveUserBillingInfo } from "@/app/(auth)/billing/actions";
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
import { Input, inputClasses } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import type { User } from "@/lib/db/schema/tables/user";
import { formatDate } from "@/lib/utils";
import {
  changePasswordAction,
  deleteUserAccountAction,
  type ProfileUpdateMessage,
  sendEmailVerificationAction,
  updateUserProfileAction,
  updateUserProfileImageAction,
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
    address: {
      city: user.billingCity || "",
      neighborhood: user.billingNeighborhood || "",
      number: user.billingNumber || "",
      state: user.billingState || "",
      street: user.billingStreet || "",
      zipCode: user.billingZipCode || "",
    },
    document: user.billingDocument || "",
    phoneNumber: user.billingPhone || "",
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
            description: result.message,
            title: "Sucesso",
          });
          setIsEditingProfile(false);

          const updateMessage = JSON.parse(
            result.message
          ) as ProfileUpdateMessage;

          setPreferences(prev => {
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
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao salvar perfil.",
          title: "Erro",
          variant: "destructive",
        });
      }
    });
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        description: "As senhas não coincidem.",
        title: "Erro",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        description: "A nova senha deve ter pelo menos 8 caracteres.",
        title: "Erro",
        variant: "destructive",
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = await changePasswordAction(currentPassword, newPassword);

        if (result.success) {
          toast({
            description: result.message,
            title: "Sucesso",
          });
          setIsChangePasswordOpen(false);
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          toast({
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao alterar senha.",
          title: "Erro",
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
          description: result.message,
          title: result.success ? "Sucesso" : "Erro",
          variant: result.success ? "default" : "destructive",
        });
      } catch (error) {
        toast({
          description: "Erro inesperado ao enviar verificação.",
          title: "Erro",
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
            description: result.message,
            title: "Sucesso",
          });
          setIsEditingBilling(false);
        } else {
          toast({
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro ao salvar informações de cobrança.",
          title: "Erro",
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
            description: result.message,
            title: "Conta Excluída",
          });
          // Redirect to login page or home
          window.location.href = "/login";
        } else {
          toast({
            description: result.message,
            title: "Erro",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          description: "Erro inesperado ao excluir conta.",
          title: "Erro",
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
        description: "A imagem deve ter no máximo 5MB.",
        title: "Erro",
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
          description: result.message,
          title: "Sucesso",
        });
      } else {
        toast({
          description: result.message,
          title: "Erro",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        description: "Erro ao fazer upload da imagem.",
        title: "Erro",
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
            <div className="group relative">
              <label className="relative block cursor-pointer">
                <input
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={handleFileChange}
                  type="file"
                />
                <Avatar className="h-20 w-20 transition-opacity group-hover:opacity-80">
                  <AvatarImage src={user.image || undefined} />
                  <AvatarFallback className="text-lg">
                    {user.name
                      .split(" ")
                      .map(n => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                {isUploading && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                )}

                <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border bg-background shadow-sm transition-colors group-hover:bg-accent">
                  <Camera className="h-4 w-4" />
                </div>
              </label>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{user.name}</h3>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="outline">
                  {user.organizationRole === "admin"
                    ? "Administrador"
                    : user.organizationRole === "developer"
                      ? "Desenvolvedor"
                      : "Membro"}
                </Badge>
                {user.emailVerified && (
                  <Badge
                    className="bg-green-500/10 text-green-700"
                    variant="secondary"
                  >
                    <Mail className="mr-1 h-3 w-3" />
                    E-mail Verificado
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome Completo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    id="displayName"
                    onChange={e => setUserName(e.target.value)}
                    readOnly={!isEditingProfile}
                    value={isEditingProfile ? userName : user.name}
                  />
                  {!isEditingProfile && (
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      size="sm"
                      variant="outline"
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
                    className="flex-1"
                    id="emailAddress"
                    readOnly
                    type="email"
                    value={user.email}
                  />
                  {!user.emailVerified && (
                    <Button
                      disabled={isPending}
                      onClick={handleEmailVerification}
                      size="sm"
                      variant="outline"
                    >
                      {isPending ? "Enviando..." : "Verificar"}
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground text-xs">
                  Para alterar seu email, use a seção "Alterar Email" abaixo.
                </p>
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex gap-2">
                <Button disabled={isPending} onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  {isPending ? "Salvando..." : "Salvar Alterações"}
                </Button>
                <Button
                  disabled={isPending}
                  onClick={() => {
                    setUserName(user.name);
                    setIsEditingProfile(false);
                  }}
                  variant="outline"
                >
                  <X className="mr-2 h-4 w-4" />
                  Cancelar
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Membro desde</Label>
                <Input readOnly value={formatDate(user.createdAt)} />
              </div>
              <div className="space-y-2">
                <Label>ID do Usuário</Label>
                <Input className="font-mono text-sm" readOnly value={user.id} />
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
                onClick={() => setIsEditingBilling(true)}
                size="sm"
                variant="outline"
              >
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-medium text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  CPF ou CNPJ
                </Label>
                <IMaskInput
                  className={inputClasses}
                  mask={[
                    { mask: "000.000.000-00" },
                    { mask: "00.000.000/0000-00" },
                  ]}
                  onAccept={value =>
                    setBillingInfo({ ...billingInfo, document: value })
                  }
                  placeholder="000.000.000-00"
                  readOnly={!isEditingBilling}
                  value={billingInfo.document}
                />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-medium text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  Telefone de Contato
                </Label>
                <IMaskInput
                  className={inputClasses}
                  mask="(00) 00000-0000"
                  onAccept={value =>
                    setBillingInfo({ ...billingInfo, phoneNumber: value })
                  }
                  placeholder="(00) 00000-0000"
                  readOnly={!isEditingBilling}
                  value={billingInfo.phoneNumber}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 font-medium text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  CEP
                </Label>
                <IMaskInput
                  className={inputClasses}
                  mask="00000-000"
                  onAccept={value => {
                    const digits = value.replace(/\D/g, "");
                    setBillingInfo(prev => ({
                      ...prev,
                      address: { ...prev.address, zipCode: digits },
                    }));

                    if (digits && digits.length === 8) {
                      (async () => {
                        try {
                          const { data } = await axios.get(
                            `https://opencep.com/v1/${digits}.json`
                          );
                          if (data && !data.error) {
                            setBillingInfo(prev => ({
                              ...prev,
                              address: {
                                ...prev.address,
                                city: data.localidade || prev.address.city,
                                neighborhood:
                                  data.bairro || prev.address.neighborhood,
                                state: data.uf || prev.address.state,
                                street: data.logradouro || prev.address.street,
                                zipCode: digits,
                              },
                            }));
                          }
                        } catch (error) {
                          console.error("Error fetching CEP:", error);
                        }
                      })();
                    }
                  }}
                  placeholder="00000-000"
                  readOnly={!isEditingBilling}
                  unmask={true}
                  value={billingInfo.address.zipCode}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4 border-border/50 border-t pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label className="font-medium text-muted-foreground">Rua</Label>
                <Input
                  className="bg-muted/30"
                  onChange={e =>
                    setBillingInfo({
                      ...billingInfo,
                      address: {
                        ...billingInfo.address,
                        street: e.target.value,
                      },
                    })
                  }
                  placeholder="Nome da rua"
                  readOnly={!isEditingBilling}
                  value={billingInfo.address.street}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-muted-foreground">
                  Número
                </Label>
                <Input
                  className="bg-muted/30"
                  onChange={e =>
                    setBillingInfo({
                      ...billingInfo,
                      address: {
                        ...billingInfo.address,
                        number: e.target.value,
                      },
                    })
                  }
                  placeholder="123"
                  readOnly={!isEditingBilling}
                  value={billingInfo.address.number}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label className="font-medium text-muted-foreground">
                  Bairro
                </Label>
                <Input
                  className="bg-muted/30"
                  onChange={e =>
                    setBillingInfo({
                      ...billingInfo,
                      address: {
                        ...billingInfo.address,
                        neighborhood: e.target.value,
                      },
                    })
                  }
                  placeholder="Nome do bairro"
                  readOnly={!isEditingBilling}
                  value={billingInfo.address.neighborhood}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-muted-foreground">
                  Cidade
                </Label>
                <Input
                  className="bg-muted/30"
                  onChange={e =>
                    setBillingInfo({
                      ...billingInfo,
                      address: { ...billingInfo.address, city: e.target.value },
                    })
                  }
                  placeholder="Nome da cidade"
                  readOnly={!isEditingBilling}
                  value={billingInfo.address.city}
                />
              </div>
              <div className="space-y-2">
                <Label className="font-medium text-muted-foreground">
                  Estado
                </Label>
                <Input
                  className="bg-muted/30"
                  maxLength={2}
                  onChange={e =>
                    setBillingInfo({
                      ...billingInfo,
                      address: {
                        ...billingInfo.address,
                        state: e.target.value,
                      },
                    })
                  }
                  placeholder="SP"
                  readOnly={!isEditingBilling}
                  value={billingInfo.address.state}
                />
              </div>
            </div>
          </div>

          {isEditingBilling && (
            <div className="flex gap-2 pt-4">
              <Button disabled={isPending} onClick={handleSaveBilling}>
                <Save className="mr-2 h-4 w-4" />
                {isPending ? "Salvando..." : "Salvar Dados de Cobrança"}
              </Button>
              <Button
                disabled={isPending}
                onClick={() => {
                  setBillingInfo({
                    address: {
                      city: user.billingCity || "",
                      neighborhood: user.billingNeighborhood || "",
                      number: user.billingNumber || "",
                      state: user.billingState || "",
                      street: user.billingStreet || "",
                      zipCode: user.billingZipCode || "",
                    },
                    document: user.billingDocument || "",
                    phoneNumber: user.billingPhone || "",
                  });
                  setIsEditingBilling(false);
                }}
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Email Section */}
      {/*   <ChangeEmailSection user={user} /> */}

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
          <div className="flex items-center justify-between rounded-lg border bg-card/50 p-4">
            <div>
              <h4 className="font-medium">Alterar Senha</h4>
              <p className="text-muted-foreground text-sm">
                Atualize a senha usada para acessar sua conta
              </p>
            </div>
            <Dialog
              onOpenChange={setIsChangePasswordOpen}
              open={isChangePasswordOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Key className="mr-2 h-4 w-4" />
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
                <form className="space-y-4" onSubmit={handleChangePassword}>
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Senha Atual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                      />
                      <Button
                        className="absolute top-0 right-0 h-full px-3"
                        onClick={() =>
                          setShowCurrentPassword(!showCurrentPassword)
                        }
                        size="sm"
                        type="button"
                        variant="ghost"
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
                        onChange={e => setNewPassword(e.target.value)}
                        required
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                      />
                      <Button
                        className="absolute top-0 right-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        size="sm"
                        type="button"
                        variant="ghost"
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
                        onChange={e => setConfirmPassword(e.target.value)}
                        required
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                      />
                      <Button
                        className="absolute top-0 right-0 h-full px-3"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full" disabled={isPending} type="submit">
                    {isPending ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

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
            <div className="flex items-center justify-between rounded-lg border border-destructive bg-destructive/5 p-4">
              <div>
                <h4 className="font-medium">Excluir Conta</h4>
                <p className="text-muted-foreground text-sm">
                  Excluir permanentemente sua conta e todos os dados associados
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
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
                      disabled={isPending}
                      onClick={handleDeleteAccount}
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
