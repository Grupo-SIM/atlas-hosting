"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  FileArchive,
  Globe,
  Loader2,
  Upload,
} from "lucide-react";
import { useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useToast } from "@/hooks/use-toast";
import type { OrganizationDomain } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

interface WordPressTransferFormProps {
  activeDomains: OrganizationDomain[];
  selectedDomain: OrganizationDomain | null;
  userEmail: string;
}

interface TransferFormData {
  domain: string;
  useSelectedDomain: boolean;
  file: File | null;
}

interface FormErrors {
  domain?: string;
  file?: string;
}

type TransferStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function WordPressTransferForm({
  activeDomains,
  selectedDomain,
  userEmail,
}: WordPressTransferFormProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<TransferFormData>({
    domain: selectedDomain?.domain || "",
    file: null,
    useSelectedDomain: true,
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [transferStatus, setTransferStatus] = useState<TransferStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [transferResult, setTransferResult] = useState<{
    siteUrl?: string;
    adminUrl?: string;
  } | null>(null);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};

    if (!formData.useSelectedDomain && !formData.domain) {
      errors.domain = "Selecione um domínio para continuar";
    }

    if (!formData.file) {
      errors.file = "Selecione o arquivo ZIP para fazer upload";
    } else if (!formData.file.name.toLowerCase().endsWith(".zip")) {
      errors.file = "Por favor, selecione apenas arquivos ZIP";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
      if (formErrors.file) {
        setFormErrors(prev => ({ ...prev, file: undefined }));
      }
    }
  };

  const simulateProgress = () => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 95) {
        setProgress(95);
        clearInterval(interval);
      } else {
        setProgress(currentProgress);
      }
    }, 800);
    return interval;
  };

  const handleTransfer = async () => {
    if (!validateForm()) {
      return;
    }

    setTransferStatus("uploading");
    setProgress(0);
    setStatusMessage("Fazendo upload do arquivo...");

    const progressInterval = simulateProgress();

    try {
      const targetDomain = formData.useSelectedDomain
        ? selectedDomain?.domain
        : formData.domain;

      if (!targetDomain || !formData.file) {
        throw new Error("Dados de transferência incompletos");
      }

      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append("file", formData.file);
      uploadData.append("domain", targetDomain);
      uploadData.append("userEmail", userEmail);

      setStatusMessage("Validando arquivo...");

      // Upload and process the WordPress site
      const response = await fetch("/api/wordpress/transfer", {
        body: uploadData,
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha na transferência");
      }

      const result = await response.json();

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Transferência concluída com sucesso!");
      setTransferStatus("success");
      setTransferResult({
        adminUrl: result.adminUrl,
        siteUrl: result.siteUrl,
      });

      toast({
        description: `Seu site WordPress foi transferido com sucesso para ${targetDomain}`,
        title: "Transferência Concluída",
      });
    } catch (error) {
      clearInterval(progressInterval);
      setTransferStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Erro inesperado durante a transferência"
      );

      toast({
        description:
          "Houve um problema ao transferir seu site WordPress. Tente novamente.",
        title: "Erro na Transferência",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      domain: selectedDomain?.domain || "",
      file: null,
      useSelectedDomain: true,
    });
    setFormErrors({});
    setTransferStatus("idle");
    setProgress(0);
    setStatusMessage("");
    setTransferResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isProcessing =
    transferStatus === "uploading" || transferStatus === "processing";

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Transferir Site WordPress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <AnimatePresence mode="wait">
          {transferStatus === "idle" && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              key="form"
            >
              {/* Domain Selection */}
              <div className="space-y-4">
                <Label className="font-medium text-base">
                  Domínio de Destino
                </Label>

                {selectedDomain && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        checked={formData.useSelectedDomain}
                        className="h-4 w-4 text-primary focus:ring-primary"
                        id="useSelected"
                        name="domainChoice"
                        onChange={() =>
                          setFormData(prev => ({
                            ...prev,
                            domain: selectedDomain.domain,
                            useSelectedDomain: true,
                          }))
                        }
                        type="radio"
                      />
                      <Label
                        className="flex cursor-pointer items-center gap-2"
                        htmlFor="useSelected"
                      >
                        <Globe className="h-4 w-4" />
                        Usar domínio selecionado:{" "}
                        <strong>{selectedDomain.domain}</strong>
                        <Badge
                          className="bg-green-500/10 text-green-700"
                          variant="default"
                        >
                          Atual
                        </Badge>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        checked={!formData.useSelectedDomain}
                        className="h-4 w-4 text-primary focus:ring-primary"
                        id="useOther"
                        name="domainChoice"
                        onChange={() =>
                          setFormData(prev => ({
                            ...prev,
                            domain: "",
                            useSelectedDomain: false,
                          }))
                        }
                        type="radio"
                      />
                      <Label className="cursor-pointer" htmlFor="useOther">
                        Escolher outro domínio
                      </Label>
                    </div>
                  </div>
                )}

                {(!formData.useSelectedDomain || !selectedDomain) && (
                  <div className="space-y-2">
                    <Select
                      onValueChange={value =>
                        setFormData(prev => ({ ...prev, domain: value }))
                      }
                      value={formData.domain}
                    >
                      <SelectTrigger
                        className={cn(
                          "w-full",
                          formErrors.domain && "border-destructive"
                        )}
                      >
                        <SelectValue placeholder="Selecione um domínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeDomains.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground text-sm">
                            <AlertCircle className="mx-auto mb-2 h-4 w-4" />
                            Nenhum domínio ativo encontrado
                          </div>
                        ) : (
                          activeDomains.map(domain => (
                            <SelectItem key={domain.id} value={domain.domain}>
                              <div className="flex w-full items-center justify-between">
                                <span>{domain.domain}</span>
                                <Badge
                                  className="bg-green-500/10 text-green-700"
                                  variant="default"
                                >
                                  Ativo
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.domain && (
                      <p className="text-destructive text-sm">
                        {formErrors.domain}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <Label className="font-medium text-base">
                  Arquivo de Exportação
                </Label>

                <div
                  className={cn(
                    "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                    formData.file
                      ? "border-green-300 bg-green-50/50 dark:bg-green-950/20"
                      : "border-border hover:border-primary/50",
                    formErrors.file && "border-destructive"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Input
                    accept=".zip"
                    className="hidden"
                    onChange={handleFileSelect}
                    ref={fileInputRef}
                    type="file"
                  />

                  {formData.file ? (
                    <div className="space-y-2">
                      <CheckCircle className="mx-auto h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-green-700">
                          Arquivo selecionado
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {formData.file.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileArchive className="mx-auto h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          Clique para selecionar arquivo ZIP
                        </p>
                        <p className="text-muted-foreground text-sm">
                          Arquivo gerado pelo plugin AtlasHosting Migrator
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {formErrors.file && (
                  <p className="text-destructive text-sm">{formErrors.file}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  disabled={isProcessing}
                  onClick={handleTransfer}
                  size="lg"
                >
                  {isProcessing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="mr-2 h-4 w-4" />
                  )}
                  Iniciar Transferência
                </Button>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              key="processing"
            >
              <div className="space-y-4">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <div>
                  <h3 className="font-semibold text-lg">Transferindo Site</h3>
                  <p className="text-muted-foreground">{statusMessage}</p>
                </div>
                <div className="space-y-2">
                  <Progress className="w-full" value={progress} />
                  <p className="text-muted-foreground text-sm">
                    {Math.round(progress)}% concluído
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {transferStatus === "success" && transferResult && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              key="success"
            >
              <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">
                  Transferência Concluída!
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Seu site WordPress foi transferido com sucesso. Você pode
                  acessá-lo nos links abaixo.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Button asChild variant="outline">
                  <a
                    href={transferResult.siteUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Ver Site
                  </a>
                </Button>

                <Button asChild>
                  <a
                    href={transferResult.adminUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Painel Admin
                  </a>
                </Button>
              </div>

              <Button className="w-full" onClick={resetForm} variant="ghost">
                Transferir Outro Site
              </Button>
            </motion.div>
          )}

          {transferStatus === "error" && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
              exit={{ opacity: 0, y: -20 }}
              initial={{ opacity: 0, y: 20 }}
              key="error"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro na Transferência</AlertTitle>
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  onClick={resetForm}
                  variant="outline"
                >
                  Tentar Novamente
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
