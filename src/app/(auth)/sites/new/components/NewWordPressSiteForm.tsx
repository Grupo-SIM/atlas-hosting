"use client";

import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowRight,
  Check,
  Loader2,
  WholeWord,
  Globe,
  Settings,
  Package,
  Terminal,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type { DomainListItem } from "@/lib/server/apis/namecheap/types";
import Link from "next/link";

const recommendedPlugins = [
  {
    id: "woocommerce",
    label: "WooCommerce - eCommerce Platform",
    description: "Add a complete online store to your site",
  },
  {
    id: "yoast",
    label: "Yoast SEO - Search Engine Optimization",
    description: "Improve your site's visibility in search engines",
  },
  {
    id: "elementor",
    label: "Elementor - Page Builder",
    description: "Create beautiful pages with drag & drop",
  },
  {
    id: "wpforms",
    label: "WPForms Lite - Contact Forms",
    description: "Add professional contact forms easily",
  },
  {
    id: "wordfence",
    label: "Wordfence Security",
    description: "Protect your site with advanced security features",
  },
];

interface FormData {
  domain: string;
  siteName: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string; // Added adminEmail
  selectedPlugins: string[];
}

interface NewWordPressSiteFormProps {
  domains: (DomainListItem & { inPlesk: boolean })[];
  userEmail?: string; // Optional: prefill admin email
}

export function NewWordPressSiteForm({
  domains,
  userEmail,
}: NewWordPressSiteFormProps) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installationProgress, setInstallationProgress] = useState(0);
  const [installationMessage, setInstallationMessage] = useState(
    "Iniciando instalação..."
  );
  const [isComplete, setIsComplete] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    domain: "",
    siteName: "",
    adminUsername: "admin", // Default admin username
    adminPassword: "",
    adminEmail: userEmail || "", // Prefill if userEmail is provided
    selectedPlugins: [],
  });

  const eventSource = useRef<EventSource | null>(null);

  const handlePluginToggle = (pluginId: string) => {
    setFormData((prev) => ({
      ...prev,
      selectedPlugins: prev.selectedPlugins.includes(pluginId)
        ? prev.selectedPlugins.filter((id) => id !== pluginId)
        : [...prev.selectedPlugins, pluginId],
    }));
  };

  const handleInstall = useCallback(() => {
    if (!formData.domain) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um domínio.",
        variant: "destructive",
      });
      return;
    }
    if (
      !(
        formData.siteName &&
        formData.adminUsername &&
        formData.adminPassword &&
        formData.adminEmail
      )
    ) {
      toast({
        title: "Erro",
        description:
          "Por favor, preencha todos os campos de configuração do site.",
        variant: "destructive",
      });
      return;
    }

    setIsInstalling(true);
    setInstallationProgress(0);
    setInstallationMessage("Iniciando instalação...");

    if (eventSource.current) {
      eventSource.current.close();
    }
    // TODO: Add selectedPlugins to the API call if the backend supports it
    const apiUrl = `/api/wp-install?domain=${formData.domain}&admin_username=${formData.adminUsername}&admin_password=${encodeURIComponent(formData.adminPassword)}&site_name=${encodeURIComponent(formData.siteName)}&admin_email=${encodeURIComponent(formData.adminEmail)}`;

    eventSource.current = new EventSource(apiUrl);

    eventSource.current.onopen = () => {
      setInstallationMessage("Conexão estabelecida. Iniciando processo...");
      setInstallationProgress(5);
    };

    eventSource.current.onmessage = (event) => {
      const rawData = event.data as string;
      try {
        const parsedData = JSON.parse(rawData);
        const { type, message, error, details } = parsedData;

        setInstallationMessage(message || "Processando...");
        // Simple progress simulation based on messages
        setInstallationProgress((prev) => Math.min(95, prev + 10));

        if (type === "ERROR") {
          toast({
            title: message || "Erro na Instalação",
            description: error || details || "Ocorreu um erro.",
            variant: "destructive",
          });
          setIsInstalling(false);
          eventSource.current?.close();
        } else if (type === "SUCCESS") {
          setInstallationProgress(100);
          toast({
            title: "Instalação Concluída!",
            description:
              message || "Seu site WordPress foi instalado com sucesso.",
            variant: "default",
          });
          setTimeout(() => {
            setIsComplete(true);
            setIsInstalling(false);
          }, 500);
          eventSource.current?.close();
        }
      } catch (_e) {
        setInstallationMessage(rawData || "Atualizando status...");
        setInstallationProgress((prev) => Math.min(95, prev + 5));
      }
    };

    eventSource.current.onerror = (_err) => {
      toast({
        title: "Erro de Conexão",
        description:
          "Não foi possível conectar ao servidor para atualizações em tempo real.",
        variant: "destructive",
      });
      setIsInstalling(false);
      eventSource.current?.close();
    };
  }, [formData, toast]);

  const StepIcon = ({ step }: { step: number }) => {
    switch (step) {
      case 1:
        return <Globe className="h-5 w-5" />;
      case 2:
        return <Settings className="h-5 w-5" />;
      case 3:
        return <Package className="h-5 w-5" />; // Or use Check if it's the final confirmation
      default:
        return null;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
              step === currentStep
                ? "bg-primary text-primary-foreground scale-110"
                : step < currentStep
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {step < currentStep ? (
              <Check className="h-5 w-5" />
            ) : (
              <StepIcon step={step} />
            )}
          </div>
          {step < 3 && (
            <div
              className={`w-16 md:w-24 h-0.5 transition-colors duration-300 ${
                step < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1: // Domain Selection
        return (
          <div className="space-y-6 animate-in slide-in-from-right-1/4 duration-500">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Escolha seu Domínio</h2>
              <p className="text-sm text-muted-foreground">
                Selecione onde você quer instalar o WordPress
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="domainName">Nome do Domínio</Label>
                <Select
                  value={formData.domain}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, domain: value }))
                  }
                  disabled={isInstalling}
                >
                  <SelectTrigger id="domainName" className="h-12">
                    <SelectValue placeholder="Selecione um domínio" />
                  </SelectTrigger>
                  <SelectContent>
                    {domains.map((domain) => (
                      <SelectItem
                        key={domain.ID}
                        value={domain.Name}
                        disabled={domain.inPlesk || isInstalling}
                      >
                        {domain.Name}
                        {domain.inPlesk && " (WordPress já instalado)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                onClick={() => setCurrentStep(2)}
                disabled={!formData.domain || isInstalling}
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 2: // Site Configuration
        return (
          <div className="space-y-6 animate-in slide-in-from-right-1/4 duration-500">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Configure seu Site</h2>
              <p className="text-sm text-muted-foreground">
                Defina as informações básicas para sua instalação WordPress
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="siteName">Nome do Site</Label>
                <Input
                  id="siteName"
                  className="h-12"
                  value={formData.siteName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      siteName: e.target.value,
                    }))
                  }
                  placeholder="Meu Site Incrível"
                  disabled={isInstalling}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="adminUsername">Usuário Admin</Label>
                  <Input
                    id="adminUsername"
                    className="h-12"
                    value={formData.adminUsername}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adminUsername: e.target.value,
                      }))
                    }
                    placeholder="admin"
                    disabled={isInstalling}
                  />
                </div>
                <div>
                  <Label htmlFor="adminPassword">Senha do Admin</Label>
                  <Input
                    id="adminPassword"
                    className="h-12"
                    type="password"
                    value={formData.adminPassword}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        adminPassword: e.target.value,
                      }))
                    }
                    placeholder="Senha forte"
                    disabled={isInstalling}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="adminEmail">Email do Admin</Label>
                <Input
                  id="adminEmail"
                  className="h-12"
                  type="email"
                  value={formData.adminEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      adminEmail: e.target.value,
                    }))
                  }
                  placeholder="admin@example.com"
                  disabled={isInstalling}
                />
              </div>
              <div className="space-y-3 pt-4">
                <div className="space-y-2">
                  <Label>Plugins Recomendados</Label>
                  <p className="text-sm text-muted-foreground">
                    Selecione plugins para instalar automaticamente
                  </p>
                </div>
                <div className="space-y-4 pt-2">
                  {recommendedPlugins.map((plugin) => (
                    <div key={plugin.id} className="flex items-start space-x-3">
                      <Checkbox
                        id={plugin.id}
                        checked={formData.selectedPlugins.includes(plugin.id)}
                        onCheckedChange={() => handlePluginToggle(plugin.id)}
                        className="mt-1"
                        disabled={isInstalling}
                      />
                      <div>
                        <label
                          htmlFor={plugin.id}
                          className="text-sm font-medium leading-  none cursor-pointer"
                        >
                          {plugin.label}
                        </label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plugin.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                disabled={isInstalling}
              >
                Voltar
              </Button>
              <Button
                size="lg"
                onClick={() => setCurrentStep(3)}
                disabled={
                  !(
                    formData.siteName &&
                    formData.adminUsername &&
                    formData.adminPassword &&
                    formData.adminEmail
                  ) || isInstalling
                }
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      case 3: // Review & Install
        return (
          <div className="space-y-6 animate-in slide-in-from-right-1/4 duration-500">
            <div className="space-y-2">
              <h2 className="text-lg font-medium">Revisar e Instalar</h2>
              <p className="text-sm text-muted-foreground">
                Verifique suas configurações antes da instalação
              </p>
            </div>
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    {[
                      { label: "Domínio", value: formData.domain },
                      { label: "Nome do Site", value: formData.siteName },
                      {
                        label: "Usuário Admin",
                        value: formData.adminUsername,
                      },
                      { label: "Email Admin", value: formData.adminEmail },
                      {
                        label: "Plugins Selecionados",
                        value: `${formData.selectedPlugins.length} plugins`,
                      },
                    ].map((item, index, arr) => (
                      <div
                        key={item.label}
                        className={`flex justify-between py-2 ${index < arr.length - 1 ? "border-b" : ""}`}
                      >
                        <span className="text-muted-foreground">
                          {item.label}
                        </span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(2)}
                disabled={isInstalling}
              >
                Voltar
              </Button>
              <Button size="lg" onClick={handleInstall} disabled={isInstalling}>
                {isInstalling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Instalando...
                  </>
                ) : (
                  <>
                    Instalar WordPress
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
            {isInstalling && (
              <div className="space-y-3 animate-in fade-in-0 duration-500 pt-4">
                <Progress value={installationProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {installationMessage} {installationProgress}%
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  if (!Array.isArray(domains) || domains.length === 0) {
    return (
      <CardContent>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Nenhum Domínio Disponível</AlertTitle>
          <AlertDescription>
            Você não possui domínios registrados em sua conta Namecheap ou todos
            os seus domínios já possuem WordPress instalado. Por favor,{" "}
            <Link
              href="/domains/register"
              className="font-medium text-primary underline underline-offset-4"
            >
              registre um novo domínio
            </Link>{" "}
            ou verifique seus sites existentes.
          </AlertDescription>
        </Alert>
      </CardContent>
    );
  }

  if (isComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-16 pb-16">
          <div className="text-center space-y-4 animate-in fade-in-0 slide-in-from-bottom-5 duration-700">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-semibold">Instalação Completa!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Seu site WordPress foi instalado com sucesso e está pronto para
              uso.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <Button variant="outline" size="lg" asChild={true}>
                <a
                  href={`https://${formData.domain}/wp-admin`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir Admin do WordPress
                </a>
              </Button>
              <Button size="lg" asChild={true}>
                <a
                  href={`https://${formData.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Visitar seu Site
                </a>
              </Button>
            </div>
            <Button size="sm" variant="link" asChild={true} className="mt-4">
              <Link href="/sites">Ver todos os sites</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <WholeWord className="h-6 w-6" />
            Instalação WordPress
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {renderStepIndicator()}
          {renderStep()}
        </CardContent>
      </Card>
      <Toaster />
    </>
  );
}
