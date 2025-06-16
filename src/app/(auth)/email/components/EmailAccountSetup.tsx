"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Mail, 
  Server, 
  Settings, 
  Plus, 
  Shield, 
  Globe,
  AlertCircle,
  CheckCircle,
  Loader2
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

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
    domain: "",
    emailAddress: "",
    password: "",
    confirmPassword: "",
    displayName: "",
    quota: "1024"
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
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: formData.domain,
          emailAddress: formData.emailAddress,
          password: formData.password,
          displayName: formData.displayName,
          quota: parseInt(formData.quota)
        })
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
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plesk" className="flex items-center gap-2">
              <Server className="h-4 w-4" />
              Plesk Mail
            </TabsTrigger>
            <TabsTrigger value="zoho" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Zoho Mail
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Personalizado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="plesk" className="space-y-6 mt-6">
            {pleskDomains.length === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Você precisa ter pelo menos um domínio configurado no Plesk para criar contas de e-mail.
                  <Button variant="link" className="p-0 h-auto ml-1">
                    Adicione um domínio
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domínio</Label>
                    <Select value={formData.domain} onValueChange={(value) => 
                      setFormData({ ...formData, domain: value })
                    }>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um domínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {pleskDomains.map((domain) => (
                          <SelectItem key={domain.id} value={domain.id}>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4" />
                              {domain.name}
                              <Badge variant="secondary" className="text-xs">
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
                        id="emailAddress"
                        value={formData.emailAddress}
                        onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                        placeholder="usuario"
                        className="rounded-r-none"
                      />
                      <div className="flex items-center px-3 border border-l-0 rounded-r-md bg-muted text-muted-foreground text-sm">
                        @{pleskDomains.find(d => d.id === formData.domain)?.name || "dominio.com"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Digite uma senha forte"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirme a senha"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Nome de Exibição</Label>
                    <Input
                      id="displayName"
                      value={formData.displayName}
                      onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                      placeholder={user.name}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quota">Cota de Armazenamento (MB)</Label>
                    <Select value={formData.quota} onValueChange={(value) => 
                      setFormData({ ...formData, quota: value })
                    }>
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

                <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-sm">
                    <p className="font-medium">Recursos inclusos</p>
                    <p className="text-muted-foreground">
                      Webmail, IMAP/POP3, SMTP, filtros de spam, e backup automático
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleCreatePleskAccount}
                  disabled={isCreating || !formData.domain || !formData.emailAddress || !formData.password}
                  className="w-full"
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

          <TabsContent value="zoho" className="space-y-6 mt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Zoho Mail Professional</h3>
                <p className="text-muted-foreground">
                  E-mail profissional com recursos avançados na nuvem
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">25 GB de armazenamento por usuário</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Interface web moderna e aplicativos móveis</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Calendário, contatos e tarefas integrados</span>
              </div>
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm">Proteção avançada contra spam e vírus</span>
              </div>
            </div>

            <Button onClick={handleConnectZoho} className="w-full" size="lg">
              <Mail className="mr-2 h-4 w-4" />
              Conectar com Zoho Mail
            </Button>
          </TabsContent>

          <TabsContent value="custom" className="space-y-6 mt-6">
            <Alert>
              <Settings className="h-4 w-4" />
              <AlertDescription>
                Configure manualmente servidores IMAP/SMTP de qualquer provedor de e-mail.
                Esta opção é para usuários avançados.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customEmail">Endereço de E-mail</Label>
                <Input
                  id="customEmail"
                  type="email"
                  placeholder="usuario@seudominio.com"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imapHost">Servidor IMAP</Label>
                  <Input
                    id="imapHost"
                    placeholder="imap.seudominio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imapPort">Porta IMAP</Label>
                  <Input
                    id="imapPort"
                    placeholder="993"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">Servidor SMTP</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.seudominio.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">Porta SMTP</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emailPassword">Senha</Label>
                <Input
                  id="emailPassword"
                  type="password"
                  placeholder="Senha da conta de e-mail"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="useSSL" />
                <Label htmlFor="useSSL" className="text-sm">
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
