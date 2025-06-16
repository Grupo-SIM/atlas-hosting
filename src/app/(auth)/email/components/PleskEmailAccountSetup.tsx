"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Mail, 
  Server, 
  Lock, 
  User, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react";
import { createPleskMailAccount } from "../actions";
import type { MailName } from "@/lib/server/apis/plesk-xml/types";

interface PleskEmailAccountSetupProps {
  domains: Array<{
    id: string;
    name: string;
    pleskId?: number;
    pleskSiteId?: number;
    status: string;
  }>;
  user: {
    id: string;
    name: string;
    email: string;
  };
  onAccountCreated: (account: MailName) => void;
  onCancel: () => void;
}

export function PleskEmailAccountSetup({ domains, user, onAccountCreated, onCancel }: PleskEmailAccountSetupProps) {
  const [isPending, startTransition] = useTransition();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState(user.name);
  const [quota, setQuota] = useState("1000");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const availableDomains = domains.filter(domain => domain.status === "active");
  const selectedDomainData = availableDomains.find(d => d.id === selectedDomain);

  const generatePassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(result);
    setConfirmPassword(result);
  };

  const validateStep1 = () => {
    return selectedDomain && username.trim().length >= 3;
  };

  const validateStep2 = () => {
    return password.length >= 8 && password === confirmPassword;
  };

  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    if (!validateStep1() || !validateStep2()) return;

    startTransition(async () => {
      try {
        setError("");
        
        const formData = new FormData();
        formData.append("username", username.trim());
        formData.append("password", password);
        formData.append("displayName", displayName.trim());
        formData.append("quota", quota);

        const result = await createPleskMailAccount(formData);
        
        if (result.success && result.data) {
          // Create a mock MailName object for the callback
          const newAccount: MailName = {
            id: Number.parseInt(result.data.id.toString()),
            name: username.trim(),
            site_id: 0, // Will be populated from the actual Plesk response
            site_name: selectedDomainData?.name || "",
            mailbox: {
              enabled: true,
              quota: Number.parseInt(quota) * 1024 * 1024, // Convert MB to bytes
            }
          };
          
          onAccountCreated(newAccount);
        } else {
          setError(result.error || "Erro ao criar conta de e-mail");
        }
      } catch (err) {
        setError("Erro inesperado ao criar conta de e-mail");
        console.error(err);
      }
    });
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Configuração Básica";
      case 2: return "Segurança";
      case 3: return "Confirmação";
      default: return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1: return "Escolha o domínio e nome de usuário para sua conta";
      case 2: return "Configure uma senha segura para sua conta";
      case 3: return "Revise as configurações antes de criar a conta";
      default: return "";
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Mail className="h-5 w-5" />
              <span>Nova Conta de E-mail</span>
            </CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </div>
          <Badge variant="outline">
            Passo {currentStep} de 3
          </Badge>
        </div>
        
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{getStepTitle()}</span>
            <span>{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <Progress value={(currentStep / 3) * 100} className="w-full" />
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Basic Configuration */}
        {currentStep === 1 && (
          <div className="space-y-4">
            {/* Domain Selection */}
            <div className="space-y-2">
              <Label htmlFor="domain">Domínio *</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um domínio" />
                </SelectTrigger>
                <SelectContent>
                  {availableDomains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4" />
                        <span>{domain.name}</span>
                        <Badge variant="secondary" className="text-xs">
                          Plesk
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableDomains.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum domínio disponível. Configure um domínio com Plesk primeiro.
                </p>
              )}
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário *</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""))}
                  placeholder="admin"
                  className="flex-1"
                />
                {selectedDomainData && (
                  <span className="text-sm text-muted-foreground">
                    @{selectedDomainData.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Apenas letras minúsculas, números, pontos, hífens e sublinhados
              </p>
              {username && selectedDomainData && (
                <div className="flex items-center space-x-2 p-2 bg-secondary rounded">
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {username}@{selectedDomainData.name}
                  </span>
                </div>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName">Nome de exibição</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="João Silva"
              />
              <p className="text-xs text-muted-foreground">
                Nome que aparecerá como remetente dos e-mails
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Security */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Senha *</Label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite uma senha segura"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button variant="outline" onClick={generatePassword}>
                  Gerar
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Mínimo 8 caracteres</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Uma letra maiúscula</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Um número</span>
                </div>
                <div className="flex items-center space-x-2 text-xs">
                  <div className={`w-2 h-2 rounded-full ${/[!@#$%^&*]/.test(password) ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <span>Um caractere especial</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha *</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Digite a senha novamente"
              />
              {confirmPassword && (
                <div className="flex items-center space-x-2 text-xs">
                  {password === confirmPassword ? (
                    <><CheckCircle2 className="h-4 w-4 text-green-500" /> <span className="text-green-600">Senhas coincidem</span></>
                  ) : (
                    <><AlertCircle className="h-4 w-4 text-red-500" /> <span className="text-red-600">Senhas não coincidem</span></>
                  )}
                </div>
              )}
            </div>

            {/* Quota */}
            <div className="space-y-2">
              <Label htmlFor="quota">Cota de armazenamento (MB)</Label>
              <Select value={quota} onValueChange={setQuota}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="500">500 MB</SelectItem>
                  <SelectItem value="1000">1 GB</SelectItem>
                  <SelectItem value="2000">2 GB</SelectItem>
                  <SelectItem value="5000">5 GB</SelectItem>
                  <SelectItem value="10000">10 GB</SelectItem>
                  <SelectItem value="-1">Ilimitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Revise as configurações abaixo antes de criar a conta de e-mail.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 p-4 border rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm">E-mail</h4>
                  <p className="text-sm text-muted-foreground">
                    {username}@{selectedDomainData?.name}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Nome de exibição</h4>
                  <p className="text-sm text-muted-foreground">{displayName}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Domínio</h4>
                  <p className="text-sm text-muted-foreground">{selectedDomainData?.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Cota</h4>
                  <p className="text-sm text-muted-foreground">
                    {quota === "-1" ? "Ilimitado" : `${quota} MB`}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-sm">Configurações de servidor</h4>
              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                <div>
                  <p><strong>IMAP:</strong> mail.{selectedDomainData?.name}:993 (SSL)</p>
                  <p><strong>SMTP:</strong> mail.{selectedDomainData?.name}:465 (SSL)</p>
                </div>
                <div>
                  <p><strong>Usuário:</strong> {username}@{selectedDomainData?.name}</p>
                  <p><strong>Senha:</strong> ••••••••</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack} disabled={isPending}>
                Voltar
              </Button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={onCancel} disabled={isPending}>
              Cancelar
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                onClick={handleNext} 
                disabled={
                  (currentStep === 1 && !validateStep1()) ||
                  (currentStep === 2 && !validateStep2())
                }
              >
                Próximo
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Criar Conta
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
