"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Shield,
  Globe,
  Palette,
  Database,
  Save,
  AlertTriangle,
} from "lucide-react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    billing: true,
    security: true,
    maintenance: false,
  });

  const [generalSettings, setGeneralSettings] = useState({
    timezone: "America/Sao_Paulo",
    language: "pt-BR",
    dateFormat: "DD/MM/YYYY",
    theme: "system",
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: "30",
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Configurações Regionais
                </CardTitle>
                <CardDescription>
                  Configure sua localização e preferências regionais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuso Horário</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        timezone: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Sao_Paulo">
                        América/São Paulo (GMT-3)
                      </SelectItem>
                      <SelectItem value="America/New_York">
                        América/Nova York (GMT-5)
                      </SelectItem>
                      <SelectItem value="Europe/London">
                        Europa/Londres (GMT+0)
                      </SelectItem>
                      <SelectItem value="Asia/Tokyo">
                        Ásia/Tóquio (GMT+9)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select
                    value={generalSettings.language}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        language: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Formato de Data</Label>
                  <Select
                    value={generalSettings.dateFormat}
                    onValueChange={(value) =>
                      setGeneralSettings({
                        ...generalSettings,
                        dateFormat: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência da interface
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Tema</Label>
                  <Select
                    value={generalSettings.theme}
                    onValueChange={(value) =>
                      setGeneralSettings({ ...generalSettings, theme: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Modo de Visualização</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="border rounded-lg p-3 cursor-pointer hover:border-primary">
                      <div className="h-20 bg-muted rounded mb-2" />
                      <p className="text-xs text-center">Compacto</p>
                    </div>
                    <div className="border-2 border-primary rounded-lg p-3 cursor-pointer">
                      <div className="h-20 bg-muted rounded mb-2" />
                      <p className="text-xs text-center">Padrão</p>
                    </div>
                    <div className="border rounded-lg p-3 cursor-pointer hover:border-primary">
                      <div className="h-20 bg-muted rounded mb-2" />
                      <p className="text-xs text-center">Amplo</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button>
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Preferências de Notificação
              </CardTitle>
              <CardDescription>
                Configure como e quando você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações por E-mail</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba atualizações importantes por e-mail
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações Push</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações em tempo real no navegador
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Notificações SMS</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba alertas críticos por SMS
                  </p>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, sms: checked })
                  }
                />
              </div>

              <hr />

              <div className="space-y-4">
                <h4 className="font-medium">Tipos de Notificação</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Faturamento</span>
                    <p className="text-xs text-muted-foreground">
                      Lembretes de vencimento e confirmações de pagamento
                    </p>
                  </div>
                  <Switch
                    checked={notifications.billing}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, billing: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Segurança</span>
                    <p className="text-xs text-muted-foreground">
                      Alertas de login e atividades suspeitas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={(checked) =>
                      setNotifications({ ...notifications, security: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-medium">Manutenção</span>
                    <p className="text-xs text-muted-foreground">
                      Notificações sobre manutenções programadas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.maintenance}
                    onCheckedChange={(checked) =>
                      setNotifications({
                        ...notifications,
                        maintenance: checked,
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configurações de Segurança
              </CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    Autenticação de Dois Fatores (2FA)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Desabilitado</Badge>
                  <Button variant="outline" size="sm">
                    Configurar
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sessões Ativas</h4>
                  <p className="text-sm text-muted-foreground">
                    Visualizar e gerenciar dispositivos conectados
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Gerenciar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Chaves API</h4>
                  <p className="text-sm text-muted-foreground">
                    Gerencie suas chaves de API
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Ver Chaves
                </Button>
              </div>

              <div className="border rounded-lg p-4 bg-yellow-50 dark:bg-yellow-900/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Recomendação de Segurança
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Habilite a autenticação de dois fatores para maior
                      segurança da sua conta.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Configurações de Backup
              </CardTitle>
              <CardDescription>
                Configure backups automáticos dos seus dados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Backup Automático</h4>
                  <p className="text-sm text-muted-foreground">
                    Faça backup automático dos seus dados
                  </p>
                </div>
                <Switch
                  checked={backupSettings.autoBackup}
                  onCheckedChange={(checked) =>
                    setBackupSettings({
                      ...backupSettings,
                      autoBackup: checked,
                    })
                  }
                />
              </div>

              {backupSettings.autoBackup && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequência do Backup</Label>
                    <Select
                      value={backupSettings.backupFrequency}
                      onValueChange={(value) =>
                        setBackupSettings({
                          ...backupSettings,
                          backupFrequency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diário</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention">
                      Período de Retenção (dias)
                    </Label>
                    <Input
                      id="retention"
                      type="number"
                      value={backupSettings.retentionDays}
                      onChange={(e) =>
                        setBackupSettings({
                          ...backupSettings,
                          retentionDays: e.target.value,
                        })
                      }
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Backup Manual</h4>
                  <p className="text-sm text-muted-foreground">
                    Faça um backup manual dos seus dados agora
                  </p>
                </div>
                <Button variant="outline">Fazer Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da API</CardTitle>
              <CardDescription>
                Gerencie suas chaves de API e webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Chaves de API</h4>
                  <p className="text-sm text-muted-foreground">
                    Gerencie acesso programático à sua conta
                  </p>
                </div>
                <Button variant="outline">Nova Chave</Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook">URL do Webhook</Label>
                <Input id="webhook" placeholder="https://example.com/webhook" />
                <p className="text-xs text-muted-foreground">
                  Receba notificações de eventos em tempo real
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiDocs">Documentação</Label>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Consulte nossa documentação da API para integrar com seus
                    sistemas.
                  </p>
                  <Button variant="link" className="p-0 h-auto text-sm">
                    Ver Documentação →
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
