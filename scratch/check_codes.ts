
import { db } from "../src/lib/db";
import { pgUser } from "../src/lib/db/schema";
import { isNull } from "drizzle-orm";

async function checkCodes() {
  const users = await db.query.pgUser.findMany();
  console.log("Current Users and Affiliate Codes:");
  users.forEach(u => {
    console.log(`${u.email}: ${u.affiliateCode || "NULL"}`);
  });
  process.exit(0);
}

checkCodes().catch(console.error);
