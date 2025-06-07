import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgInvoice } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { OrganizationSection } from "./components/OrganizationSection";
import { SubscriptionSection } from "./components/SubscriptionSection";
import { UserSection } from "./components/UserSection";
import { WalletSection } from "./components/WalletSection";

export default async function SettingsPage({
  searchParams,
}: { searchParams: Promise<{ tab?: string }> }) {
  const params = await searchParams;
  const user = await getUser();

  // Fetch recent invoices for wallet information
  const invoices = await db.query.pgInvoice.findMany({
    where: and(
      eq(pgInvoice.orgId, user.organization.id),
      eq(pgInvoice.status, "paid")
    ),
    orderBy: (pgInvoice, { desc }) => [pgInvoice.createdAt],
    limit: 5,
  });

  const currentTab = params.tab ?? "user";

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Configurações
        </h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas informações pessoais, organização e configurações da
          conta
        </p>
      </div>

      <Tabs value={params.tab ?? "user"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <Link href="/settings?tab=user" className="block w-full">
            <TabsTrigger value="user" className="pointer-events-none w-full">
              Perfil
            </TabsTrigger>
          </Link>
          <Link href="/settings?tab=organization" className="block w-full">
            <TabsTrigger value="organization" className="pointer-events-none w-full">
              Organização
            </TabsTrigger>
          </Link>
          <Link href="/settings?tab=subscription" className="block w-full">
            <TabsTrigger value="subscription" className="pointer-events-none w-full">
              Assinatura
            </TabsTrigger>
          </Link>
          <Link href="/settings?tab=wallet" className="block w-full">
            <TabsTrigger value="wallet" className="pointer-events-none w-full">
              Carteira
            </TabsTrigger>
          </Link>
        </TabsList>

        {currentTab === "user" && (
          <TabsContent value="user" className="space-y-6">
            <UserSection user={user} />
          </TabsContent>
        )}

        {currentTab === "organization" && (
          <TabsContent value="organization" className="space-y-6">
            <OrganizationSection user={user} />
          </TabsContent>
        )}

        {currentTab === "subscription" && (
          <TabsContent value="subscription" className="space-y-6">
            <SubscriptionSection user={user} />
          </TabsContent>
        )}

        {currentTab === "wallet" && (
          <TabsContent value="wallet" className="space-y-6">
            <WalletSection user={user} invoices={invoices} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
