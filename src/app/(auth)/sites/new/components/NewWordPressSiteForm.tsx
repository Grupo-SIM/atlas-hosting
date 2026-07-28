"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Globe,
  Loader2,
  Package,
  Settings,
  Terminal,
  WholeWord,
} from "lucide-react";
import Link from "next/link";
import { startTransition, useCallback, useRef, useState } from "react";
import { changeSelectedDomain } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import type { DomainsGetInfoCleanedResponse } from "@/lib/server/apis/namecheap/types";
import { cn } from "@/lib/utils";

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
    adminEmail: userEmail || "",
    adminPassword: "",
    adminUsername: "admin",
    domain: "",
    selectedPlugins: [],
    siteName: "",
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
    setFormData(prev => ({
      ...prev,
      selectedPlugins: prev.selectedPlugins.includes(pluginId)
        ? prev.selectedPlugins.filter(id => id !== pluginId)
        : [...prev.selectedPlugins, pluginId],
    }));
  };

  const handleInstall = useCallback(() => {
    if (!formData.domain) {
      toast({
        description: "Por favor, selecione um domínio.",
        title: "Erro",
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
        description:
          "Por favor, preencha todos os campos de configuração do site.",
        title: "Erro",
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
      admin_email: formData.adminEmail,
      admin_password: formData.adminPassword,
      admin_username: formData.adminUsername,
      domain: formData.domain,
      plugins: formData.selectedPlugins.join(","),
      site_name: formData.siteName,
    });

    const apiUrl = `/api/wp-install-w?${searchParams.toString()}`;

    eventSource.current = new EventSource(apiUrl);

    eventSource.current.onopen = () => {
      setInstallationMessage("Conexão estabelecida. Iniciando processo...");
      setInstallationProgress(5);
    };

    eventSource.current.onmessage = event => {
      const rawData = event.data as string;
      try {
        const parsedData = JSON.parse(rawData);
        const { type, message, error, details } = parsedData;

        setInstallationMessage(message || "Processando...");
        setInstallationProgress(prev => Math.min(95, prev + 10));

        if (type === "ERROR") {
          toast({
            description: error || details || "Ocorreu um erro.",
            title: message || "Erro na Instalação",
            variant: "destructive",
          });
          setIsInstalling(false);
          eventSource.current?.close();
        } else if (type === "SUCCESS") {
          setInstallationProgress(100);
          toast({
            description:
              message || "Seu site WordPress foi instalado com sucesso.",
            title: "Instalação Concluída!",
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
        setInstallationProgress(prev => Math.min(95, prev + 10));
      }
    };

    eventSource.current.onerror = _err => {
      toast({
        description:
          "Não foi possível conectar ao servidor para atualizações em tempo real.",
        title: "Erro de Conexão",
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
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 text-center"
      exit={{ opacity: 0, y: -20 }}
      initial={{ opacity: 0, y: 20 }}
      key={currentStep}
      layout
      transition={{ duration: 0.4 }}
    >
      <div className="mb-4 flex items-center justify-center gap-4">
        <motion.div
          animate={{
            scale: [1, 1.05, 1],
          }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10"
          transition={{
            duration: 2,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
          }}
        >
          <StepIcon step={currentStep} />
        </motion.div>
      </div>
      <h1 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text font-bold text-3xl text-transparent tracking-tight">
        {stepTitles[currentStep - 1]}
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
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
    <motion.div className="mb-8" layout>
      {/* Step Progress Bar */}
      <div className="relative mb-8">
        <div className="absolute top-6 left-0 h-0.5 w-full bg-gradient-to-r from-muted via-muted to-muted">
          <motion.div
            animate={{
              width: `${((currentStep - 1) / 2) * 100}%`,
            }}
            className="h-full rounded-full bg-gradient-to-r from-primary via-primary/80 to-primary"
            initial={{ width: "0%" }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </div>

        <div className="relative flex items-center justify-between">
          {[1, 2, 3].map(step => (
            <motion.div
              animate={{
                scale: step === currentStep ? 1.05 : 1,
              }}
              className="z-10 flex flex-col items-center"
              initial={false}
              key={step}
              transition={{ duration: 0.3 }}
            >
              {/* Step Circle */}
              <motion.div
                className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-full border-2 backdrop-blur-sm transition-all duration-500",
                  step === currentStep
                    ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-primary/20"
                    : step < currentStep
                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                      : "border-muted-foreground/30 bg-background/80 text-muted-foreground shadow-sm"
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="sync" propagate>
                  {step < currentStep ? (
                    <motion.div
                      animate={{ rotate: 0, scale: 1 }}
                      exit={{ rotate: 90, scale: 0 }}
                      initial={{ rotate: -90, scale: 0 }}
                      key="check"
                      layout
                      transition={{
                        duration: 0.3,
                        stiffness: 300,
                        type: "spring",
                      }}
                    >
                      <CheckCircle className="h-6 w-6" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      initial={{ opacity: 0, scale: 0 }}
                      key="icon"
                      layout
                      transition={{ duration: 0.2 }}
                    >
                      <StepIconSmall step={step} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Pulse effect for current step */}
                {step === currentStep && (
                  <motion.div
                    animate={{
                      opacity: [0.5, 0, 0.5],
                      scale: [1, 1.2, 1],
                    }}
                    className="absolute inset-0 rounded-full border-2 border-primary"
                    layout
                    transition={{
                      duration: 2,
                      ease: "easeInOut",
                      repeat: Number.POSITIVE_INFINITY,
                    }}
                  />
                )}
              </motion.div>

              {/* Step Label */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-center"
                initial={{ opacity: 0, y: 10 }}
                layout
                transition={{ delay: step * 0.1 }}
              >
                <div
                  className={cn(
                    "font-medium text-xs transition-colors",
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
                    "mt-1 max-w-20 text-xs transition-colors",
                    step === currentStep
                      ? "font-medium text-foreground"
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
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
            exit={{ opacity: 0, x: -50 }}
            initial={{ opacity: 0, x: 50 }}
            key="step-1"
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <Label
                      className="font-medium text-base"
                      htmlFor="domainName"
                    >
                      Nome do Domínio
                    </Label>
                    <Select
                      disabled={isInstalling}
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, domain: value }))
                      }
                      value={formData.domain}
                    >
                      <SelectTrigger
                        className="mt-2 h-14 text-base"
                        id="domainName"
                      >
                        <SelectValue placeholder="Selecione um domínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {domains.map(domain => (
                          <SelectItem
                            className="py-3"
                            disabled={domain.inPlesk || isInstalling}
                            key={domain.ID}
                            value={domain.DomainName}
                          >
                            <div className="flex items-center gap-3">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <span>{domain.DomainName}</span>
                              {domain.inPlesk && (
                                <span className="rounded-full bg-amber-100 px-2 py-1 text-amber-800 text-xs">
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
                className="h-12 min-w-[140px] text-base"
                disabled={!formData.domain || isInstalling}
                onClick={() => setCurrentStep(2)}
                size="lg"
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
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
            exit={{ opacity: 0, x: -50 }}
            initial={{ opacity: 0, x: 50 }}
            key="step-2"
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="space-y-6 p-8">
                <div className="space-y-2">
                  <Label className="font-medium text-base" htmlFor="siteName">
                    Nome do Site
                  </Label>
                  <Input
                    className={cn(
                      "mt-2 h-12 transition-all duration-200",
                      formErrors.siteName
                        ? "border-destructive focus:border-destructive"
                        : formData.siteName
                          ? "border-emerald-500 focus:border-emerald-500"
                          : ""
                    )}
                    disabled={isInstalling}
                    id="siteName"
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        siteName: e.target.value,
                      }));
                      if (formErrors.siteName) {
                        setFormErrors(prev => ({
                          ...prev,
                          siteName: undefined,
                        }));
                      }
                    }}
                    placeholder="Meu Site Incrível"
                    value={formData.siteName}
                  />
                  {formErrors.siteName && (
                    <motion.p
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 text-destructive text-sm"
                      initial={{ opacity: 0, y: -10 }}
                    >
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.siteName}
                    </motion.p>
                  )}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label
                      className="font-medium text-base"
                      htmlFor="adminUsername"
                    >
                      Usuário Admin
                    </Label>
                    <Input
                      className={cn(
                        "mt-2 h-12 transition-all duration-200",
                        formErrors.adminUsername
                          ? "border-destructive focus:border-destructive"
                          : formData.adminUsername &&
                              formData.adminUsername.length >= 3
                            ? "border-emerald-500 focus:border-emerald-500"
                            : ""
                      )}
                      disabled={isInstalling}
                      id="adminUsername"
                      onChange={e => {
                        setFormData(prev => ({
                          ...prev,
                          adminUsername: e.target.value,
                        }));
                        if (formErrors.adminUsername) {
                          setFormErrors(prev => ({
                            ...prev,
                            adminUsername: undefined,
                          }));
                        }
                      }}
                      placeholder="admin"
                      value={formData.adminUsername}
                    />
                    {formErrors.adminUsername && (
                      <motion.p
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-destructive text-sm"
                        initial={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.adminUsername}
                      </motion.p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      className="font-medium text-base"
                      htmlFor="adminPassword"
                    >
                      Senha do Admin
                    </Label>
                    <div className="relative">
                      <Input
                        className={cn(
                          "mt-2 h-12 transition-all duration-200",
                          formErrors.adminPassword
                            ? "border-destructive focus:border-destructive"
                            : formData.adminPassword &&
                                formData.adminPassword.length >= 6
                              ? "border-emerald-500 focus:border-emerald-500"
                              : ""
                        )}
                        disabled={isInstalling}
                        id="adminPassword"
                        onChange={e => {
                          setFormData(prev => ({
                            ...prev,
                            adminPassword: e.target.value,
                          }));
                          if (formErrors.adminPassword) {
                            setFormErrors(prev => ({
                              ...prev,
                              adminPassword: undefined,
                            }));
                          }
                        }}
                        placeholder="Senha forte"
                        type="password"
                        value={formData.adminPassword}
                      />
                      {formData.adminPassword && (
                        <motion.div
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute top-1/2 right-3 -translate-y-1/2"
                          initial={{ opacity: 0, scale: 0.9 }}
                        >
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full",
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
                        animate={{ height: "auto", opacity: 1 }}
                        className="space-y-1"
                        initial={{ height: 0, opacity: 0 }}
                      >
                        <div className="flex gap-1">
                          {[25, 50, 75, 100].map(threshold => (
                            <div
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
                              key={threshold}
                            />
                          ))}
                        </div>
                        <p className="text-muted-foreground text-xs">
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
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1 text-destructive text-sm"
                        initial={{ opacity: 0, y: -10 }}
                      >
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.adminPassword}
                      </motion.p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="font-medium text-base" htmlFor="adminEmail">
                    Email do Admin
                  </Label>
                  <Input
                    className={cn(
                      "mt-2 h-12 transition-all duration-200",
                      formErrors.adminEmail
                        ? "border-destructive focus:border-destructive"
                        : formData.adminEmail &&
                            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                              formData.adminEmail
                            )
                          ? "border-emerald-500 focus:border-emerald-500"
                          : ""
                    )}
                    disabled={isInstalling}
                    id="adminEmail"
                    onChange={e => {
                      setFormData(prev => ({
                        ...prev,
                        adminEmail: e.target.value,
                      }));
                      if (formErrors.adminEmail) {
                        setFormErrors(prev => ({
                          ...prev,
                          adminEmail: undefined,
                        }));
                      }
                    }}
                    placeholder="admin@example.com"
                    type="email"
                    value={formData.adminEmail}
                  />
                  {formErrors.adminEmail && (
                    <motion.p
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-1 text-destructive text-sm"
                      initial={{ opacity: 0, y: -10 }}
                    >
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.adminEmail}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="font-medium text-base">
                      Plugins Recomendados
                    </Label>
                    <p className="text-muted-foreground text-sm">
                      Selecione plugins para instalar automaticamente
                    </p>
                  </div>
                  <div className="grid gap-3 pt-2">
                    {recommendedPlugins.map((plugin, index) => (
                      <motion.div
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          "group relative cursor-pointer rounded-xl border border-border/50 p-4 transition-all duration-300 hover:border-primary/30 hover:shadow-md",
                          formData.selectedPlugins.includes(plugin.id)
                            ? "border-primary/50 bg-primary/5 ring-1 ring-primary/20"
                            : "bg-background hover:bg-muted/30"
                        )}
                        initial={{ opacity: 0, y: 20 }}
                        key={plugin.id}
                        onClick={() =>
                          !isInstalling && handlePluginToggle(plugin.id)
                        }
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start space-x-4">
                          <motion.div
                            animate={{
                              scale: formData.selectedPlugins.includes(
                                plugin.id
                              )
                                ? 1.1
                                : 1,
                            }}
                            className="relative mt-1"
                            transition={{ duration: 0.2 }}
                          >
                            <Checkbox
                              checked={formData.selectedPlugins.includes(
                                plugin.id
                              )}
                              className="transition-all duration-200"
                              disabled={isInstalling}
                              id={plugin.id}
                              onCheckedChange={() =>
                                handlePluginToggle(plugin.id)
                              }
                            />
                          </motion.div>
                          <div className="min-w-0 flex-1">
                            <label
                              className="cursor-pointer font-semibold text-sm leading-tight transition-colors group-hover:text-primary"
                              htmlFor={plugin.id}
                            >
                              {plugin.label}
                            </label>
                            <p className="mt-1 text-muted-foreground text-sm leading-relaxed">
                              {plugin.description}
                            </p>
                          </div>
                          {formData.selectedPlugins.includes(plugin.id) && (
                            <motion.div
                              animate={{ opacity: 1, scale: 1 }}
                              className="flex-shrink-0"
                              exit={{ opacity: 0, scale: 0 }}
                              initial={{ opacity: 0, scale: 0 }}
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <CheckCircle className="h-4 w-4 text-primary" />
                              </div>
                            </motion.div>
                          )}
                        </div>

                        {/* Selection indicator overlay */}
                        <motion.div
                          animate={{
                            opacity: formData.selectedPlugins.includes(
                              plugin.id
                            )
                              ? 1
                              : 0,
                          }}
                          className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 opacity-0"
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
                className="h-12 min-w-[120px]"
                disabled={isInstalling}
                onClick={() => setCurrentStep(1)}
                size="lg"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                className="h-12 min-w-[140px]"
                disabled={
                  !(
                    formData.siteName &&
                    formData.adminUsername &&
                    formData.adminPassword &&
                    formData.adminEmail
                  ) || isInstalling
                }
                onClick={() => {
                  if (validateForm()) {
                    setCurrentStep(3);
                  }
                }}
                size="lg"
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
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
            exit={{ opacity: 0, x: -50 }}
            initial={{ opacity: 0, x: 50 }}
            key="step-3"
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <div className="space-y-4">
                  {[
                    { icon: Globe, label: "Domínio", value: formData.domain },
                    {
                      icon: WholeWord,
                      label: "Nome do Site",
                      value: formData.siteName,
                    },
                    {
                      icon: Settings,
                      label: "Usuário Admin",
                      value: formData.adminUsername,
                    },
                    {
                      icon: Settings,
                      label: "Email Admin",
                      value: formData.adminEmail,
                    },
                    {
                      icon: Package,
                      label: "Plugins Selecionados",
                      value: `${formData.selectedPlugins.length} plugins`,
                    },
                  ].map((item, index, arr) => {
                    const IconComponent = item.icon;
                    return (
                      <div
                        className={`flex items-center justify-between py-4 ${
                          index < arr.length - 1
                            ? "border-border/50 border-b"
                            : ""
                        }`}
                        key={item.label}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-muted-foreground">
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
                className="h-12 min-w-[120px]"
                disabled={isInstalling}
                onClick={() => setCurrentStep(2)}
                size="lg"
                variant="outline"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Button>
              <Button
                className="h-12 min-w-[180px]"
                disabled={isInstalling}
                onClick={handleInstall}
                size="lg"
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
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 rounded-lg border border-border/50 bg-muted/30 p-6"
                initial={{ opacity: 0, y: 20 }}
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  <span className="font-medium">Instalação em Progresso</span>
                </div>
                <Progress className="h-3" value={installationProgress} />
                <p className="text-muted-foreground text-sm">
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
      <div className="mx-auto flex max-w-2xl flex-col items-end gap-4">
        <Card>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertTitle>Nenhum domínio disponível</AlertTitle>
            <AlertDescription>
              Você não possui domínios registrados em sua conta ou todos os seus
              domínios já possuem WordPress instalado. Por favor,{" "}
              <Link
                className="font-medium text-primary underline underline-offset-4"
                href="/domain?tab=register"
              >
                registre um novo domínio
              </Link>{" "}
              ou verifique seus sites existentes.
            </AlertDescription>
          </Alert>
        </Card>
        <Button asChild>
          <Link href="/home">Voltar ao painel</Link>
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
        animate={{ opacity: 1, scale: 1 }}
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mx-auto max-w-2xl border-0 shadow-xl">
          <CardContent className="pt-16 pb-16">
            <div className="space-y-6 text-center">
              <motion.div
                animate={{ scale: 1 }}
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg"
                initial={{ scale: 0 }}
                transition={{ delay: 0.2, stiffness: 200, type: "spring" }}
              >
                <Check className="h-10 w-10" />
              </motion.div>
              <div>
                <h2 className="mb-2 font-bold text-3xl">
                  Instalação Completa!
                </h2>
                <p className="mx-auto max-w-md text-lg text-muted-foreground">
                  Seu site WordPress foi instalado com sucesso e está pronto
                  para uso.
                </p>
              </div>
              <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
                <Button
                  asChild={true}
                  className="h-12 min-w-[200px]"
                  size="lg"
                  variant="outline"
                >
                  <a
                    href="/wordpress"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Administrar seu novo site!
                  </a>
                </Button>
                <Button asChild={true} className="h-12 min-w-[180px]" size="lg">
                  <a
                    href={`https://${formData.domain}`}
                    rel="noopener noreferrer"
                    target="_blank"
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
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="mx-auto max-w-4xl border-border/50 bg-gradient-to-br from-background/80 via-background to-muted/30 shadow-2xl backdrop-blur-xl">
          <CardHeader className="pt-8 pb-8 text-center">
            <motion.div
              animate={{ opacity: 1, scale: 1 }}
              initial={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="mb-8 flex items-center justify-center gap-3 font-bold text-3xl">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600">
                  <WholeWord className="h-6 w-6 text-white" />
                </div>
                Instalação WordPress
              </CardTitle>
              {renderCurrentStepHeader()}
            </motion.div>
          </CardHeader>
          <CardContent className="px-8 pt-6 pb-12">
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
    description: "Adicione uma loja online completa ao seu site",
    id: WordPressPlugins.WooCommerce,
    label: "WooCommerce - Plataforma de eCommerce",
  },
  {
    description:
      "A melhor proteção contra spam para bloquear comentários de spam e spam em um formulário de contato.",
    id: WordPressPlugins.Askimet,
    label: "Askimet",
  },
  {
    description: "Melhore a visibilidade do seu site nos motores de busca",
    id: WordPressPlugins.YoastSEO,
    label: "Yoast SEO - Otimização para Motores de Busca",
  },
  {
    description: "Adicione formulários de contato profissionais facilmente",
    id: WordPressPlugins.WPForms,
    label: "WPForms Lite - Formulários de Contato",
  },
  {
    description:
      "Melhore a segurança do seu site com Autenticação de Dois Fatores (2FA), Proteção de Login, Detecção de Vulnerabilidades e certificado SSL.",
    id: WordPressPlugins.ReallySimpleSsl,
    label: "Really Simple SSL",
  },
  {
    description:
      "Aceleração imbatível e melhoria de PageSpeed: cache, otimização de imagem/CSS/JS.",
    id: WordPressPlugins.LiteSpeedCache,
    label: "LiteSpeed Cache",
  },
  {
    description:
      "Melhore o desempenho do seu site com otimização de banco de dados e cache.",
    id: WordPressPlugins.WPOptimize,
    label: "WP Optimize",
  },
];
