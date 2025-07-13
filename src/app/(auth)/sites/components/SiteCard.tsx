"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { manageApplication } from "../actions";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Site {
  id: string;
  name: string;
  fqdn: string;
  status: string;
}

interface SiteCardProps {
  site: Site;
}

export function SiteCard({ site }: SiteCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAction = async (action: "start" | "stop" | "delete") => {
    setIsLoading(true);
    const result = await manageApplication(site.id, action);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Sucesso!",
        description: `Ação ${action} executada com sucesso.`,
      });
    } else {
      toast({
        title: "Erro!",
        description: result.error,
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{site.name}</CardTitle>
        <CardDescription>{site.fqdn}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500">
          Status: {site.status}
        </p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => handleAction("start")}
          disabled={isLoading}
        >
          {isLoading ? "Iniciando..." : "Iniciar"}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleAction("stop")}
          disabled={isLoading}
        >
          {isLoading ? "Parando..." : "Parar"}
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isLoading}>
              {isLoading ? "Excluindo..." : "Excluir"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente sua
                aplicação e removerá seus dados de nossos servidores.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleAction("delete")}
                disabled={isLoading}
              >
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}