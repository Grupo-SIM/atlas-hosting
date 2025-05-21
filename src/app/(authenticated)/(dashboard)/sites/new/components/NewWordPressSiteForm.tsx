"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastProvider } from "@/components/ui/toast";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { ListDomainDomain } from "@/lib/server/apis/namesilo/types";
import { Terminal } from "lucide-react";
import Link from "next/link";
import { PropsWithChildren, useCallback, useRef, useState } from "react";
import { CgSpinner } from "react-icons/cg";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "./SubmitButton";

interface NewWordPressSiteFormProps {
  domains: (ListDomainDomain & { inPlesk: boolean })[];
}

export function NewWordPressSiteForm({ domains }: NewWordPressSiteFormProps) {
  const { toast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [siteName, setSiteName] = useState("");

  const eventSource = useRef<EventSource>(null);
  const [buttonLabel, setButtonLabel] = useState("Criar Site WordPress");

  const [isPending, setIsPending] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!adminUsername || !adminPassword || !siteName) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      setIsPending(true);

      if (eventSource.current) {
        return;
      }

      eventSource.current = new EventSource(
        `/api/wp-install?domain=${selectedDomain}&admin_username=${adminUsername}&admin_password=${adminPassword}&site_name=${encodeURIComponent(siteName)}`
      );

      eventSource.current.onmessage = (event) => {
        const data = event.data as string;
        const [type, message, error] = data.split(";");

        switch (type) {
          case "INFO":
            setButtonLabel(message);
            break;
          case "ERROR":
            setButtonLabel("Criar site WordPress");
            toast({
              title: message,
              description: error,
              variant: "destructive",
            });
            setIsPending(false);
            break;
          case "SUCCESS":
            setButtonLabel("Criar site WordPress");
            setIsPending(false);
            eventSource.current?.close();
            toast({
              title: "Instalação Concluída!",
              description: message,
              variant: "default",
            });
            break;
          default:
            setIsPending(false);
            eventSource.current?.close();
            toast({
              title: "Erro na Instalação",
              description: message,
              variant: "destructive",
            });
            break;
        }
      };
    },
    [selectedDomain, toast, adminUsername, adminPassword, siteName]
  );

  if (domains.length === 0) {
    return (
      <CardContent>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Nenhum Domínio Encontrado</AlertTitle>
          <AlertDescription>
            Você não possui domínios registrados em sua conta que possam ser
            usados para criar um site WordPress. Por favor,{" "}
            <Link
              href="/domains/register"
              className="font-medium text-primary underline underline-offset-4"
            >
              registre um domínio
            </Link>{" "}
            primeiro.
          </AlertDescription>
        </Alert>
      </CardContent>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="domainName">Selecione um Domínio</Label>
            <Select
              value={selectedDomain}
              onValueChange={(value) => setSelectedDomain(value)}
            >
              <SelectTrigger id="domainName">
                <SelectValue placeholder="Selecione um domínio" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem
                    key={domain.domain}
                    value={domain.domain}
                    disabled={domain.inPlesk}
                  >
                    {domain.domain}
                    {domain.inPlesk && " (WordPress já instalado)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteName">Título do Website</Label>
            <Input
              id="siteName"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              placeholder="Digite o título do seu website"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminUsername">Nome de Usuário do Admin</Label>
            <Input
              id="adminUsername"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="Admin"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword">Senha do Admin</Label>
            <Input
              id="adminPassword"
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Digite uma senha forte"
            />
          </div>

          {/* {state?.siteUrl && state?.adminUrl && (
          <Alert variant="default">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Instalação Concluída!</AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{state.message}</p>
              <p>
                <strong>URL do Site:</strong>{" "}
                <Link
                  href={state.siteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {state.siteUrl}
                </Link>
              </p>
              <p>
                <strong>URL de Admin:</strong>{" "}
                <Link
                  href={state.adminUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary underline underline-offset-4"
                >
                  {state.adminUrl}
                </Link>
              </p>
              <p className="text-xs text-muted-foreground pt-2">
                Pode levar alguns minutos para que o site esteja totalmente
                acessível e o SSL seja provisionado.
              </p>
            </AlertDescription>
          </Alert>
        )}
        {state?.error && !state.siteUrl && (
          <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Falha na Instalação</AlertTitle>
            <AlertDescription>{state.message || state.error}</AlertDescription>
          </Alert>
        )} */}
        </CardContent>
        <CardFooter>
          <SubmitButton
            domain={selectedDomain}
            adminUsername={adminUsername}
            adminPassword={adminPassword}
            siteName={siteName}
          />
        </CardFooter>
      </form>
      <Toaster />
    </>
  );
}
