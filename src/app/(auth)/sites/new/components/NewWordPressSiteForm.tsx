"use client";

import { useState, useCallback, useRef, startTransition } from "react";
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
  CheckCircle,
  Circle,
  ArrowLeft,
  Shield,
  Zap,
  Eye,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import type {
  DomainListItem,
  DomainsGetInfoCleanedResponse,
} from "@/lib/server/apis/namecheap/types";
import Link from "next/link";
import { changeSelectedDomain } from "@/app/actions";

interface FormData {
  domain: string;
  siteName: string;
  adminUsername: string;
  adminPassword: string;
  adminEmail: string;
  selectedPlugins: string[];
}

interface FormErrors {
  domain?: string;
  siteName?: string;
  adminUsername?: string;
  adminPassword?: string;
  adminEmail?: string;
}

interface NewWordPressSiteFormProps {
  domains: (DomainsGetInfoCleanedResponse & {
    inPlesk: boolean;
  })[];
  userEmail?: string;
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
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    domain: "",
    siteName: "",
    adminUsername: "admin",
    adminPassword: "",
    adminEmail: userEmail || "",
    selectedPlugins: [],
  });

  const eventSource = useRef<EventSource | null>(null);

  // Form validation
  const validateForm = () => {
    const errors: FormErrors = {};

    if (!formData.siteName.trim()) {
      errors.siteName = "Nome do site é obrigatório";
    }

    if (!formData.adminUsername.trim()) {
      errors.adminUsername = "Nome de usuário é obrigatório";
    } else if (formData.adminUsername.length < 3) {
      errors.adminUsername = "Nome de usuário deve ter pelo menos 3 caracteres";
    }

    if (!formData.adminPassword.trim()) {
      errors.adminPassword = "Senha é obrigatória";
    } else if (formData.adminPassword.length < 6) {
      errors.adminPassword = "Senha deve ter pelo menos 6 caracteres";
    }

    if (!formData.adminEmail.trim()) {
      errors.adminEmail = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
      errors.adminEmail = "Email deve ter formato válido";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    return strength;
  };

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

    const searchParams = new URLSearchParams({
      domain: formData.domain,
      admin_username: formData.adminUsername,
      admin_password: formData.adminPassword,
      site_name: formData.siteName,
      admin_email: formData.adminEmail,
      plugins: formData.selectedPlugins.join(","),
    });

    const apiUrl = `/api/wp-install-w?${searchParams.toString()}`;

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
        setInstallationProgress((prev) => Math.min(95, prev + 10));
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
        return <Globe className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
      case 2:
        return (
          <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
        );
      case 3:
        return (
          <Package className="h-8 w-8 text-purple-600 dark:text-purple-400" />
        );
      default:
        return null;
    }
  };

  const StepIconSmall = ({ step }: { step: number }) => {
    switch (step) {
      case 1:
        return <Globe className="h-5 w-5" />;
      case 2:
        return <Settings className="h-5 w-5" />;
      case 3:
        return <Package className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const stepTitles = [
    "Escolha seu Domínio",
    "Configure seu Site",
    "Revisar e Instalar",
  ];

  // Current Step Header (replaces old step indicator position)
  const renderCurrentStepHeader = () => (
    <motion.div
      layout
      className="text-center mb-8"
      key={currentStep}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-center gap-4 mb-4">
        <motion.div
          className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <StepIcon step={currentStep} />
        </motion.div>
      </div>
      <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
        {stepTitles[currentStep - 1]}
      </h1>
      <p className="text-muted-foreground mt-2 text-lg">
        {currentStep === 1 && "Selecione onde você quer instalar o WordPress"}
        {currentStep === 2 &&
          "Defina as informações básicas para sua instalação WordPress"}
        {currentStep === 3 &&
          "Verifique suas configurações antes da instalação"}
      </p>
    </motion.div>
  );

  // Step Progress Indicator (moves to where step content was)
  const renderStepIndicator = () => (
    <motion.div layout className="mb-8">
      {/* Step Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-6 left-0 w-full h-0.5 bg-gradient-to-r from-muted via-muted to-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-full"
            initial={{ width: "0%" }}
            animate={{
              width: `${((currentStep - 1) / 2) * 100}%`,
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>

        <div className="flex items-center justify-between relative">
          {[1, 2, 3].map((step) => (
            <motion.div
              key={step}
              className="flex flex-col items-center z-10"
              initial={false}
              animate={{
                scale: step === currentStep ? 1.05 : 1,
              }}
              transition={{ duration: 0.3 }}
            >
              {/* Step Circle */}
              <motion.div
                className={cn(
                  "relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 backdrop-blur-sm",
                  step === currentStep
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/30 ring-4 ring-primary/20"
                    : step < currentStep
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-background/80 text-muted-foreground border-muted-foreground/30 shadow-sm"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="sync" propagate>
                  {step < currentStep ? (
                    <motion.div
                      layout
                      key="check"
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 90 }}
                      transition={{
                        duration: 0.3,
                        type: "spring",
                        stiffness: 300,
                      }}
                    >
                      <CheckCircle className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      layout
                      key="icon"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <StepIconSmall step={step} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pulse effect for current step */}
                {step === currentStep && (
                  <motion.div
                    layout
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                )}
              </motion.div>

              {/* Step Label */}
              <motion.div
                layout
                className="mt-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: step * 0.1 }}
              >
                <div
                  className={cn(
                    "text-xs font-medium transition-colors",
                    step === currentStep
                      ? "text-primary"
                      : step < currentStep
                        ? "text-foreground"
                        : "text-muted-foreground"
                  )}
                >
                  Passo {step}
                </div>
                <div
                  className={cn(
                    "text-xs mt-1 max-w-20 transition-colors",
                    step === currentStep
                      ? "text-foreground font-medium"
                      : step < currentStep
                        ? "text-muted-foreground"
                        : "text-muted-foreground/70"
                  )}
                >
                  {stepTitles[step - 1]}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <Label
                      htmlFor="domainName"
                      className="text-base font-medium"
                    >
                      Nome do Domínio
                    </Label>
                    <Select
                      value={formData.domain}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, domain: value }))
                      }
                      disabled={isInstalling}
                    >
                      <SelectTrigger
                        id="domainName"
                        className="h-14 text-base mt-2"
                      >
                        <SelectValue placeholder="Selecione um domínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map((domain) => (
                          <SelectItem
                            key={domain.ID}
                            value={domain.DomainName}
                            disabled={domain.inPlesk || isInstalling}
                            className="py-3"
                          >
                            <div className="flex items-center gap-3">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span>{domain.DomainName}</span>
                              {domain.inPlesk && (
                                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                  WordPress já instalado
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end pt-4">
              <Button
                size="lg"
                onClick={() => setCurrentStep(2)}
                disabled={!formData.domain || isInstalling}
                className="min-w-[140px] h-12 text-base"
              >
                Continuar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-base font-medium">
                    Nome do Site
                  </Label>
                  <Input
                    id="siteName"
                    className={cn(
                      "h-12 mt-2 transition-all duration-200",
                      formErrors.siteName
                        ? "border-destructive focus:border-destructive"
                        : formData.siteName
                          ? "border-emerald-500 focus:border-emerald-500"
                          : ""
                    )}
                    value={formData.siteName}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        siteName: e.target.value,
                      }));
                      if (formErrors.siteName) {
                        setFormErrors((prev) => ({
                          ...prev,
                          siteName: undefined,
                        }));
                      }
                    }}
                    placeholder="Meu Site Incrível"
                    disabled={isInstalling}
                  />
                  {formErrors.siteName && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.siteName}
                    </motion.p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      htmlFor="adminUsername"
                      className="text-base font-medium"
                    >
                      Usuário Admin
                    </Label>
                    <Input
                      id="adminUsername"
                      className={cn(
                        "h-12 mt-2 transition-all duration-200",
                        formErrors.adminUsername
                          ? "border-destructive focus:border-destructive"
                          : formData.adminUsername &&
                              formData.adminUsername.length >= 3
                            ? "border-emerald-500 focus:border-emerald-500"
                            : ""
                      )}
                      value={formData.adminUsername}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          adminUsername: e.target.value,
                        }));
                        if (formErrors.adminUsername) {
                          setFormErrors((prev) => ({
                            ...prev,
                            adminUsername: undefined,
                          }));
                        }
                      }}
                      placeholder="admin"
                      disabled={isInstalling}
                    />
                    {formErrors.adminUsername && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.adminUsername}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="adminPassword"
                      className="text-base font-medium"
                    >
                      Senha do Admin
                    </Label>
                    <div className="relative">
                      <Input
                        id="adminPassword"
                        className={cn(
                          "h-12 mt-2 transition-all duration-200",
                          formErrors.adminPassword
                            ? "border-destructive focus:border-destructive"
                            : formData.adminPassword &&
                                formData.adminPassword.length >= 6
                              ? "border-emerald-500 focus:border-emerald-500"
                              : ""
                        )}
                        type="password"
                        value={formData.adminPassword}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            adminPassword: e.target.value,
                          }));
                          if (formErrors.adminPassword) {
                            setFormErrors((prev) => ({
                              ...prev,
                              adminPassword: undefined,
                            }));
                          }
                        }}
                        placeholder="Senha forte"
                        disabled={isInstalling}
                      />
                      {formData.adminPassword && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              getPasswordStrength(formData.adminPassword) >= 75
                                ? "bg-emerald-500"
                                : getPasswordStrength(formData.adminPassword) >=
                                    50
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                            )}
                          />
                        </motion.div>
                      )}
                    </div>
                    {formData.adminPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="space-y-1"
                      >
                        <div className="flex gap-1">
                          {[25, 50, 75, 100].map((threshold) => (
                            <div
                              key={threshold}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-colors duration-300",
                                getPasswordStrength(formData.adminPassword) >=
                                  threshold
                                  ? threshold <= 50
                                    ? "bg-red-500"
                                    : threshold <= 75
                                      ? "bg-yellow-500"
                                      : "bg-emerald-500"
                                  : "bg-muted"
                              )}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Força da senha:{" "}
                          {getPasswordStrength(formData.adminPassword) >= 75
                            ? "Forte"
                            : getPasswordStrength(formData.adminPassword) >= 50
                              ? "Média"
                              : "Fraca"}
                        </p>
                      </motion.div>
                    )}
                    {formErrors.adminPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-sm text-destructive flex items-center gap-1"
                      >
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.adminPassword}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="text-base font-medium">
                    Email do Admin
                  </Label>
                  <Input
                    id="adminEmail"
                    className={cn(
                      "h-12 mt-2 transition-all duration-200",
                      formErrors.adminEmail
                        ? "border-destructive focus:border-destructive"
                        : formData.adminEmail &&
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              formData.adminEmail
                            )
                          ? "border-emerald-500 focus:border-emerald-500"
                          : ""
                    )}
                    type="email"
                    value={formData.adminEmail}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        adminEmail: e.target.value,
                      }));
                      if (formErrors.adminEmail) {
                        setFormErrors((prev) => ({
                          ...prev,
                          adminEmail: undefined,
                        }));
                      }
                    }}
                    placeholder="admin@example.com"
                    disabled={isInstalling}
                  />
                  {formErrors.adminEmail && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-destructive flex items-center gap-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.adminEmail}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">
                      Plugins Recomendados
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Selecione plugins para instalar automaticamente
                    </p>
                  </div>
                  <div className="grid gap-3 pt-2">
                    {recommendedPlugins.map((plugin, index) => (
                      <motion.div
                        key={plugin.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={cn(
                          "group relative p-4 rounded-xl border border-border/50 transition-all duration-300 cursor-pointer hover:border-primary/30 hover:shadow-md",
                          formData.selectedPlugins.includes(plugin.id)
                            ? "bg-primary/5 border-primary/50 ring-1 ring-primary/20"
                            : "bg-background hover:bg-muted/30"
                        )}
                        onClick={() =>
                          !isInstalling && handlePluginToggle(plugin.id)
                        }
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start space-x-4">
                          <motion.div
                            className="relative mt-1"
                            animate={{
                              scale: formData.selectedPlugins.includes(
                                plugin.id
                              )
                                ? 1.1
                                : 1,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            <Checkbox
                              id={plugin.id}
                              checked={formData.selectedPlugins.includes(
                                plugin.id
                              )}
                              onCheckedChange={() =>
                                handlePluginToggle(plugin.id)
                              }
                              className="transition-all duration-200"
                              disabled={isInstalling}
                            />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <label
                              htmlFor={plugin.id}
                              className="text-sm font-semibold leading-tight cursor-pointer group-hover:text-primary transition-colors"
                            >
                              {plugin.label}
                            </label>
                            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                              {plugin.description}
                            </p>
                          </div>
                          {formData.selectedPlugins.includes(plugin.id) && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              className="flex-shrink-0"
                            >
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <CheckCircle className="h-4 w-4 text-primary" />
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Selection indicator overlay */}
                        <motion.div
                          className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 pointer-events-none"
                          animate={{
                            opacity: formData.selectedPlugins.includes(
                              plugin.id
                            )
                              ? 1
                              : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(1)}
                disabled={isInstalling}
                className="min-w-[120px] h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                size="lg"
                onClick={() => {
                  if (validateForm()) {
                    setCurrentStep(3);
                  }
                }}
                disabled={
                  !(
                    formData.siteName &&
                    formData.adminUsername &&
                    formData.adminPassword &&
                    formData.adminEmail
                  ) || isInstalling
                }
                className="min-w-[140px] h-12"
              >
                Continuar
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-8"
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {[
                    { label: "Domínio", value: formData.domain, icon: Globe },
                    {
                      label: "Nome do Site",
                      value: formData.siteName,
                      icon: WholeWord,
                    },
                    {
                      label: "Usuário Admin",
                      value: formData.adminUsername,
                      icon: Settings,
                    },
                    {
                      label: "Email Admin",
                      value: formData.adminEmail,
                      icon: Settings,
                    },
                    {
                      label: "Plugins Selecionados",
                      value: `${formData.selectedPlugins.length} plugins`,
                      icon: Package,
                    },
                  ].map((item, index, arr) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        key={item.label}
                        className={`flex items-center justify-between py-4 ${
                          index < arr.length - 1
                            ? "border-b border-border/50"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="text-muted-foreground font-medium">
                            {item.label}
                          </span>
                        </div>
                        <span className="font-semibold">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setCurrentStep(2)}
                disabled={isInstalling}
                className="min-w-[120px] h-12"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                size="lg"
                onClick={handleInstall}
                disabled={isInstalling}
                className="min-w-[180px] h-12"
              >
                {isInstalling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Instalando...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Instalar WordPress
                  </>
                )}
              </Button>
            </div>

            {isInstalling && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 p-6 bg-muted/30 rounded-lg border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="font-medium">Instalação em Progresso</span>
                </div>
                <Progress value={installationProgress} className="h-3" />
                <p className="text-sm text-muted-foreground">
                  {installationMessage} ({installationProgress}%)
                </p>
              </motion.div>
            )}
          </motion.div>
        );

      default:
        return null;
    }
  };

  if (!Array.isArray(domains) || domains.length === 0) {
    return (
      <div className="flex flex-col gap-4 items-end max-w-2xl mx-auto">
        <Card>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Nenhum domínio disponível</AlertTitle>
            <AlertDescription>
              Você não possui domínios registrados em sua conta ou todos os seus
              domínios já possuem WordPress instalado. Por favor,{" "}
              <Link
                href="/domain?tab=register"
                className="font-medium text-primary underline underline-offset-4"
              >
                registre um novo domínio
              </Link>{" "}
              ou verifique seus sites existentes.
            </AlertDescription>
          </Alert>
        </Card>
        <Button asChild>
          <Link href="/">Voltar à página inicial</Link>
        </Button>
      </div>
    );
  }

  if (isComplete) {
    startTransition(async () => {
      await changeSelectedDomain(null, formData.domain);
    });

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mx-auto border-0 shadow-xl">
          <CardContent className="pt-16 pb-16">
            <div className="text-center space-y-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="h-20 w-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg"
              >
                <Check className="h-10 w-10" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold mb-2">
                  Instalação Completa!
                </h2>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Seu site WordPress foi instalado com sucesso e está pronto
                  para uso.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                <Button
                  variant="outline"
                  size="lg"
                  asChild={true}
                  className="h-12 min-w-[200px]"
                >
                  <a
                    href="/wordpress"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Administrar seu novo site!
                  </a>
                </Button>
                <Button size="lg" asChild={true} className="h-12 min-w-[180px]">
                  <a
                    href={`https://${formData.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visitar seu Site
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-4xl mx-auto shadow-2xl bg-gradient-to-br from-background/80 via-background to-muted/30 backdrop-blur-xl border-border/50">
          <CardHeader className="text-center pb-8 pt-8">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="flex items-center justify-center gap-3 text-3xl font-bold mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <WholeWord className="h-6 w-6 text-white" />
                </div>
                Instalação WordPress
              </CardTitle>
              {renderCurrentStepHeader()}
            </motion.div>
          </CardHeader>
          <CardContent className="pt-6 pb-12 px-8">
            <AnimatePresence mode="popLayout">
              {renderStepIndicator()}
              {renderStep()}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>
      <Toaster />
    </>
  );
}

export enum WordPressPlugins {
  WooCommerce = "woocommerce",
  YoastSEO = "wordpress-seo",
  Askimet = "akismet",
  WPForms = "wpforms-lite",
  LiteSpeedCache = "litespeed-cache",
  WPOptimize = "wp-optimize",
  ReallySimpleSsl = "really-simple-ssl",
}

const recommendedPlugins = [
  {
    id: WordPressPlugins.WooCommerce,
    label: "WooCommerce - Plataforma de eCommerce",
    description: "Adicione uma loja online completa ao seu site",
  },
  {
    id: WordPressPlugins.Askimet,
    label: "Askimet",
    description:
      "A melhor proteção contra spam para bloquear comentários de spam e spam em um formulário de contato.",
  },
  {
    id: WordPressPlugins.YoastSEO,
    label: "Yoast SEO - Otimização para Motores de Busca",
    description: "Melhore a visibilidade do seu site nos motores de busca",
  },
  {
    id: WordPressPlugins.WPForms,
    label: "WPForms Lite - Formulários de Contato",
    description: "Adicione formulários de contato profissionais facilmente",
  },
  {
    id: WordPressPlugins.ReallySimpleSsl,
    label: "Really Simple SSL",
    description:
      "Melhore a segurança do seu site com Autenticação de Dois Fatores (2FA), Proteção de Login, Detecção de Vulnerabilidades e certificado SSL.",
  },
  {
    id: WordPressPlugins.LiteSpeedCache,
    label: "LiteSpeed Cache",
    description:
      "Aceleração imbatível e melhoria de PageSpeed: cache, otimização de imagem/CSS/JS.",
  },
  {
    id: WordPressPlugins.WPOptimize,
    label: "WP Optimize",
    description:
      "Melhore o desempenho do seu site com otimização de banco de dados e cache.",
  },
];
