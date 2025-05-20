"use client";

import { useActionState, useEffect, useState } from "react";
import { createWordPressInstance } from "@/app/actions";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

const initialState: {
  message: string;
  error?: string;
  siteUrl?: string;
  adminUrl?: string;
} = {
  message: "",
};

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <Button type="submit" disabled={isPending} isLoading={isPending} className="w-full sm:w-auto">
      {isPending ? "Criando Instância..." : "Criar Site WordPress"}
    </Button>
  );
}

export function NewWordPressSiteForm({ domains }: { domains: string[] }) {
  const [state, formAction, isPending] = useActionState(createWordPressInstance, initialState);
  const { toast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState<string | undefined>(domains.length > 0 ? domains[0] : undefined);

  useEffect(() => {
    if (state?.message && !state.error && !state.siteUrl) { // Initial or pending state
      // Potentially a message from a previous attempt if not cleared, or initial empty message
    } else if (state?.error) {
      toast({
        variant: "destructive",
        title: "Erro ao Criar Site",
        description: state.message || state.error,
      });
    } else if (state?.siteUrl && state?.adminUrl) {
      toast({
        variant: "default",
        title: "Site WordPress Criado!",
        description: state.message || `Seu site ${state.siteUrl} está pronto.`,
      });
    }
  }, [state, toast]);

  if (domains.length === 0) {
    return (
      <CardContent>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Nenhum Domínio Encontrado</AlertTitle>
          <AlertDescription>
            Você não possui domínios registrados em sua conta que possam ser usados para criar um site WordPress.
            Por favor, <Link href="/domains/register" className="font-medium text-primary underline underline-offset-4">registre um domínio</Link> primeiro.
          </AlertDescription>
        </Alert>
      </CardContent>
    );
  }

  return (
    <form action={formAction}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="domainName">Selecione um Domínio</Label>
          <Select name="domainName" required value={selectedDomain} onValueChange={setSelectedDomain}>
            <SelectTrigger id="domainName">
              <SelectValue placeholder="Escolha um domínio" />
            </SelectTrigger>
            <SelectContent>
              {domains.map((domain) => (
                <SelectItem key={domain} value={domain}>
                  {domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {state?.siteUrl && state?.adminUrl && (
          <Alert variant="default">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Instalação Concluída!</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{state.message}</p>
              <p>
                <strong>URL do Site:</strong>{" "}
                <Link href={state.siteUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">
                  {state.siteUrl}
                </Link>
              </p>
              <p>
                <strong>URL de Admin:</strong>{" "}
                <Link href={state.adminUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-4">
                  {state.adminUrl}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground pt-2">
                Pode levar alguns minutos para que o site esteja totalmente acessível e o SSL seja provisionado.
              </p>
            </AlertDescription>
          </Alert>
        )}
        {state?.error && !state.siteUrl && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Falha na Instalação</AlertTitle>
            <AlertDescription>
              {state.message || state.error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        {!state?.siteUrl && <SubmitButton isPending={isPending} />}
        {state?.siteUrl && (
          <Button asChild className="w-full sm:w-auto">
            <Link href="/sites">Ver Meus Sites</Link>
          </Button>
        )}
      </CardFooter>
    </form>
  );
}
