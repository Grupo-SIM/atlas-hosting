"use client";

import { useState, useRef, startTransition } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileArchive,
  Globe,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { OrganizationDomain } from "@/lib/db/schema";
import { Badge } from "@/components/ui/badge";

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
    useSelectedDomain: true,
    file: null,
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
    } else if (!formData.file.name.toLowerCase().endsWith('.zip')) {
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
        method: "POST",
        body: uploadData,
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
        siteUrl: result.siteUrl,
        adminUrl: result.adminUrl,
      });

      toast({
        title: "Transferência Concluída",
        description: `Seu site WordPress foi transferido com sucesso para ${targetDomain}`,
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
        title: "Erro na Transferência",
        description: "Houve um problema ao transferir seu site WordPress. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      domain: selectedDomain?.domain || "",
      useSelectedDomain: true,
      file: null,
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

  const isProcessing = transferStatus === "uploading" || transferStatus === "processing";

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
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Domain Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Domínio de Destino</Label>
                
                {selectedDomain && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="useSelected"
                        name="domainChoice"
                        checked={formData.useSelectedDomain}
                        onChange={() => setFormData(prev => ({ 
                          ...prev, 
                          useSelectedDomain: true,
                          domain: selectedDomain.domain 
                        }))}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="useSelected" className="flex items-center gap-2 cursor-pointer">
                        <Globe className="h-4 w-4" />
                        Usar domínio selecionado: <strong>{selectedDomain.domain}</strong>
                        <Badge variant="default" className="bg-green-500/10 text-green-700">
                          Atual
                        </Badge>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="useOther"
                        name="domainChoice"
                        checked={!formData.useSelectedDomain}
                        onChange={() => setFormData(prev => ({ 
                          ...prev, 
                          useSelectedDomain: false,
                          domain: "" 
                        }))}
                        className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <Label htmlFor="useOther" className="cursor-pointer">
                        Escolher outro domínio
                      </Label>
                    </div>
                  </div>
                )}

                {(!formData.useSelectedDomain || !selectedDomain) && (
                  <div className="space-y-2">
                    <Select
                      value={formData.domain}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, domain: value }))}
                    >
                      <SelectTrigger className={cn(
                        "w-full",
                        formErrors.domain && "border-destructive"
                      )}>
                        <SelectValue placeholder="Selecione um domínio" />
                      </SelectTrigger>
                      <SelectContent>
                        {activeDomains.length === 0 ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4 mx-auto mb-2" />
                            Nenhum domínio ativo encontrado
                          </div>
                        ) : (
                          activeDomains.map((domain) => (
                            <SelectItem key={domain.id} value={domain.domain}>
                              <div className="flex items-center justify-between w-full">
                                <span>{domain.domain}</span>
                                <Badge variant="default" className="bg-green-500/10 text-green-700">
                                  Ativo
                                </Badge>
                              </div>
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {formErrors.domain && (
                      <p className="text-sm text-destructive">{formErrors.domain}</p>
                    )}
                  </div>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Arquivo de Exportação</Label>
                
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
                    formData.file 
                      ? "border-green-300 bg-green-50/50 dark:bg-green-950/20" 
                      : "border-border hover:border-primary/50",
                    formErrors.file && "border-destructive"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  {formData.file ? (
                    <div className="space-y-2">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto" />
                      <div>
                        <p className="font-medium text-green-700">Arquivo selecionado</p>
                        <p className="text-sm text-muted-foreground">{formData.file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <FileArchive className="h-8 w-8 text-muted-foreground mx-auto" />
                      <div>
                        <p className="font-medium">Clique para selecionar arquivo ZIP</p>
                        <p className="text-sm text-muted-foreground">
                          Arquivo gerado pelo plugin AtlasHosting Migrator
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {formErrors.file && (
                  <p className="text-sm text-destructive">{formErrors.file}</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleTransfer}
                  className="flex-1"
                  size="lg"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Iniciar Transferência
                </Button>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <div className="space-y-4">
                <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin" />
                <div>
                  <h3 className="text-lg font-semibold">Transferindo Site</h3>
                  <p className="text-muted-foreground">{statusMessage}</p>
                </div>
                <div className="space-y-2">
                  <Progress value={progress} className="w-full" />
                  <p className="text-sm text-muted-foreground">{Math.round(progress)}% concluído</p>
                </div>
              </div>
            </motion.div>
          )}

          {transferStatus === "success" && transferResult && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Alert className="border-green-200 bg-green-50/50 dark:bg-green-950/20">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800 dark:text-green-200">
                  Transferência Concluída!
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  Seu site WordPress foi transferido com sucesso. Você pode acessá-lo nos links abaixo.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" asChild>
                  <a href={transferResult.siteUrl} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Ver Site
                  </a>
                </Button>
                
                <Button asChild>
                  <a href={transferResult.adminUrl} target="_blank" rel="noopener noreferrer">
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Painel Admin
                  </a>
                </Button>
              </div>

              <Button variant="ghost" onClick={resetForm} className="w-full">
                Transferir Outro Site
              </Button>
            </motion.div>
          )}

          {transferStatus === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro na Transferência</AlertTitle>
                <AlertDescription>{statusMessage}</AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button variant="outline" onClick={resetForm} className="flex-1">
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
