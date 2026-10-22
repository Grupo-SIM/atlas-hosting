"use client";

import { Edit, Save } from "lucide-react";
import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    address: "Rua das Flores, 123",
    city: "São Paulo",
    company: "Minha Empresa LTDA",
    email: "joao@example.com",
    name: "João Silva",
    phone: "(11) 98765-4321",
    state: "SP",
    zipCode: "01234-567",
  });

  const [notifications, setNotifications] = useState({
    billing: true,
    email: true,
    maintenance: true,
    sms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    // Here you would typically save to the backend
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
            Perfil
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gerencie suas informações pessoais e preferências
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          <Edit className="mr-2 h-4 w-4" />
          {isEditing ? "Cancelar" : "Editar Perfil"}
        </Button>
      </div>

      <Tabs className="space-y-6" defaultValue="personal">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="personal">Informações Pessoais</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="billing">Faturamento</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="personal">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>
                  Atualize seus dados cadastrais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="mb-6 flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src="" />
                      <AvatarFallback className="text-lg">
                        {formData.name
                          .split(" ")
                          .map(n => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <Button size="sm" variant="outline">
                        Alterar Foto
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        disabled={!isEditing}
                        id="name"
                        onChange={e =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        value={formData.name}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input
                        disabled={!isEditing}
                        id="email"
                        onChange={e =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        type="email"
                        value={formData.email}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        disabled={!isEditing}
                        id="phone"
                        onChange={e =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        value={formData.phone}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        disabled={!isEditing}
                        id="company"
                        onChange={e =>
                          setFormData({ ...formData, company: e.target.value })
                        }
                        value={formData.company}
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <Button className="w-full" type="submit">
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>
                  Informações de endereço para faturamento
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    disabled={!isEditing}
                    id="address"
                    onChange={e =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    value={formData.address}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade</Label>
                    <Input
                      disabled={!isEditing}
                      id="city"
                      onChange={e =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      value={formData.city}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado</Label>
                    <Select disabled={!isEditing} value={formData.state}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">São Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipCode">CEP</Label>
                  <Input
                    disabled={!isEditing}
                    id="zipCode"
                    onChange={e =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    value={formData.zipCode}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent className="space-y-6" value="security">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                  <p className="text-muted-foreground text-sm">
                    Adicione uma camada extra de segurança à sua conta
                  </p>
                </div>
                <Badge variant="secondary">Desabilitado</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Alterar Senha</h4>
                  <p className="text-muted-foreground text-sm">
                    Última alteração: 30 dias atrás
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Alterar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sessões Ativas</h4>
                  <p className="text-muted-foreground text-sm">
                    Gerencie dispositivos conectados
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver Sessões
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificação</CardTitle>
              <CardDescription>
                Configure como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações por E-mail</h4>
                  <p className="text-muted-foreground text-sm">
                    Receba atualizações importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações SMS</h4>
                  <p className="text-muted-foreground text-sm">
                    Receba alertas críticos por SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, sms: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Lembretes de Faturamento</h4>
                  <p className="text-muted-foreground text-sm">
                    Lembretes antes do vencimento das faturas
                  </p>
                </div>
                <Switch
                  checked={notifications.billing}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, billing: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Alertas de Manutenção</h4>
                  <p className="text-muted-foreground text-sm">
                    Notificações sobre manutenções programadas
                  </p>
                </div>
                <Switch
                  checked={notifications.maintenance}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, maintenance: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Informações de Faturamento</CardTitle>
              <CardDescription>
                Gerencie suas informações de pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Método de Pagamento Principal</h4>
                  <p className="text-muted-foreground text-sm">
                    Cartão terminado em 4242
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Alterar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Endereço de Faturamento</h4>
                  <p className="text-muted-foreground text-sm">
                    {formData.address}, {formData.city} - {formData.state}
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Editar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Histórico de Faturas</h4>
                  <p className="text-muted-foreground text-sm">
                    Visualizar todas as faturas
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver Histórico
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
