import "dotenv/config";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pgOrganizationDomains } from "@/lib/db/schema";
import namecheapApi from "@/lib/server/apis/namecheap";

async function namecheapDomains() {
  const names = new Set<string>();
  let page = 1;
  let total = Number.POSITIVE_INFINITY;
  while (names.size < total) {
    const response = await namecheapApi.getList({ Page: page, PageSize: 100 });
    for (const domain of response.Domains) names.add(domain.Name.toLowerCase());
    total = response.Paging.TotalItems;
    if (response.Domains.length === 0) break;
    page += 1;
  }
  return names;
}

async function main() {
  const apply = process.argv.includes("--apply");
  const [domains, owned] = await Promise.all([
    db
      .select({
        domain: pgOrganizationDomains.domain,
        id: pgOrganizationDomains.id,
      })
      .from(pgOrganizationDomains),
    namecheapDomains(),
  ]);
  const atlasOwned = domains.filter(domain =>
    owned.has(domain.domain.toLowerCase())
  );
  const external = domains.filter(
    domain => !owned.has(domain.domain.toLowerCase())
  );

  console.log(
    JSON.stringify(
      {
        apply,
        atlasOwned: atlasOwned.length,
        external: external.length,
        total: domains.length,
      },
      null,
      2
    )
  );
  if (!apply) return;

  for (const domain of atlasOwned) {
    await db
      .update(pgOrganizationDomains)
      .set({
        connectionStatus: "migration_required",
        dnsMode: "legacy_plesk",
        registrarProvider: "namecheap",
      })
      .where(eq(pgOrganizationDomains.id, domain.id));
  }
  for (const domain of external) {
    await db
      .update(pgOrganizationDomains)
      .set({
        connectionStatus: "unmanaged",
        dnsMode: "external",
        registrarProvider: "external",
      })
      .where(eq(pgOrganizationDomains.id, domain.id));
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
