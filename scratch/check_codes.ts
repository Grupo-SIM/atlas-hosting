import { db } from "../src/lib/db";

async function checkCodes() {
  const users = await db.query.pgUser.findMany();
  console.log("Current Users and Affiliate Codes:");
  users.forEach(u => {
    console.log(`${u.email}: ${u.affiliateCode || "NULL"}`);
  });
  process.exit(0);
}

checkCodes().catch(console.error);
