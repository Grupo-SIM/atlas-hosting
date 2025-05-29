"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { setupOrganization, setupOAuth } from "../actions";

interface OrganizationSetupProps {
  onSuccess?: () => void;
}

export function OrganizationSetup({ onSuccess }: OrganizationSetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await setupOrganization(formData);

      if (result.success) {
        setSuccess(true);
        onSuccess?.();
      } else {
        setError(result.error || "Failed to setup organization");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Organização Configurada!
          </CardTitle>
          <CardDescription>
            Sua organização foi criada com sucesso. Redirecionando...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurar Organização</CardTitle>
        <CardDescription>
          Você precisa configurar uma organização para gerenciar e-mails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>
            Para começar a gerenciar e-mails, vamos criar uma organização
            personalizada para você. Isso permitirá:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Gerenciar seus domínios de e-mail</li>
            <li>Criar e configurar contas de e-mail</li>
            <li>Controlar cotas e permissões</li>
            <li>Manter seus dados isolados e seguros</li>
          </ul>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Importante:</strong> Você precisará fornecer um domínio que
            será usado como domínio principal da sua organização. Certifique-se
            de que possui controle sobre este domínio.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryDomain">Domínio Principal</Label>
            <Input
              id="primaryDomain"
              name="primaryDomain"
              type="text"
              placeholder="exemplo.com"
              required
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              Digite o domínio que será usado como domínio principal da sua
              organização (ex: minhaempresa.com)
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Organização...
              </>
            ) : (
              "Criar Organização"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

interface OAuthSetupProps {
  onSetup?: () => void;
}

export function OAuthSetup({ onSetup }: OAuthSetupProps) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleOAuthSetup() {
    setIsLoading(true);
    onSetup?.();

    try {
      await setupOAuth();
    } catch (err) {
      // setupOAuth redirects, so this should not normally execute
      setIsLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Zoho Mail</CardTitle>
        <CardDescription>
          Configure sua integração com o Zoho Mail para gerenciar e-mails.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p>Para começar a usar o sistema de e-mail, você precisa:</p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Autorizar o acesso ao Zoho Mail</li>
            <li>Conectar seus domínios</li>
            <li>Configurar suas contas de e-mail</li>
          </ol>
        </div>

        <Button
          onClick={handleOAuthSetup}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Redirecionando...
            </>
          ) : (
            "Conectar com Zoho Mail"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
