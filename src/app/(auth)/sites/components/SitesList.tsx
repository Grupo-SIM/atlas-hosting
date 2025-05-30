"use client";

import { deleteWordPressInstances } from "@/app/actions";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import {
  startTransition,
  useActionState,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { BulkActionButtons } from "./BulkActionsButton";
import { SiteCard } from "./SiteCard";
import type { ParsedWordPressInstance } from "../page";

export interface SitesListProps {
  readyInstances: ParsedWordPressInstance[];
  processingInstances: ParsedWordPressInstance[];
}

export function SitesList({
  readyInstances: initialReady,
  processingInstances: initialProcessing,
}: SitesListProps) {
  const [readyInstances, setReadyInstances] =
    useState<ParsedWordPressInstance[]>(initialReady);
  const [processingInstances, setProcessingInstances] =
    useState<ParsedWordPressInstance[]>(initialProcessing);
  const [selectedInstances, setSelectedInstances] = useState<number[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [state, doDelete, isPending] = useActionState(
    deleteWordPressInstances,
    {
      status: "idle",
      message: "",
    }
  );

  useEffect(() => {
    if (state.status === "success") {
      setSelectedInstances((prevInstances) => {
        setReadyInstances((prev) =>
          prev.filter((i) => !prevInstances.includes(i.id))
        );
        setProcessingInstances((prev) =>
          prev.filter((i) => !prevInstances.includes(i.id))
        );
        return [];
      });
      setIsBulkMode(false);
      toast({
        title: "Sites excluídos",
        description: state.message,
      });
    } else if (state.status === "error") {
      toast({
        title: "Erro ao excluir sites",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state]);

  useEffect(() => {
    if (processingInstances.length === 0) { return; }
    const domains = processingInstances
      .map((instance) => instance.domain)
      .join(",");
    const es = new EventSource(`/api/check-dns?domains=${domains}`);

    es.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const newlyReady: (ParsedWordPressInstance & { ready: boolean })[] = [];
      const stillProcessing: ParsedWordPressInstance[] = [];

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
  }, [processingInstances]);

  const handleDelete = useCallback(
    (instance: ParsedWordPressInstance) => {
      startTransition(() => {
        doDelete(instance.instanceId.toString());
      });
    },
    [doDelete]
  );

  const handleBulkDelete = useCallback(() => {
    if (selectedInstances.length === 0) { return; }

    startTransition(() => {
      doDelete(selectedInstances.join(","));
    });
  }, [doDelete, selectedInstances]);

  const toggleInstanceSelection = useCallback((instanceId: number) => {
    setSelectedInstances((prev) =>
      prev.includes(instanceId)
        ? prev.filter((id) => id !== instanceId)
        : [...prev, instanceId]
    );
  }, []);

  const toggleBulkMode = useCallback(() => {
    setIsBulkMode((prev) => !prev);
    setSelectedInstances([]);
  }, []);

  const bulkActionButtonsProps = useMemo(
    () => ({
      isBulkMode,
      selectedCount: selectedInstances.length,
      isPending,
      onToggleBulkMode: toggleBulkMode,
      onBulkDelete: handleBulkDelete,
    }),
    [
      isBulkMode,
      selectedInstances.length,
      isPending,
      toggleBulkMode,
      handleBulkDelete,
    ]
  );

  const siteCardProps = useCallback(
    (instance: ParsedWordPressInstance, isLoading: boolean) => ({
      instance,
      isLoading,
      isBulkMode,
      isPending,
      selectedInstances,
      onToggleSelection: toggleInstanceSelection,
      onDelete: handleDelete,
    }),
    [
      isBulkMode,
      isPending,
      selectedInstances,
      toggleInstanceSelection,
      handleDelete,
    ]
  );

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

  return (
    <div className="space-y-8">
      {readyInstances.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sites Prontos</h2>
            <BulkActionButtons {...bulkActionButtonsProps} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {readyInstances.map((instance) => (
              <SiteCard key={instance.id} {...siteCardProps(instance, false)} />
            ))}
          </div>
        </div>
      )}

      {processingInstances.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Sites em Processamento</h2>
            <BulkActionButtons {...bulkActionButtonsProps} />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {processingInstances.map((instance) => (
              <SiteCard key={instance.id} {...siteCardProps(instance, true)} />
            ))}
          </div>
        </div>
      )}
      <Toaster />
    </div>
  );
}
