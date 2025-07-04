import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgLog } from "@/lib/db/schema/tables/log";
import { pgUser } from "@/lib/db/schema/tables/user";
import { and, desc, eq } from "drizzle-orm";
import { OrganizationHeaderActions } from "./components/OrganizationHeaderActions";
import { OrganizationTabs } from "./components/OrganizationTabs";
import type { OrganizationPageParams } from "./types";

export default async function OrganizationPage({
  searchParams,
}: { searchParams: Promise<OrganizationPageParams> }) {
  const params = await searchParams;
  const user = await getUser();

  // Fetch audit logs for this organization
  const auditLogs = await db
    .select({
      log: pgLog,
      user: {
        id: pgUser.id,
        name: pgUser.name,
        email: pgUser.email,
      },
    })
    .from(pgLog)
    .where(and(eq(pgUser.organizationId, user.organizationId ?? "")))
    .orderBy(desc(pgLog.createdAt))
    .innerJoin(pgUser, eq(pgLog.userId, pgUser.id))
    .limit(10);

  return (
    <div className="p-6 space-y-6">
      <OrganizationHeaderActions
        organizationName={user.organization.name}
        organizationId={user.organizationId ?? ""}
        dialogOpen={params.action === "createMember"}
        searchParams={params}
      />
      <OrganizationTabs
        user={user}
        auditLogs={auditLogs}
        currentUserId={user.id}
        organizationId={user.organizationId ?? ""}
        isOwner={user.id === user.organization.ownerId}
      />
    </div>
  );
}
