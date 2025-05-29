import { getUser } from "@/lib/auth";
import { DomainListItem } from "@/lib/server/apis/namecheap/types";
import { getUserDomainsWithNamecheap } from "@/lib/server/utils";
import { EmailPageClient } from "./components/EmailPageClient";
import { zohoMailApi } from "@/lib/server/apis/zoho";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";
import { pgZohoDomainOrganizations } from "@/lib/db/schema";
import { hashWithEncodeKey } from "@/lib/auth/scrypt";
import { generateRandomPassword } from "@/lib/utils";

export default async function EmailDashboardPage() {
  const user = await getUser();

  const domains = await getUserDomainsWithNamecheap(user.id);

  const selectedDomain = domains.find(
    (domain: DomainListItem) => domain.Name === user.selectedDomain
  );

  const zohoOrg = await linkZohoOrganization(user.selectedDomain!);

  const info = await zohoMailApi.getOrganizationInfo(zohoOrg);

  return <EmailPageClient domains={domains} selectedDomain={selectedDomain} />;
}

export async function linkZohoOrganization(domainName: string) {
  const user = await getUser();

  const existingOrg = await db.query.pgZohoDomainOrganizations.findFirst({
    where: and(
      eq(pgZohoDomainOrganizations.userId, user.id),
      eq(pgZohoDomainOrganizations.domainName, domainName)
    ),
  });

  if (existingOrg) {
    return existingOrg.zohoOrgId;
  }

  const password = generateRandomPassword(14);
  const hashedPassword = await hashWithEncodeKey(password);

  const childOrg = await zohoMailApi.createChildOrganization({
    domainName,
    password,
    emailId: `admin@${domainName}`,
    orgName: `${user.name.replace(/\s+/g, "").toLowerCase()}-atlas-org`,
    firstName: user.name.split(" ")[0] || "Admin",
    lastName: user.name.split(" ").slice(1).join(" ") || "User",
  });

  await db.insert(pgZohoDomainOrganizations).values({
    domainName,
    password: hashedPassword,
    userId: user.id,
    zohoOrgId: childOrg.zoid,
  });

  return childOrg.zoid;
}
