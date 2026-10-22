import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getDomainTransferForUser } from "../../transfer-actions";
import { DomainTransferCard } from "../../components/DomainTransferCard";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function confirmationLabel(acceptedAt: Date | null) {
  return acceptedAt
    ? `Confirmada em ${acceptedAt.toLocaleDateString("pt-BR")}`
    : "Aguardando confirmação";
}

export default async function DomainTransferDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const transfer = await getDomainTransferForUser(id, user.id);
  if (!transfer) notFound();

  const isOpen = [
    "pending_both",
    "awaiting_source",
    "awaiting_target",
  ].includes(transfer.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Transferência de domínio</h1>
        <p className="mt-1 text-muted-foreground">
          A transferência só será concluída quando as duas contas confirmarem.
        </p>
      </div>
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{transfer.domain}</CardTitle>
            <Badge variant="outline">
              {isOpen ? "Em andamento" : "Encerrada"}
            </Badge>
          </div>
          <CardDescription>
            {isOpen
              ? `A solicitação expira em ${transfer.expiresAt.toLocaleDateString("pt-BR")}.`
              : "Esta solicitação não aceita mais confirmações."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <p className="font-medium text-sm">Confirmações</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border p-4">
                <p className="font-medium">Conta de origem</p>
                <p className="text-muted-foreground text-sm">
                  {transfer.sourceName} · {transfer.sourceEmail}
                </p>
                <p className="mt-2 text-sm">
                  {confirmationLabel(transfer.sourceAcceptedAt)}
                </p>
              </div>
              <div className="rounded-md border p-4">
                <p className="font-medium">Conta de destino</p>
                <p className="text-muted-foreground text-sm">
                  {transfer.targetName} · {transfer.targetEmail}
                </p>
                <p className="mt-2 text-sm">
                  {confirmationLabel(transfer.targetAcceptedAt)}
                </p>
              </div>
            </div>
          </div>
          <Separator />
          <div>
            <p className="font-medium text-sm">Ações</p>
            <p className="mt-1 text-muted-foreground text-sm">
              Confirme a transferência ou cancele a solicitação, quando disponível.
            </p>
            <div className="mt-3">
              <DomainTransferCard
                showDetails={false}
                showSummary={false}
                transfer={transfer}
                viewerId={user.id}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
