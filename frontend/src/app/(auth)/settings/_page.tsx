"use client";

import {
  AlertTriangle,
  Bell,
  Database,
  Globe,
  Palette,
  Save,
  Shield,
} from "lucide-react";
import { useState } from "react";
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

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    billing: true,
    email: true,
    maintenance: false,
    push: true,
    security: true,
    sms: false,
  });

  const [generalSettings, setGeneralSettings] = useState({
    dateFormat: "DD/MM/YYYY",
    language: "pt-BR",
    theme: "system",
    timezone: "America/Sao_Paulo",
  });

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: "daily",
    retentionDays: "30",
  });

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
          Configurações
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <Tabs className="space-y-6" defaultValue="general">
        <TabsList className="flex h-auto w-full flex-wrap gap-1">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-6" value="general">
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
                    onValueChange={value =>
                      setGeneralSettings({
                        ...generalSettings,
                        timezone: value,
                      })
                    }
                    value={generalSettings.timezone}
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
                    onValueChange={value =>
                      setGeneralSettings({
                        ...generalSettings,
                        language: value,
                      })
                    }
                    value={generalSettings.language}
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
                    onValueChange={value =>
                      setGeneralSettings({
                        ...generalSettings,
                        dateFormat: value,
                      })
                    }
                    value={generalSettings.dateFormat}
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
                    onValueChange={value =>
                      setGeneralSettings({ ...generalSettings, theme: value })
                    }
                    value={generalSettings.theme}
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
                    <div className="cursor-pointer rounded-lg border p-3 hover:border-primary">
                      <div className="mb-2 h-20 rounded bg-muted" />
                      <p className="text-center text-xs">Compacto</p>
                    </div>
                    <div className="cursor-pointer rounded-lg border-2 border-primary p-3">
                      <div className="mb-2 h-20 rounded bg-muted" />
                      <p className="text-center text-xs">Padrão</p>
                    </div>
                    <div className="cursor-pointer rounded-lg border p-3 hover:border-primary">
                      <div className="mb-2 h-20 rounded bg-muted" />
                      <p className="text-center text-xs">Amplo</p>
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

        <TabsContent className="space-y-6" value="notifications">
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
                  <h4 className="font-medium">Notificações Push</h4>
                  <p className="text-muted-foreground text-sm">
                    Receba notificações em tempo real no navegador
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={checked =>
                    setNotifications({ ...notifications, push: checked })
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

              <hr />

              <div className="space-y-4">
                <h4 className="font-medium">Tipos de Notificação</h4>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">Faturamento</span>
                    <p className="text-muted-foreground text-xs">
                      Lembretes de vencimento e confirmações de pagamento
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
                    <span className="font-medium text-sm">Segurança</span>
                    <p className="text-muted-foreground text-xs">
                      Alertas de login e atividades suspeitas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.security}
                    onCheckedChange={checked =>
                      setNotifications({ ...notifications, security: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm">Manutenção</span>
                    <p className="text-muted-foreground text-xs">
                      Notificações sobre manutenções programadas
                    </p>
                  </div>
                  <Switch
                    checked={notifications.maintenance}
                    onCheckedChange={checked =>
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

        <TabsContent className="space-y-6" value="security">
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
                  <p className="text-muted-foreground text-sm">
                    Adicione uma camada extra de segurança
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Desabilitado</Badge>
                  <Button size="sm" variant="outline">
                    Configurar
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Sessões Ativas</h4>
                  <p className="text-muted-foreground text-sm">
                    Visualizar e gerenciar dispositivos conectados
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Gerenciar
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Chaves API</h4>
                  <p className="text-muted-foreground text-sm">
                    Gerencie suas chaves de API
                  </p>
                </div>
                <Button size="sm" variant="outline">
                  Ver Chaves
                </Button>
              </div>

              <div className="rounded-lg border bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-0.5 h-5 w-5 text-yellow-600" />
                  <div>
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                      Recomendação de Segurança
                    </h4>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                      Habilite a autenticação de dois fatores para maior
                      segurança da sua conta.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="backup">
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
                  <p className="text-muted-foreground text-sm">
                    Faça backup automático dos seus dados
                  </p>
                </div>
                <Switch
                  checked={backupSettings.autoBackup}
                  onCheckedChange={checked =>
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
                      onValueChange={value =>
                        setBackupSettings({
                          ...backupSettings,
                          backupFrequency: value,
                        })
                      }
                      value={backupSettings.backupFrequency}
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
                      onChange={e =>
                        setBackupSettings({
                          ...backupSettings,
                          retentionDays: e.target.value,
                        })
                      }
                      type="number"
                      value={backupSettings.retentionDays}
                    />
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Backup Manual</h4>
                  <p className="text-muted-foreground text-sm">
                    Faça um backup manual dos seus dados agora
                  </p>
                </div>
                <Button variant="outline">Fazer Backup</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-6" value="api">
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
                  <p className="text-muted-foreground text-sm">
                    Gerencie acesso programático à sua conta
                  </p>
                </div>
                <Button variant="outline">Nova Chave</Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="webhook">URL do Webhook</Label>
                <Input id="webhook" placeholder="https://example.com/webhook" />
                <p className="text-muted-foreground text-xs">
                  Receba notificações de eventos em tempo real
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiDocs">Documentação</Label>
                <div className="text-muted-foreground text-sm">
                  <p>
                    Consulte nossa documentação da API para integrar com seus
                    sistemas.
                  </p>
                  <Button className="h-auto p-0 text-sm" variant="link">
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
