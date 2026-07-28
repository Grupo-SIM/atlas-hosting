"use client";

import {
  AlertCircle,
  CheckCircle,
  Globe,
  Loader2,
  Mail,
  Plus,
  Server,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Domain {
  id: string;
  name: string;
  pleskId?: number;
  status: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface EmailAccountSetupProps {
  domains: Domain[];
  user: User;
}

export function EmailAccountSetup({ domains, user }: EmailAccountSetupProps) {
  const [selectedTab, setSelectedTab] = useState("plesk");
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    confirmPassword: "",
    displayName: "",
    domain: "",
    emailAddress: "",
    password: "",
    quota: "1024",
  });

  const pleskDomains = domains.filter(domain => domain.pleskId);
  const regularDomains = domains.filter(domain => !domain.pleskId);

  const handleCreatePleskAccount = async () => {
    if (!formData.domain || !formData.emailAddress || !formData.password) {
      toast.error("Todos os campos obrigatórios devem ser preenchidos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/email/plesk/create", {
        body: JSON.stringify({
          displayName: formData.displayName,
          domainId: formData.domain,
          emailAddress: formData.emailAddress,
          password: formData.password,
          quota: Number.parseInt(formData.quota, 10),
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      });

      if (response.ok) {
        toast.success("Conta de e-mail criada com sucesso!");
        // Refresh the page to load the email client
        window.location.reload();
      } else {
        const error = await response.json();
        toast.error(error.message || "Erro ao criar conta de e-mail");
      }
    } catch (error) {
      console.error("Error creating email account:", error);
      toast.error("Erro inesperado ao criar conta de e-mail");
    } finally {
      setIsCreating(false);
    }
  };

  const handleConnectZoho = async () => {
    try {
      const response = await fetch("/api/oauth/zoho/setup");
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else if (data.status === "configured") {
        toast.success("Zoho Mail já está configurado");
        window.location.reload();
      }
    } catch (error) {
      console.error("Error connecting to Zoho:", error);
      toast.error("Erro ao conectar com Zoho Mail");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Configurar Nova Conta de E-mail
        </CardTitle>
        <CardDescription>
          Escolha como você gostaria de configurar seu e-mail profissional
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs onValueChange={setSelectedTab} value={selectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger className="flex items-center gap-2" value="plesk">
              <Server className="h-4 w-4" />
              Plesk Mail
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="zoho">
              <Mail className="h-4 w-4" />
              Zoho Mail
            </TabsTrigger>
            <TabsTrigger className="flex items-center gap-2" value="custom">
              <Settings className="h-4 w-4" />
              Personalizado
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-6 space-y-6" value="plesk">
            {pleskDomains.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você precisa ter pelo menos um domínio configurado no Plesk
                  para criar contas de e-mail.
                  <Button className="ml-1 h-auto p-0" variant="link">
                    Adicione um domínio
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domínio</Label>
                    <Select
                      onValueChange={value =>
                        setFormData({ ...formData, domain: value })
                      }
                      value={formData.domain}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um domínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {pleskDomains.map(domain => (
                          <SelectItem key={domain.id} value={domain.id}>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              {domain.name}
                              <Badge className="text-xs" variant="secondary">
                                Plesk
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emailAddress">Endereço de E-mail</Label>
                    <div className="flex">
                      <Input
                        className="rounded-r-none"
                        id="emailAddress"
                        onChange={e =>
                          setFormData({
                            ...formData,
                            emailAddress: e.target.value,
                          })
                        }
                        placeholder="usuario"
                        value={formData.emailAddress}
                      />
                      <div className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-muted-foreground text-sm">
                        @
                        {pleskDomains.find(d => d.id === formData.domain)
                          ?.name || "dominio.com"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      onChange={e =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      placeholder="Digite uma senha forte"
                      type="password"
                      value={formData.password}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      onChange={e =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      placeholder="Confirme a senha"
                      type="password"
                      value={formData.confirmPassword}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nome de Exibição</Label>
                    <Input
                      id="displayName"
                      onChange={e =>
                        setFormData({
                          ...formData,
                          displayName: e.target.value,
                        })
                      }
                      placeholder={user.name}
                      value={formData.displayName}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quota">Cota de Armazenamento (MB)</Label>
                    <Select
                      onValueChange={value =>
                        setFormData({ ...formData, quota: value })
                      }
                      value={formData.quota}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1024">1 GB</SelectItem>
                        <SelectItem value="2048">2 GB</SelectItem>
                        <SelectItem value="5120">5 GB</SelectItem>
                        <SelectItem value="10240">10 GB</SelectItem>
                        <SelectItem value="-1">Ilimitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-4">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-sm">
                    <p className="font-medium">Recursos inclusos</p>
                    <p className="text-muted-foreground">
                      Webmail, IMAP/POP3, SMTP, filtros de spam, e backup
                      automático
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={
                    isCreating ||
                    !formData.domain ||
                    !formData.emailAddress ||
                    !formData.password
                  }
                  onClick={handleCreatePleskAccount}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando Conta...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Criar Conta de E-mail
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent className="mt-6 space-y-6" value="zoho">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  Zoho Mail Professional
                </h3>
                <p className="text-muted-foreground">
                  E-mail profissional com recursos avançados na nuvem
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  25 GB de armazenamento por usuário
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  Interface web moderna e aplicativos móveis
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  Calendário, contatos e tarefas integrados
                </span>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">
                  Proteção avançada contra spam e vírus
                </span>
              </div>
            </div>

            <Button className="w-full" onClick={handleConnectZoho} size="lg">
              <Mail className="mr-2 h-4 w-4" />
              Conectar com Zoho Mail
            </Button>
          </TabsContent>

          <TabsContent className="mt-6 space-y-6" value="custom">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Configure manualmente servidores IMAP/SMTP de qualquer provedor
                de e-mail. Esta opção é para usuários avançados.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customEmail">Endereço de E-mail</Label>
                <Input
                  id="customEmail"
                  placeholder="usuario@seudominio.com"
                  type="email"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="imapHost">Servidor IMAP</Label>
                  <Input id="imapHost" placeholder="imap.seudominio.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imapPort">Porta IMAP</Label>
                  <Input id="imapPort" placeholder="993" />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input id="smtpHost" placeholder="smtp.seudominio.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Porta SMTP</Label>
                  <Input id="smtpPort" placeholder="587" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword">Senha</Label>
                <Input
                  id="emailPassword"
                  placeholder="Senha da conta de e-mail"
                  type="password"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="useSSL" />
                <Label className="text-sm" htmlFor="useSSL">
                  Usar SSL/TLS (recomendado)
                </Label>
              </div>

              <Button className="w-full" variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Salvar Configuração Personalizada
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
