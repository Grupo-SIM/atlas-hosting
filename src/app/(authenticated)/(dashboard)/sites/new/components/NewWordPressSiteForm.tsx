// src/app/(authenticated)/(dashboard)/sites/new/components/NewWordPressSiteForm.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { type DomainListItem } from "@/lib/server/apis/namecheap/types"; // Import Namecheap DomainListItem
import { Terminal } from "lucide-react";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { SubmitButton } from "./SubmitButton";

interface NewWordPressSiteFormProps {
  domains: (DomainListItem & { inPlesk: boolean })[]; // Use DomainListItem from Namecheap
}

export function NewWordPressSiteForm({ domains }: NewWordPressSiteFormProps) {
  const { toast } = useToast();
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [siteName, setSiteName] = useState("");

  const eventSource = useRef<EventSource | null>(null); // Initialize with null
  const [buttonLabel, setButtonLabel] = useState("Criar Site WordPress");
  const [isPending, setIsPending] = useState(false);

  const onSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!selectedDomain) {
        toast({
          title: "Erro",
          description: "Por favor, selecione um domínio.",
          variant: "destructive",
        });
        return;
      }

      if (!adminUsername || !adminPassword || !siteName) {
        toast({
          title: "Erro",
          description: "Por favor, preencha todos os campos obrigatórios.",
          variant: "destructive",
        });
        return;
      }

      setIsPending(true);
      setButtonLabel("Processando...");

      if (eventSource.current) {
        eventSource.current.close(); // Close any existing connection
      }

      eventSource.current = new EventSource(
        `/api/wp-install?domain=${selectedDomain}&admin_username=${adminUsername}&admin_password=${adminPassword}&site_name=${encodeURIComponent(siteName)}`
      );

      eventSource.current.onopen = () => {
        // console.log("SSE connection opened.");
      };

      eventSource.current.onmessage = (event) => {
        const rawData = event.data as string;
        try {
          const parsedData = JSON.parse(rawData); // Assuming server sends JSON strings
          const { type, message, error, step, details } = parsedData;

          switch (type) {
            case "INFO":
              setButtonLabel(message || step || "Atualizando...");
              if (details) {
                //   console.log("SSE Info Details:", details);
              }
              break;
            case "ERROR":
              setButtonLabel("Criar site WordPress");
              toast({
                title: message || "Erro na Instalação",
                description: error || details || "Ocorreu um erro.",
                variant: "destructive",
              });
              setIsPending(false);
              eventSource.current?.close();
              break;
            case "SUCCESS":
              setButtonLabel("Criar site WordPress");
              setIsPending(false);
              eventSource.current?.close();
              toast({
                title: "Instalação Concluída!",
                description:
                  message || "Seu site WordPress foi instalado com sucesso.",
                variant: "default",
              });
              // Optionally redirect or update UI
              // window.location.href = "/sites";
              break;
            default:
              // console.log("SSE Unknown message type:", parsedData);
              setButtonLabel("Aguarde...");
              break;
          }
        } catch (e) {
          // console.error("Error parsing SSE message or non-JSON message:", rawData, e);
          // Fallback for plain text messages if any
          if (rawData.startsWith("SUCCESS:")) {
            setButtonLabel("Criar site WordPress");
            setIsPending(false);
            eventSource.current?.close();
            toast({
              title: "Instalação Concluída!",
              description: rawData.substring(8),
              variant: "default",
            });
          } else if (rawData.startsWith("ERROR:")) {
            setButtonLabel("Criar site WordPress");
            toast({
              title: "Erro na Instalação",
              description: rawData.substring(6),
              variant: "destructive",
            });
            setIsPending(false);
            eventSource.current?.close();
          } else {
            setButtonLabel(rawData || "Progresso...");
          }
        }
      };

      eventSource.current.onerror = (err) => {
        // console.error("EventSource failed:", err);
        toast({
          title: "Erro de Conexão",
          description:
            "Não foi possível conectar ao servidor para atualizações em tempo real.",
          variant: "destructive",
        });
        setIsPending(false);
        setButtonLabel("Criar Site WordPress");
        eventSource.current?.close();
      };
    },
    [selectedDomain, toast, adminUsername, adminPassword, siteName]
  );

  if (!Array.isArray(domains) || domains.length === 0) {
    return (
      <CardContent>
        <Alert>
          <Terminal className="h-4 w-4" />
          <AlertTitle>Nenhum Domínio Encontrado</AlertTitle>
          <AlertDescription>
            Você não possui domínios registrados em sua conta Namecheap que
            possam ser usados para criar um site WordPress. Por favor,{" "}
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
              disabled={isPending}
            >
              <SelectTrigger id="domainName">
                <SelectValue placeholder="Selecione um domínio" />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem
                    key={domain.ID} // Use domain.ID or domain.Name as key
                    value={domain.Name} // Use domain.Name for the value
                    disabled={domain.inPlesk || isPending}
                  >
                    {domain.Name}
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
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminUsername">Nome de Usuário do Admin</Label>
            <Input
              id="adminUsername"
              value={adminUsername}
              onChange={(e) => setAdminUsername(e.target.value)}
              placeholder="Admin"
              disabled={isPending}
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
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton
            domain={selectedDomain} // This component might need isPending prop too
            adminUsername={adminUsername}
            adminPassword={adminPassword}
            siteName={siteName}
            isPending={isPending} // Pass isPending to SubmitButton
            buttonLabel={buttonLabel} // Pass buttonLabel
          />
        </CardFooter>
      </form>
      <Toaster />
    </>
  );
}
