import type { DomainTransferView } from "@/app/(auth)/domains/transfer-actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DomainTransferCard } from "./DomainTransferCard";

export function DomainTransfersPanel({
  transfers,
  userId,
}: {
  transfers: DomainTransferView[];
  userId: string;
}) {
  const pendingTransfers = transfers.filter(transfer =>
    ["pending_both", "awaiting_source", "awaiting_target"].includes(
      transfer.status
    )
  );
  if (pendingTransfers.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transferências de domínio</CardTitle>
        <CardDescription>
          Confirme, recuse ou acompanhe transferências entre contas Atlas.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {pendingTransfers.map(transfer => (
          <DomainTransferCard
            key={transfer.id}
            transfer={transfer}
            viewerId={userId}
          />
        ))}
      </CardContent>
    </Card>
  );
}
