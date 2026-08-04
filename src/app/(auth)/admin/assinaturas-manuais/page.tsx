import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getManualSubscriptionsAction } from "./actions";
import { ManualSubscriptionsClient } from "./ManualSubscriptionsClient";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Assinaturas Manuais — Admin",
};

export default async function ManualSubscriptionsPage() {
  const admin = await getUser();
  if (!admin?.isAdmin) redirect("/home");

  const subscriptions = await getManualSubscriptionsAction();

  return (
    <div className="flex-1 space-y-6 p-4 pt-4 md:p-8 md:pt-6">
      <div>
        <h2 className="font-bold text-3xl tracking-tight">
          Assinaturas Manuais
        </h2>
        <p className="text-muted-foreground">
          Clientes lançados na mão, sem cobrança automática — controle de
          vigência e vencimento.
        </p>
      </div>

      <ManualSubscriptionsClient subscriptions={subscriptions} />
    </div>
  );
}
