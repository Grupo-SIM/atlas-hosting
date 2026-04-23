import { db } from "./src/lib/db";
import { pgDomainPricingCache } from "./src/lib/db/schema";
import { eq } from "drizzle-orm";

async function check() {
  const result = await db.query.pgDomainPricingCache.findFirst({
    where: eq(pgDomainPricingCache.tld, "com"),
  });
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

check();
