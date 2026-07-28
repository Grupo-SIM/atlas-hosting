import { and, eq } from "drizzle-orm";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { type Organization, pgInvoice } from "@/lib/db/schema";
import { OrganizationSection } from "./components/OrganizationSection";
import { UserSection } from "./components/UserSection";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const user = await getUser();

  console.log("settings", user.settings);

  // Fetch recent invoices for wallet information
  const invoices = await db.query.pgInvoice.findMany({
    limit: 5,
    orderBy: (pgInvoice, { desc }) => [pgInvoice.createdAt],
    where: and(
      eq(pgInvoice.orgId, (user.organization as Organization).id),
      eq(pgInvoice.status, "paid")
    ),
  });

  const currentTab = params.tab ?? "user";

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="font-bold text-2xl tracking-tight md:text-3xl">
          Configurações
        </h1>
        <p className="mt-1 text-muted-foreground">
          Gerencie suas informações pessoais, organização e configurações da
          conta
        </p>
      </div>

      <Tabs className="space-y-6" value={params.tab ?? "user"}>
        <TabsList className="grid w-full grid-cols-2">
          <Link className="block w-full" href="/settings?tab=user">
            <TabsTrigger className="pointer-events-none w-full" value="user">
              Perfil
            </TabsTrigger>
          </Link>
          <Link className="block w-full" href="/settings?tab=organization">
            <TabsTrigger
              className="pointer-events-none w-full"
              value="organization"
            >
              Organização
            </TabsTrigger>
          </Link>
        </TabsList>

        {currentTab === "user" && (
          <TabsContent className="space-y-6" value="user">
            <UserSection user={user} />
          </TabsContent>
        )}

        {currentTab === "organization" && (
          <TabsContent className="space-y-6" value="organization">
            <OrganizationSection user={user} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
