import { notFound } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getDomainTransferForUser } from "../../transfer-actions";
import { DomainTransferCard } from "../../components/DomainTransferCard";

export default async function DomainTransferDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUser();
  const transfer = await getDomainTransferForUser(id, user.id);
  if (!transfer) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight">Transferência de domínio</h1>
        <p className="mt-1 text-muted-foreground">
          A transferência só será concluída quando as duas contas confirmarem.
        </p>
      </div>
      <DomainTransferCard transfer={transfer} viewerId={user.id} />
    </div>
  );
}
