"use client";

import { Check, CircleX, ExternalLink, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  cancelDomainTransfer,
  respondToDomainTransfer,
  type DomainTransferView,
} from "@/app/(auth)/domains/transfer-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { domainTransferStatusMessage } from "@/lib/server/domains/domain-transfer";

const statusLabel = {
  awaiting_source: "Aguardando origem",
  awaiting_target: "Aguardando destino",
  cancelled: "Cancelada",
  completed: "Concluída",
  expired: "Expirada",
  pending_both: "Aguardando confirmações",
  rejected: "Recusada",
} as const;

export function DomainTransferCard({
  transfer,
  viewerId,
}: {
  transfer: DomainTransferView;
  viewerId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const isSource = transfer.sourceUserId === viewerId;
  const isTarget = transfer.targetUserId === viewerId;
  const isOpen = [
    "pending_both",
    "awaiting_source",
    "awaiting_target",
  ].includes(transfer.status);
  const canAccept =
    isOpen &&
    ((transfer.status === "pending_both" && (isSource || isTarget)) ||
      (transfer.status === "awaiting_source" && isSource) ||
      (transfer.status === "awaiting_target" && isTarget));

  function run(action: "accept" | "cancel" | "reject") {
    startTransition(async () => {
      const result =
        action === "cancel"
          ? await cancelDomainTransfer(transfer.id)
          : await respondToDomainTransfer(transfer.id, action);
      toast({
        description: result.message,
        title: result.success ? "Sucesso" : "Não foi possível continuar",
        variant: result.success ? "default" : "destructive",
      });
      if (result.success) router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{transfer.domain}</p>
          <Badge variant="outline">{statusLabel[transfer.status]}</Badge>
        </div>
        <p className="text-muted-foreground text-sm">
          {domainTransferStatusMessage(
            transfer.status,
            viewerId,
            transfer.sourceUserId,
            transfer.targetUserId
          )}
        </p>
        {isOpen && (
          <p className="text-muted-foreground text-xs">
            Expira em {transfer.expiresAt.toLocaleDateString("pt-BR")}.
          </p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button asChild disabled={isPending} size="sm" variant="outline">
          <Link href={`/domains/transfers/${transfer.id}`}>
            <ExternalLink className="mr-2 h-4 w-4" /> Detalhes
          </Link>
        </Button>
        {canAccept && (
          <Button disabled={isPending} onClick={() => run("accept")} size="sm">
            <Check className="mr-2 h-4 w-4" /> Aceitar
          </Button>
        )}
        {isTarget && isOpen && (
          <Button
            disabled={isPending}
            onClick={() => run("reject")}
            size="sm"
            variant="outline"
          >
            <CircleX className="mr-2 h-4 w-4" /> Recusar
          </Button>
        )}
        {isSource && isOpen && (
          <Button
            disabled={isPending}
            onClick={() => run("cancel")}
            size="sm"
            variant="outline"
          >
            <X className="mr-2 h-4 w-4" /> Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}
