import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { SettingsContent } from "./components/SettingsContent";

export default async function SettingsPage() {
  const user = await getUser();

  // Fetch recent invoices for wallet information
  const invoices = await db.query.pgInvoice.findMany({
    where: eq(pgInvoice.orgId, user.organization.id),
    orderBy: (pgInvoice, { desc }) => [pgInvoice.createdAt],
    limit: 5,
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais, organização e configurações da conta
        </p>
      </div>

      <SettingsContent user={user} invoices={invoices} />
    </div>
  );
}
