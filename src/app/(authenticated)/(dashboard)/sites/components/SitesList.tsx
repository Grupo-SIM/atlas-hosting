"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Globe } from "lucide-react";
import { FaTimes } from "react-icons/fa";
import Link from "next/link";
import { CgSpinner } from "react-icons/cg";
import { useEffect, useState } from "react";
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
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface WordPressInstance {
  id: number;
  instanceId: number;
  name: string;
  domain: string;
  path: string;
  status: string;
  ready?: boolean;
}

interface SitesListProps {
  readyInstances: WordPressInstance[];
  processingInstances: WordPressInstance[];
}

export function SitesList({
  readyInstances: initialReady,
  processingInstances: initialProcessing,
}: SitesListProps) {
  const [readyInstances, setReadyInstances] =
    useState<WordPressInstance[]>(initialReady);
  const [processingInstances, setProcessingInstances] =
    useState<WordPressInstance[]>(initialProcessing);

  useEffect(() => {
    if (processingInstances.length === 0) return;
    const domains = processingInstances
      .map((instance) => instance.domain)
      .join(",");
    const es = new EventSource(`/api/check-dns?domains=${domains}`);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // data.domains is { [domain]: boolean }
      const newlyReady: WordPressInstance[] = [];
      const stillProcessing: WordPressInstance[] = [];
      processingInstances.forEach((instance) => {
        const isReady = data.domains[instance.domain] === true;
        if (isReady) {
          newlyReady.push({ ...instance, ready: true });
        } else {
          stillProcessing.push(instance);
        }
      });
      if (newlyReady.length > 0) {
        setReadyInstances((prev) => [...prev, ...newlyReady]);
        setProcessingInstances(stillProcessing);
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => {
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processingInstances.length]);

  const handleDelete = async (instance: WordPressInstance) => {
    try {
      const response = await fetch(`/api/sites/${instance.instanceId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete site");
      }

      // Remove the instance from both lists
      setReadyInstances((prev) => prev.filter((i) => i.id !== instance.id));
      setProcessingInstances((prev) =>
        prev.filter((i) => i.id !== instance.id)
      );

      toast({
        title: "Site excluído",
        description: "O site foi excluído com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao excluir site",
        description: "Não foi possível excluir o site. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (readyInstances.length === 0 && processingInstances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum Site Encontrado</CardTitle>
          <CardDescription>
            Você ainda não possui sites WordPress. Crie um novo site para
            começar.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const SiteCard = ({
    instance,
    isLoading,
  }: {
    instance: WordPressInstance;
    isLoading: boolean;
  }) => {
    // Remove trailing slash for /wp-admin link
    const baseUrl = instance.domain.replace(/\/$/, "");
    const redirectPath = `${baseUrl}/wp-admin/admin.php?page=elementor-app#onboarding/hello`;
    const adminUrl = `${baseUrl}/wp-login.php?redirect_to=${encodeURIComponent(redirectPath)}`;
    return (
      <Card key={instance.id}>
        <CardHeader className="relative">
          <div className="absolute right-4 top-4">
            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                  <AlertDialogTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      >
                        <FaTimes className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                  </AlertDialogTrigger>
                  <TooltipContent>Excluir Site</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Site</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tem certeza que deseja excluir o site {instance.name}? Esta
                    ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleDelete(instance)}>
                    Excluir
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {instance.name}
          </CardTitle>
          <CardDescription>{instance.domain}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <CgSpinner className="h-4 w-4 animate-spin" />
              <span>Em processamento</span>
            </div>
          ) : (
            <Button variant="outline" asChild className="w-full">
              <Link href={adminUrl} target="_blank" rel="noopener noreferrer">
                Editar Site
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-8">
      {readyInstances.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Sites Prontos</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {readyInstances.map((instance) => (
              <SiteCard
                key={instance.id}
                instance={instance}
                isLoading={false}
              />
            ))}
          </div>
        </div>
      )}

      {processingInstances.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">Sites em Processamento</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {processingInstances.map((instance) => (
              <SiteCard
                key={instance.id}
                instance={instance}
                isLoading={true}
              />
            ))}
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
