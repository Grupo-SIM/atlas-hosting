import { and, desc, eq } from "drizzle-orm";
import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgLog } from "@/lib/db/schema/tables/log";
import { pgUser } from "@/lib/db/schema/tables/user";
import { OrganizationHeaderActions } from "./components/OrganizationHeaderActions";
import { OrganizationTabs } from "./components/OrganizationTabs";
import type { OrganizationPageParams } from "./types";

export default async function OrganizationPage({
  searchParams,
}: {
  searchParams: Promise<OrganizationPageParams>;
}) {
  const params = await searchParams;
  const user = await getUser();

  // Fetch audit logs for this organization
  const auditLogs = await db
    .select({
      log: pgLog,
      user: {
        email: pgUser.email,
        id: pgUser.id,
        name: pgUser.name,
      },
    })
    .from(pgLog)
    .where(and(eq(pgUser.organizationId, user.organizationId ?? "")))
    .orderBy(desc(pgLog.createdAt))
    .innerJoin(pgUser, eq(pgLog.userId, pgUser.id))
    .limit(10);

  return (
    <div className="space-y-6 p-6">
      <OrganizationHeaderActions
        dialogOpen={params.action === "createMember"}
        organizationId={user.organizationId ?? ""}
        organizationName={user.organization.name}
        searchParams={params}
      />
      <OrganizationTabs
        auditLogs={auditLogs}
        currentUserId={user.id}
        isOwner={user.id === user.organization.ownerId}
        organizationId={user.organizationId ?? ""}
        user={user}
      />
    </div>
  );
}
