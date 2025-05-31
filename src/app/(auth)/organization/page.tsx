import { getUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pgLog } from "@/lib/db/schema/tables/log";
import { pgUser } from "@/lib/db/schema/tables/user";
import { pgOrganization } from "@/lib/db/schema/tables/organization";
import { eq, desc, and } from "drizzle-orm";
import { OrganizationTabs } from "./components/OrganizationTabs";
import { OrganizationHeaderActions } from "./components/OrganizationHeaderActions";

export default async function OrganizationPage() {
  const user = await getUser();

  // Fetch audit logs for this organization
  const auditLogs = await db.select({
    log: pgLog,
    user: {
      id: pgUser.id,
      name: pgUser.name,
      email: pgUser.email,
    },
  })
    .from(pgLog)
    .where(
      and(
        eq(pgUser.organizationId, user.organizationId)
      )
    )
    .orderBy(desc(pgLog.createdAt))
    .innerJoin(pgUser, eq(pgLog.userId, pgUser.id))
    .limit(10);

  return (
    <div className="p-6 space-y-6">
      <OrganizationHeaderActions organizationName={user.organization.name} />

      <OrganizationTabs
        organization={user.organization}
        members={user.organization.members}
        auditLogs={auditLogs}
      />
    </div>
  );
}
