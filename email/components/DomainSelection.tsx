"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, InfoIcon } from "lucide-react";
import { type DomainListItem } from "@/lib/server/apis/namecheap/types";
// import { setupOrganization } from "../actions";

interface DomainSelectionProps {
  userDomains: DomainListItem[];
  selectedDomain?: string;
}

export function DomainSelection({
  userDomains,
  selectedDomain,
}: DomainSelectionProps) {
  const router = useRouter();
  const [showOrgSetup, setShowOrgSetup] = useState(false);
  const [selectedOrganizationDomain, setSelectedOrganizationDomain] = useState<
    string | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDomainChange = (newDomain: string) => {
    router.push(`/email?domain=${encodeURIComponent(newDomain)}`);
  };

  const handleCreateOrganization = async () => {
    if (!selectedOrganizationDomain) {
      setError("Por favor, selecione um domínio para criar a organização");
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("primaryDomain", selectedOrganizationDomain);

    // try {
    //   const result = await setupOrganization(formData);

    //   if (result.success) {
    //     // Refresh the page to show the new organization
    //     router.refresh();
    //   } else {
    //     setError(result.error || "Falha ao configurar a organização");
    //   }
    // } catch (err) {
    //   setError("Ocorreu um erro inesperado");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  if (userDomains.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum domínio encontrado</CardTitle>
          <CardDescription>
            Você precisa ter domínios configurados para gerenciar e-mails.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para começar, registre ou transfira um domínio para sua conta. Você
            poderá então criar uma organização para gerenciar e-mails nesse
            domínio.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showOrgSetup) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Criar Organização de E-mail</CardTitle>
          <CardDescription>
            Configure uma organização no Zoho Mail para o domínio selecionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="orgDomainSelect" className="text-sm font-medium">
              Domínio para Organização
            </label>
            <Select
              value={selectedOrganizationDomain || ""}
              onValueChange={setSelectedOrganizationDomain}
            >
              <SelectTrigger id="orgDomainSelect" className="h-12">
                <SelectValue placeholder="Selecione um domínio" />
              </SelectTrigger>
              <SelectContent>
                {userDomains.map((domain) => (
                  <SelectItem key={domain.ID} value={domain.Name}>
                    {domain.Name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Cada domínio terá sua própria organização no Zoho Mail. Isso
              permitirá que você gerencie contas de e-mail específicas para esse
              domínio.
            </AlertDescription>
          </Alert>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setShowOrgSetup(false)}
            disabled={isLoading}
          >
            Voltar
          </Button>
          <Button
            onClick={handleCreateOrganization}
            disabled={isLoading || !selectedOrganizationDomain}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando Organização...
              </>
            ) : (
              "Criar Organização"
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecione um Domínio</CardTitle>
        <CardDescription>
          Escolha um domínio para gerenciar suas contas de e-mail
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="domainSelect" className="text-sm font-medium">
            Seus Domínios
          </label>
          <Select
            value={selectedDomain || ""}
            onValueChange={handleDomainChange}
          >
            <SelectTrigger id="domainSelect" className="h-12">
              <SelectValue placeholder="Selecione um domínio" />
            </SelectTrigger>
            <SelectContent>
              {userDomains.map((domain) => (
                <SelectItem key={domain.ID} value={domain.Name}>
                  {domain.Name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este domínio não possui uma organização no Zoho Mail. Você precisa
            criar uma organização para gerenciar e-mails neste domínio.
          </AlertDescription>
        </Alert>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => setShowOrgSetup(true)}>
          Criar Organização para este Domínio
        </Button>
      </CardFooter>
    </Card>
  );
}
